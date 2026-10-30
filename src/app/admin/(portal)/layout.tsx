import { Building2, FileUp, Inbox, LayoutDashboard, Megaphone, Users } from "lucide-react";
import { PortalShell } from "@/components/PortalShell";
import { requerirSesion } from "@/lib/sesion";
import { salir } from "../acciones";

export const metadata = { title: { default: "Administración", template: "%s · Admin La Paz" } };

export default async function Layout({ children }: { children: React.ReactNode }) {
  const s = await requerirSesion("admin");
  const c = "h-5 w-5";
  return (
    <PortalShell
      inicio="/admin"
      subtitulo="ADMINISTRACIÓN"
      etiquetaUsuario={s.nombre}
      accionCerrar={salir}
      items={[
        { href: "/admin", etiqueta: "Panel", icono: <LayoutDashboard className={c} /> },
        { href: "/admin/clientes", etiqueta: "Clientes", icono: <Users className={c} /> },
        { href: "/admin/empresas", etiqueta: "Empresas", icono: <Building2 className={c} /> },
        { href: "/admin/promociones", etiqueta: "Promos", icono: <Megaphone className={c} /> },
        { href: "/admin/solicitudes", etiqueta: "Solicitudes", icono: <Inbox className={c} /> },
        { href: "/admin/importar", etiqueta: "Importar", icono: <FileUp className={c} /> },
      ]}
    >
      {children}
    </PortalShell>
  );
}
