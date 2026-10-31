"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { normalizarTelefono } from "@/lib/formato";
import { enviarEventoN8n } from "@/lib/n8n";
import { bloqueado, MENSAJE_BLOQUEO, registrarIntento, verificarContrasena } from "@/lib/seguridad";
import { errorDeConfiguracion } from "@/lib/sesion-token";
import { cerrarSesion, iniciarSesion, requerirSesion } from "@/lib/sesion";
import { linkWhatsApp } from "@/lib/whatsapp";

export type Estado = { error?: string; url?: string } | undefined;
const s = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

export async function entrar(_: Estado, f: FormData): Promise<Estado> {
  const config = errorDeConfiguracion();
  if (config) return { error: config };
  const usuario = s(f, "usuario").toLowerCase();
  const clave = `empresa:${usuario}`;
  if (await bloqueado(clave)) return { error: MENSAJE_BLOQUEO };
  const empresa = await db.empresa.findUnique({ where: { usuario } });
  if (!empresa || !empresa.activa || !(await verificarContrasena(s(f, "contrasena"), empresa.passwordHash))) {
    await registrarIntento(clave, false);
    return { error: "Usuario o contraseña incorrectos. Pide los datos de acceso a Recursos Humanos de tu empresa." };
  }
  await registrarIntento(clave, true);
  await db.empresa.update({ where: { id: empresa.id }, data: { ultimoAcceso: new Date() } });
  await iniciarSesion("empresa", empresa.id, empresa.nombre);
  redirect("/empresas");
}

export async function salir() {
  await cerrarSesion("empresa");
  redirect("/empresas/entrar");
}

const MODALIDAD: Record<string, string> = {
  PRESENCIAL: "una cita presencial",
  LLAMADA: "una llamada",
  VIDEOLLAMADA: "una videollamada",
};

/** Registra la solicitud de cita y devuelve el link de WhatsApp con el mensaje ya armado */
export async function agendarCita(_: Estado, f: FormData): Promise<Estado> {
  const sesion = await requerirSesion("empresa");
  const empresa = await db.empresa.findUnique({ where: { id: sesion.sub } });
  if (!empresa?.activa) return { error: "La empresa no está activa." };

  const nombre = s(f, "nombre");
  const telefono = normalizarTelefono(s(f, "telefono")) || null;
  const motivo = s(f, "motivo") || "Conocer planes y beneficios";
  const modalidad = s(f, "modalidad") || "PRESENCIAL";
  const preferencia = s(f, "preferencia");

  const lineas = [
    `Hola, ${nombre ? `soy *${nombre}*, ` : "soy "}colaborador(a) de *${empresa.nombre}*, empresa afiliada a Grupo La Paz.`,
    `Me gustaría agendar ${MODALIDAD[modalidad] ?? "una cita"} con ustedes para: ${motivo}.`,
    preferencia && `Horario de preferencia: ${preferencia}.`,
    telefono && `Mi teléfono: ${telefono}.`,
    `Entiendo que como empleado tengo ${empresa.descuentoEmpleados}% de descuento. ¡Gracias!`,
  ].filter(Boolean);
  const mensaje = lineas.join("\n");

  await db.solicitud.create({
    data: { origen: "EMPRESA", empresaId: empresa.id, nombre: nombre || "Colaborador(a)", telefono, motivo, modalidad, preferencia: preferencia || null, mensaje },
  });
  await enviarEventoN8n({
    evento: "solicitud.creada",
    datos: { origen: "EMPRESA", empresa: empresa.nombre, nombre: nombre || "Colaborador(a)", telefono, motivo, modalidad, preferencia: preferencia || null, mensaje },
  });
  return { url: linkWhatsApp(mensaje) };
}
