import { NextResponse, type NextRequest } from "next/server";
import { COOKIES, verificar, type DatosSesion, type Rol } from "@/lib/sesion-token";

const PORTALES: { prefijo: string; rol: Rol; publicas: string[] }[] = [
  { prefijo: "/clientes", rol: "cliente", publicas: ["/clientes/entrar", "/clientes/activar", "/clientes/recuperar", "/clientes/restablecer"] },
  { prefijo: "/empresas", rol: "empresa", publicas: ["/empresas/entrar"] },
  { prefijo: "/admin", rol: "admin", publicas: ["/admin/entrar"] },
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const portal = PORTALES.find((p) => pathname === p.prefijo || pathname.startsWith(p.prefijo + "/"));
  if (!portal) return NextResponse.next();

  const esPublica = portal.publicas.some((r) => pathname === r || pathname.startsWith(r + "/"));
  const sesion = await verificar<DatosSesion>(req.cookies.get(COOKIES[portal.rol])?.value);
  const valida = sesion?.rol === portal.rol;

  if (!esPublica && !valida) {
    const url = req.nextUrl.clone();
    url.pathname = portal.publicas[0];
    url.search = "";
    return NextResponse.redirect(url);
  }
  if (esPublica && valida && pathname === portal.publicas[0]) {
    const url = req.nextUrl.clone();
    url.pathname = portal.prefijo;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/clientes/:path*", "/empresas/:path*", "/admin/:path*"],
};
