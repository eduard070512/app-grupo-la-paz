/**
 * Importación masiva desde CSV (migración desde el sistema actual).
 * La usan tanto el panel de administración como el script `npm run importar`.
 *
 * Es idempotente: se puede correr varias veces con el mismo archivo.
 *  - Contratos: se identifican por numero_contrato (se crean o actualizan).
 *  - Clientes: por clave_cliente si viene; si no, por teléfono + nombre.
 *  - Pagos: por (contrato, folio); sin folio, por (contrato, fecha, monto).
 *  - Beneficiarios: por (contrato, nombre).
 */
import Papa from "papaparse";
import type { PrismaClient } from "@prisma/client";
import { normalizarContrato, normalizarTelefono, pesosACentavos, slugify } from "./formato";

export type TipoImportacion = "contratos" | "pagos" | "beneficiarios";
export type Reporte = { filas: number; creados: number; actualizados: number; omitidos: number; avisos: string[]; errores: { fila: number; mensaje: string }[] };

export const COLUMNAS: Record<TipoImportacion, { requeridas: string[]; opcionales: string[] }> = {
  contratos: {
    requeridas: ["numero_contrato", "casa_funeraria", "nombre_titular", "telefono", "plan", "fecha_contratacion", "monto_total", "frecuencia"],
    opcionales: ["email", "clave_cliente", "pago_inicial", "abono", "numero_abonos", "estatus", "notas"],
  },
  pagos: { requeridas: ["numero_contrato", "fecha", "monto"], opcionales: ["metodo", "folio"] },
  beneficiarios: { requeridas: ["numero_contrato", "nombre"], opcionales: ["parentesco", "fecha_nacimiento"] },
};

const FRECUENCIAS = ["SEMANAL", "QUINCENAL", "MENSUAL", "CONTADO"];
const ESTATUS = ["ACTIVO", "LIQUIDADO", "SUSPENDIDO", "CANCELADO", "UTILIZADO"];
const METODOS = ["EFECTIVO", "TRANSFERENCIA", "TARJETA", "DEPOSITO"];
const PARENTESCOS = ["TITULAR", "CONYUGE", "PADRE", "MADRE", "HIJO", "HIJA", "MASCOTA", "OTRO"];

const norm = (v: string) => slugify(v).replace(/-/g, "_").toUpperCase();

/** Acepta AAAA-MM-DD, DD/MM/AAAA y DD-MM-AAAA */
export function parsearFecha(v: string): Date | null {
  const t = v.trim();
  let m = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12);
  m = t.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (m) {
    const anio = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
    return new Date(anio, Number(m[2]) - 1, Number(m[1]), 12);
  }
  return null;
}

export function leerCsv(texto: string) {
  const r = Papa.parse<Record<string, string>>(texto.replace(/^﻿/, ""), {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (h) => slugify(h).replace(/-/g, "_"),
    transform: (v) => v.trim(),
  });
  return { filas: r.data, columnas: r.meta.fields ?? [] };
}

export async function importar(db: PrismaClient, tipo: TipoImportacion, texto: string): Promise<Reporte> {
  const { filas, columnas } = leerCsv(texto);
  const reporte: Reporte = { filas: filas.length, creados: 0, actualizados: 0, omitidos: 0, avisos: [], errores: [] };
  const faltan = COLUMNAS[tipo].requeridas.filter((c) => !columnas.includes(c));
  if (faltan.length) {
    reporte.errores.push({ fila: 1, mensaje: `Faltan columnas: ${faltan.join(", ")}` });
    return reporte;
  }

  const contratoId = new Map<string, string | null>();
  const buscarContrato = async (numero: string) => {
    if (!contratoId.has(numero)) contratoId.set(numero, (await db.contrato.findUnique({ where: { numero }, select: { id: true } }))?.id ?? null);
    return contratoId.get(numero)!;
  };

  if (tipo === "contratos") {
    const funerarias = await db.funeraria.findMany();
    const planes = new Map((await db.plan.findMany({ select: { id: true, codigo: true } })).map((p) => [p.codigo, p.id]));
    const buscarFuneraria = (v: string) => {
      const s = slugify(v);
      return funerarias.find((f) => f.slug === s || slugify(f.nombre) === s || slugify(f.nombre).includes(s));
    };

    for (const [i, f] of filas.entries()) {
      const fila = i + 2; // +1 encabezado, +1 base 1
      try {
        const numero = normalizarContrato(f.numero_contrato ?? "");
        const funeraria = buscarFuneraria(f.casa_funeraria ?? "");
        const telefono = normalizarTelefono(f.telefono ?? "");
        const fecha = parsearFecha(f.fecha_contratacion ?? "");
        const total = pesosACentavos(f.monto_total ?? "");
        const frecuencia = norm(f.frecuencia ?? "");
        const estatus = f.estatus ? norm(f.estatus) : "ACTIVO";
        const problemas = [
          !numero && "numero_contrato vacío",
          !funeraria && `casa_funeraria «${f.casa_funeraria}» no existe`,
          telefono.length !== 10 && `teléfono «${f.telefono}» no tiene 10 dígitos`,
          !f.nombre_titular && "nombre_titular vacío",
          !fecha && `fecha_contratacion «${f.fecha_contratacion}» inválida`,
          !(total > 0) && `monto_total «${f.monto_total}» inválido`,
          !FRECUENCIAS.includes(frecuencia) && `frecuencia «${f.frecuencia}» (usa ${FRECUENCIAS.join("/")})`,
          !ESTATUS.includes(estatus) && `estatus «${f.estatus}» (usa ${ESTATUS.join("/")})`,
        ].filter(Boolean);
        if (problemas.length) throw new Error(problemas.join("; "));

        // Plan: si el código no existe se crea inactivo para no perder el contrato
        const codigoPlan = f.plan.toUpperCase();
        let planId = planes.get(codigoPlan);
        if (!planId) {
          planId = (
            await db.plan.create({
              data: { codigo: codigoPlan, nombre: f.plan, categoria: "OTRO", resumen: "Plan importado del sistema anterior", precioCentavos: total, activo: false, funerariaId: funeraria!.id },
            })
          ).id;
          planes.set(codigoPlan, planId);
          reporte.avisos.push(`Se creó el plan «${codigoPlan}» (inactivo). Complétalo en el catálogo si aplica.`);
        }

        // Cliente
        const email = f.email ? f.email.toLowerCase() : undefined;
        const clave = f.clave_cliente || undefined;
        let cliente = clave
          ? await db.cliente.findUnique({ where: { claveExterna: clave } })
          : await db.cliente.findFirst({ where: { telefono, nombre: f.nombre_titular } });
        if (cliente) {
          cliente = await db.cliente.update({
            where: { id: cliente.id },
            data: { nombre: f.nombre_titular, telefono, ...(email && !cliente.email ? { email } : {}) },
          });
        } else {
          const emailLibre = email && !(await db.cliente.findUnique({ where: { email } }));
          cliente = await db.cliente.create({
            data: { nombre: f.nombre_titular, telefono, email: emailLibre ? email : null, claveExterna: clave, funerariaId: funeraria!.id },
          });
        }

        const datos = {
          clienteId: cliente.id,
          funerariaId: funeraria!.id,
          planId,
          fechaContratacion: fecha!,
          montoTotalCentavos: total,
          pagoInicialCentavos: f.pago_inicial ? pesosACentavos(f.pago_inicial) || 0 : 0,
          frecuencia,
          abonoCentavos: f.abono ? pesosACentavos(f.abono) || 0 : 0,
          numeroAbonos: f.numero_abonos ? Number(f.numero_abonos) || 0 : 0,
          estatus,
          notas: f.notas || null,
        };
        const existente = await db.contrato.findUnique({ where: { numero }, select: { id: true } });
        if (existente) {
          await db.contrato.update({ where: { id: existente.id }, data: datos });
          reporte.actualizados++;
        } else {
          await db.contrato.create({ data: { numero, ...datos } });
          reporte.creados++;
        }
      } catch (e) {
        reporte.errores.push({ fila, mensaje: (e as Error).message });
      }
    }
  }

  if (tipo === "pagos") {
    for (const [i, f] of filas.entries()) {
      const fila = i + 2;
      try {
        const numero = normalizarContrato(f.numero_contrato ?? "");
        const id = await buscarContrato(numero);
        const fecha = parsearFecha(f.fecha ?? "");
        const monto = pesosACentavos(f.monto ?? "");
        const metodo = f.metodo ? norm(f.metodo) : "EFECTIVO";
        const problemas = [
          !id && `contrato «${numero}» no existe (importa primero contratos)`,
          !fecha && `fecha «${f.fecha}» inválida`,
          !(monto > 0) && `monto «${f.monto}» inválido`,
          !METODOS.includes(metodo) && `metodo «${f.metodo}» (usa ${METODOS.join("/")})`,
        ].filter(Boolean);
        if (problemas.length) throw new Error(problemas.join("; "));
        const folio = f.folio || null;
        const duplicado = folio
          ? await db.pago.findUnique({ where: { contratoId_folio: { contratoId: id!, folio } } })
          : await db.pago.findFirst({ where: { contratoId: id!, fecha: fecha!, montoCentavos: monto } });
        if (duplicado) {
          reporte.omitidos++;
          continue;
        }
        await db.pago.create({ data: { contratoId: id!, fecha: fecha!, montoCentavos: monto, metodo, folio, registradoPor: "importación" } });
        reporte.creados++;
      } catch (e) {
        reporte.errores.push({ fila, mensaje: (e as Error).message });
      }
    }
  }

  if (tipo === "beneficiarios") {
    for (const [i, f] of filas.entries()) {
      const fila = i + 2;
      try {
        const numero = normalizarContrato(f.numero_contrato ?? "");
        const id = await buscarContrato(numero);
        const parentesco = f.parentesco ? norm(f.parentesco) : "OTRO";
        const nacimiento = f.fecha_nacimiento ? parsearFecha(f.fecha_nacimiento) : null;
        const problemas = [
          !id && `contrato «${numero}» no existe`,
          !f.nombre && "nombre vacío",
          !PARENTESCOS.includes(parentesco) && `parentesco «${f.parentesco}» (usa ${PARENTESCOS.join("/")})`,
          f.fecha_nacimiento && !nacimiento && `fecha_nacimiento «${f.fecha_nacimiento}» inválida`,
        ].filter(Boolean);
        if (problemas.length) throw new Error(problemas.join("; "));
        const existe = await db.beneficiario.findFirst({ where: { contratoId: id!, nombre: f.nombre } });
        if (existe) {
          await db.beneficiario.update({ where: { id: existe.id }, data: { parentesco, fechaNacimiento: nacimiento } });
          reporte.actualizados++;
        } else {
          await db.beneficiario.create({ data: { contratoId: id!, nombre: f.nombre, parentesco, fechaNacimiento: nacimiento } });
          reporte.creados++;
        }
      } catch (e) {
        reporte.errores.push({ fila, mensaje: (e as Error).message });
      }
    }
  }

  reporte.avisos = [...new Set(reporte.avisos)];
  return reporte;
}
