// Firmado/verificación de sesiones (JWT). Sin dependencias de Node: se usa también en middleware.
import { SignJWT, jwtVerify } from "jose";

export type Rol = "cliente" | "empresa" | "admin";

export const COOKIES: Record<Rol, string> = {
  cliente: "lp_cliente",
  empresa: "lp_empresa",
  admin: "lp_admin",
};

export const DURACION_SEG: Record<Rol, number> = {
  cliente: 60 * 60 * 24 * 30,
  empresa: 60 * 60 * 24 * 90,
  admin: 60 * 60 * 12,
};

export type DatosSesion = { sub: string; rol: Rol; nombre: string };

/** Mensaje para mostrar en pantalla si falta configurar el servidor (null = todo bien) */
export function errorDeConfiguracion(): string | null {
  const secreto = process.env.AUTH_SECRET;
  if (!secreto || secreto.length < 32)
    return "El servidor no está configurado: falta la variable AUTH_SECRET (mínimo 32 caracteres). Agrégala en Vercel → Settings → Environment Variables y vuelve a desplegar.";
  return null;
}

function clave() {
  const secreto = process.env.AUTH_SECRET;
  if (!secreto || secreto.length < 32) throw new Error("AUTH_SECRET debe tener al menos 32 caracteres");
  return new TextEncoder().encode(secreto);
}

export async function firmar(datos: Record<string, unknown>, segundos: number) {
  return new SignJWT(datos)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${segundos}s`)
    .sign(clave());
}

export async function verificar<T = Record<string, unknown>>(token: string | undefined): Promise<T | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, clave());
    return payload as T;
  } catch {
    return null;
  }
}
