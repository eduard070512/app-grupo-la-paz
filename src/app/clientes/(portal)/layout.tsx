import type { Metadata } from "next";
import { BookOpen, Handshake, House, Sparkles, UserRound } from "lucide-react";
import { PortalShell } from "@/components/PortalShell";
import { requerirSesion } from "@/lib/sesion";
import { salir } from "../acciones";

export const metadata: Metadata = { title: { default: "Mi plan", template: "%s · Mi plan La Paz" }, manifest: "/manifest-clientes.webmanifest" };

export default async function Layout({ children }: { children: React.ReactNode }) {
  const s = await requerirSesion("cliente");
  const c = "h-5 w-5";
  return (
    <PortalShell
      inicio="/clientes"
      subtitulo="MI PLAN"
      etiquetaUsuario={s.nombre}
      accionCerrar={salir}
      items={[
        { href: "/clientes", etiqueta: "Inicio", icono: <House className={c} /> },
        { href: "/clientes/planes", etiqueta: "Planes", icono: <BookOpen className={c} /> },
        { href: "/clientes/promociones", etiqueta: "Promos", icono: <Sparkles className={c} /> },
        { href: "/clientes/aliados", etiqueta: "Aliados", icono: <Handshake className={c} /> },
        { href: "/clientes/cuenta", etiqueta: "Cuenta", icono: <UserRound className={c} /> },
      ]}
    >
      {children}
    </PortalShell>
  );
}
