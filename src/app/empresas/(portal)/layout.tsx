import type { Metadata } from "next";
import { BookOpen, CalendarCheck, Gift, House, Info } from "lucide-react";
import { PortalShell } from "@/components/PortalShell";
import { requerirSesion } from "@/lib/sesion";
import { salir } from "../acciones";

export const metadata: Metadata = {
  title: { default: "Empresas afiliadas", template: "%s · La Paz Empresas" },
  manifest: "/manifest-empresas.webmanifest",
};

export default async function Layout({ children }: { children: React.ReactNode }) {
  const s = await requerirSesion("empresa");
  const c = "h-5 w-5";
  return (
    <PortalShell
      inicio="/empresas"
      subtitulo="EMPRESAS AFILIADAS"
      etiquetaUsuario={s.nombre}
      accionCerrar={salir}
      items={[
        { href: "/empresas", etiqueta: "Inicio", icono: <House className={c} /> },
        { href: "/empresas/beneficios", etiqueta: "Beneficios", icono: <Gift className={c} /> },
        { href: "/empresas/planes", etiqueta: "Planes", icono: <BookOpen className={c} /> },
        { href: "/empresas/agendar", etiqueta: "Agendar", icono: <CalendarCheck className={c} /> },
        { href: "/empresas/nosotros", etiqueta: "La Paz", icono: <Info className={c} /> },
      ]}
    >
      {children}
    </PortalShell>
  );
}
