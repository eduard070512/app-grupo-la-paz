"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { normalizarContrato, normalizarTelefono, pesosACentavos, slugify } from "@/lib/formato";
import { importar, type Reporte, type TipoImportacion } from "@/lib/importacion";
import { bloqueado, hashContrasena, MENSAJE_BLOQUEO, registrarIntento, validarContrasena, verificarContrasena } from "@/lib/seguridad";
import { cerrarSesion, iniciarSesion, requerirSesion } from "@/lib/sesion";
import { parsearFecha } from "@/lib/importacion";

export type Estado = { error?: string; ok?: string } | undefined;
const s = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const admin = () => requerirSesion("admin");

export async function entrar(_: Estado, f: FormData): Promise<Estado> {
  const email = s(f, "email").toLowerCase();
  const clave = `admin:${email}`;
  if (await bloqueado(clave)) return { error: MENSAJE_BLOQUEO };
  const a = await db.admin.findUnique({ where: { email } });
  if (!a || !(await verificarContrasena(s(f, "contrasena"), a.passwordHash))) {
    await registrarIntento(clave, false);
    return { error: "Credenciales incorrectas." };
  }
  await registrarIntento(clave, true);
  await db.admin.update({ where: { id: a.id }, data: { ultimoAcceso: new Date() } });
  await iniciarSesion("admin", a.id, a.nombre);
  redirect("/admin");
}

export async function salir() {
  await cerrarSesion("admin");
  redirect("/admin/entrar");
}

// ───────────── Clientes y contratos ─────────────
export async function crearContrato(_: Estado, f: FormData): Promise<Estado> {
  await admin();
  const numero = normalizarContrato(s(f, "numero"));
  const telefono = normalizarTelefono(s(f, "telefono"));
  const fecha = parsearFecha(s(f, "fecha"));
  const total = pesosACentavos(s(f, "total"));
  if (!numero || !s(f, "nombre") || telefono.length !== 10 || !fecha || !(total > 0)) {
    return { error: "Revisa número de contrato, nombre, teléfono (10 dígitos), fecha y monto total." };
  }
  if (await db.contrato.findUnique({ where: { numero } })) return { error: `El contrato ${numero} ya existe.` };
  const plan = await db.plan.findUnique({ where: { id: s(f, "planId") } });
  if (!plan) return { error: "Selecciona un plan." };

  let cliente = await db.cliente.findFirst({ where: { telefono, nombre: s(f, "nombre") } });
  cliente ??= await db.cliente.create({
    data: { nombre: s(f, "nombre"), telefono, email: s(f, "email").toLowerCase() || null, funerariaId: s(f, "funerariaId") },
  });
  const contrato = await db.contrato.create({
    data: {
      numero,
      clienteId: cliente.id,
      planId: plan.id,
      funerariaId: s(f, "funerariaId"),
      fechaContratacion: fecha,
      montoTotalCentavos: total,
      pagoInicialCentavos: pesosACentavos(s(f, "inicial") || "0") || 0,
      frecuencia: s(f, "frecuencia"),
      abonoCentavos: pesosACentavos(s(f, "abono") || "0") || 0,
      numeroAbonos: Number(s(f, "numeroAbonos")) || 0,
    },
  });
  if (contrato.pagoInicialCentavos > 0 && f.get("inicialPagado") === "on") {
    await db.pago.create({ data: { contratoId: contrato.id, fecha, montoCentavos: contrato.pagoInicialCentavos, folio: `${numero}-INI`, registradoPor: "admin" } });
  }
  redirect(`/admin/clientes/${cliente.id}`);
}

export async function actualizarCliente(_: Estado, f: FormData): Promise<Estado> {
  await admin();
  const id = s(f, "id");
  const telefono = normalizarTelefono(s(f, "telefono"));
  if (telefono.length !== 10) return { error: "El teléfono debe tener 10 dígitos." };
  const email = s(f, "email").toLowerCase() || null;
  if (email && (await db.cliente.findFirst({ where: { email, NOT: { id } } }))) return { error: "Ese correo ya lo usa otro cliente." };
  await db.cliente.update({ where: { id }, data: { nombre: s(f, "nombre"), telefono, email } });
  revalidatePath(`/admin/clientes/${id}`);
  return { ok: "Datos guardados." };
}

/** Borra la contraseña para que el cliente vuelva a activar con contrato + teléfono */
export async function reiniciarAcceso(f: FormData) {
  await admin();
  const id = s(f, "id");
  await db.cliente.update({ where: { id }, data: { passwordHash: null, activadoEn: null } });
  revalidatePath(`/admin/clientes/${id}`);
}

export async function registrarPago(_: Estado, f: FormData): Promise<Estado> {
  const a = await admin();
  const contratoId = s(f, "contratoId");
  const fecha = parsearFecha(s(f, "fecha"));
  const monto = pesosACentavos(s(f, "monto"));
  if (!fecha || !(monto > 0)) return { error: "Fecha y monto son obligatorios." };
  const folio = s(f, "folio") || null;
  if (folio && (await db.pago.findUnique({ where: { contratoId_folio: { contratoId, folio } } }))) return { error: `El folio ${folio} ya está registrado.` };
  const c = await db.contrato.findUniqueOrThrow({ where: { id: contratoId }, include: { pagos: { select: { montoCentavos: true } } } });
  await db.pago.create({ data: { contratoId, fecha, montoCentavos: monto, metodo: s(f, "metodo") || "EFECTIVO", folio, registradoPor: a.nombre } });
  const pagado = c.pagos.reduce((t, p) => t + p.montoCentavos, 0) + monto;
  if (pagado >= c.montoTotalCentavos && c.estatus === "ACTIVO") await db.contrato.update({ where: { id: contratoId }, data: { estatus: "LIQUIDADO" } });
  revalidatePath(`/admin/clientes/${c.clienteId}`);
  return { ok: "Pago registrado." };
}

export async function eliminarPago(f: FormData) {
  await admin();
  const p = await db.pago.delete({ where: { id: s(f, "id") }, include: { contrato: true } });
  revalidatePath(`/admin/clientes/${p.contrato.clienteId}`);
}

export async function cambiarEstatusContrato(f: FormData) {
  await admin();
  const c = await db.contrato.update({ where: { id: s(f, "id") }, data: { estatus: s(f, "estatus") } });
  revalidatePath(`/admin/clientes/${c.clienteId}`);
}

// ───────────── Empresas ─────────────
export async function guardarEmpresa(_: Estado, f: FormData): Promise<Estado> {
  await admin();
  const id = s(f, "id");
  const usuario = s(f, "usuario").toLowerCase();
  const contrasena = s(f, "contrasena");
  if (!s(f, "nombre") || !/^[a-z0-9._-]{4,}$/.test(usuario)) return { error: "Nombre obligatorio; usuario de al menos 4 caracteres (minúsculas, números, punto o guion)." };
  if (await db.empresa.findFirst({ where: { usuario, ...(id ? { NOT: { id } } : {}) } })) return { error: "Ese usuario ya existe." };
  if (!id || contrasena) {
    const err = validarContrasena(contrasena);
    if (err) return { error: err };
  }
  const datos = {
    nombre: s(f, "nombre"),
    usuario,
    giro: s(f, "giro") || null,
    descripcion: s(f, "descripcion") || null,
    logoUrl: s(f, "logoUrl") || null,
    telefono: normalizarTelefono(s(f, "telefono")) || null,
    sitioWeb: s(f, "sitioWeb") || null,
    direccion: s(f, "direccion") || null,
    descuentoEmpleados: Math.min(100, Math.max(0, Number(s(f, "descuento")) || 0)),
    ofertaClientes: s(f, "ofertaClientes") || null,
    visibleDirectorio: f.get("visibleDirectorio") === "on",
    activa: f.get("activa") === "on",
    ...(contrasena ? { passwordHash: await hashContrasena(contrasena) } : {}),
  };
  if (id) {
    await db.empresa.update({ where: { id }, data: datos });
  } else {
    let slug = slugify(datos.nombre);
    if (await db.empresa.findUnique({ where: { slug } })) slug = `${slug}-${Date.now().toString(36)}`;
    await db.empresa.create({ data: { ...datos, slug, passwordHash: datos.passwordHash! } });
  }
  revalidatePath("/admin/empresas");
  redirect("/admin/empresas");
}

// ───────────── Promociones ─────────────
export async function guardarPromocion(_: Estado, f: FormData): Promise<Estado> {
  await admin();
  if (!s(f, "titulo") || !s(f, "descripcion")) return { error: "Título y descripción son obligatorios." };
  const hasta = s(f, "vigenteHasta") ? parsearFecha(s(f, "vigenteHasta")) : null;
  await db.promocion.create({
    data: {
      titulo: s(f, "titulo"),
      descripcion: s(f, "descripcion"),
      imagenUrl: s(f, "imagenUrl") || null,
      audiencia: s(f, "audiencia") || "TODOS",
      vigenteHasta: hasta,
      orden: Number(s(f, "orden")) || 0,
    },
  });
  revalidatePath("/admin/promociones");
  return { ok: "Promoción publicada." };
}

export async function alternarPromocion(f: FormData) {
  await admin();
  const p = await db.promocion.findUniqueOrThrow({ where: { id: s(f, "id") } });
  await db.promocion.update({ where: { id: p.id }, data: { activa: !p.activa } });
  revalidatePath("/admin/promociones");
}

export async function eliminarPromocion(f: FormData) {
  await admin();
  await db.promocion.delete({ where: { id: s(f, "id") } });
  revalidatePath("/admin/promociones");
}

// ───────────── Solicitudes ─────────────
export async function cambiarEstatusSolicitud(f: FormData) {
  await admin();
  await db.solicitud.update({ where: { id: s(f, "id") }, data: { estatus: s(f, "estatus") } });
  revalidatePath("/admin/solicitudes");
  revalidatePath("/admin");
}

// ───────────── Importación ─────────────
export async function importarArchivo(_: { reporte?: Reporte; error?: string } | undefined, f: FormData) {
  await admin();
  const tipo = s(f, "tipo") as TipoImportacion;
  const archivo = f.get("archivo");
  if (!(archivo instanceof File) || archivo.size === 0) return { error: "Selecciona un archivo CSV." };
  if (!["contratos", "pagos", "beneficiarios"].includes(tipo)) return { error: "Tipo de importación inválido." };
  const reporte = await importar(db, tipo, await archivo.text());
  revalidatePath("/admin");
  return { reporte };
}
