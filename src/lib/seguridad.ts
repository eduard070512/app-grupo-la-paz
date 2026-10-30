import "server-only";
import bcrypt from "bcryptjs";
import { createHash, randomBytes, randomInt } from "node:crypto";
import { db } from "./db";

export const hashContrasena = (pw: string) => bcrypt.hash(pw, 10);
export const verificarContrasena = (pw: string, hash: string | null | undefined) =>
  hash ? bcrypt.compare(pw, hash) : Promise.resolve(false);

export const sha256 = (v: string) => createHash("sha256").update(v).digest("hex");

/** Reglas mínimas de contraseña (pensadas para usuarios de todas las edades) */
export function validarContrasena(pw: string): string | null {
  if (pw.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
  if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) return "La contraseña debe incluir letras y números.";
  return null;
}

const MAX_FALLOS = 5;
const VENTANA_MIN = 15;

/** Limita intentos fallidos por clave (contrato, usuario, correo) */
export async function bloqueado(clave: string) {
  const desde = new Date(Date.now() - VENTANA_MIN * 60_000);
  const fallos = await db.intentoAcceso.count({ where: { clave, exito: false, creadoEn: { gte: desde } } });
  return fallos >= MAX_FALLOS;
}

export async function registrarIntento(clave: string, exito: boolean) {
  await db.intentoAcceso.create({ data: { clave, exito } });
  if (exito) await db.intentoAcceso.deleteMany({ where: { clave, exito: false } });
}

export const MENSAJE_BLOQUEO = `Demasiados intentos. Por seguridad espera ${VENTANA_MIN} minutos e intenta de nuevo.`;

/** Genera un código numérico de 6 dígitos (activación por WhatsApp/SMS) */
export async function crearCodigo(clienteId: string, tipo: "ACTIVACION" | "RECUPERACION", minutos = 10) {
  await db.codigoVerificacion.updateMany({
    where: { clienteId, tipo, usadoEn: null },
    data: { usadoEn: new Date() },
  });
  const codigo = String(randomInt(0, 1_000_000)).padStart(6, "0");
  await db.codigoVerificacion.create({
    data: { clienteId, tipo, hash: sha256(`${clienteId}:${codigo}`), expiraEn: new Date(Date.now() + minutos * 60_000) },
  });
  return codigo;
}

export async function validarCodigo(clienteId: string, tipo: "ACTIVACION" | "RECUPERACION", codigo: string) {
  const registro = await db.codigoVerificacion.findFirst({
    where: { clienteId, tipo, usadoEn: null, expiraEn: { gt: new Date() } },
    orderBy: { creadoEn: "desc" },
  });
  if (!registro) return { ok: false as const, error: "El código expiró. Solicita uno nuevo." };
  if (registro.intentos >= MAX_FALLOS) return { ok: false as const, error: "Demasiados intentos. Solicita un código nuevo." };
  if (registro.hash !== sha256(`${clienteId}:${codigo.trim()}`)) {
    await db.codigoVerificacion.update({ where: { id: registro.id }, data: { intentos: { increment: 1 } } });
    return { ok: false as const, error: "El código no es correcto." };
  }
  await db.codigoVerificacion.update({ where: { id: registro.id }, data: { usadoEn: new Date() } });
  return { ok: true as const };
}

/** Token largo para links de recuperación de contraseña */
export async function crearTokenRecuperacion(clienteId: string, minutos = 30) {
  await db.codigoVerificacion.updateMany({
    where: { clienteId, tipo: "RECUPERACION", usadoEn: null },
    data: { usadoEn: new Date() },
  });
  const token = randomBytes(32).toString("base64url");
  await db.codigoVerificacion.create({
    data: { clienteId, tipo: "RECUPERACION", hash: sha256(token), expiraEn: new Date(Date.now() + minutos * 60_000) },
  });
  return token;
}

export async function buscarTokenRecuperacion(token: string) {
  return db.codigoVerificacion.findFirst({
    where: { hash: sha256(token), tipo: "RECUPERACION", usadoEn: null, expiraEn: { gt: new Date() } },
    include: { cliente: true },
  });
}
