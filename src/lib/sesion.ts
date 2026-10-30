import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIES, DURACION_SEG, firmar, verificar, type DatosSesion, type Rol } from "./sesion-token";

const RUTA_LOGIN: Record<Rol, string> = {
  cliente: "/clientes/entrar",
  empresa: "/empresas/entrar",
  admin: "/admin/entrar",
};

export async function iniciarSesion(rol: Rol, sub: string, nombre: string) {
  const token = await firmar({ sub, rol, nombre }, DURACION_SEG[rol]);
  (await cookies()).set(COOKIES[rol], token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DURACION_SEG[rol],
  });
}

export async function cerrarSesion(rol: Rol) {
  (await cookies()).delete(COOKIES[rol]);
}

export async function obtenerSesion(rol: Rol) {
  const token = (await cookies()).get(COOKIES[rol])?.value;
  const datos = await verificar<DatosSesion>(token);
  return datos && datos.rol === rol ? datos : null;
}

/** Devuelve la sesión o redirige al login correspondiente */
export async function requerirSesion(rol: Rol) {
  const s = await obtenerSesion(rol);
  if (!s) redirect(RUTA_LOGIN[rol]);
  return s;
}

// --- Ticket temporal del flujo de activación (contrato+teléfono → código → contraseña) ---
const COOKIE_ACTIVACION = "lp_activacion";
export type TicketActivacion = { clienteId: string; etapa: "codigo" | "contrasena" };

export async function guardarTicketActivacion(t: TicketActivacion) {
  const token = await firmar(t, 15 * 60);
  (await cookies()).set(COOKIE_ACTIVACION, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/clientes",
    maxAge: 15 * 60,
  });
}

export async function leerTicketActivacion() {
  return verificar<TicketActivacion>((await cookies()).get(COOKIE_ACTIVACION)?.value);
}

export async function borrarTicketActivacion() {
  (await cookies()).delete({ name: COOKIE_ACTIVACION, path: "/clientes" });
}
