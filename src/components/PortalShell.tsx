"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoClaro } from "./Logo";

export type ItemNav = { href: string; etiqueta: string; icono: React.ReactNode };

export function PortalShell({
  inicio,
  subtitulo,
  etiquetaUsuario,
  items,
  children,
  accionCerrar,
}: {
  inicio: string;
  subtitulo: string;
  etiquetaUsuario: string;
  items: ItemNav[];
  children: React.ReactNode;
  accionCerrar: () => Promise<void>;
}) {
  const ruta = usePathname();
  const activo = (href: string) => (href === inicio ? ruta === href : ruta === href || ruta.startsWith(href + "/"));

  return (
    <div className="min-h-dvh">
      <header className="fondo-marca sticky top-0 z-30 pt-[env(safe-area-inset-top)] shadow-lg shadow-paz-950/20">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <Link href={inicio}>
            <LogoClaro subtitulo={subtitulo} />
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {items.map((i) => (
              <Link
                key={i.href}
                href={i.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${activo(i.href) ? "bg-white/15 text-white" : "text-paz-200 hover:text-white"}`}
              >
                {i.etiqueta}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3 text-right">
            <span className="hidden max-w-[14rem] truncate text-xs text-paz-200 sm:block">{etiquetaUsuario}</span>
            <form action={accionCerrar}>
              <button className="rounded-lg px-3 py-2 text-xs font-semibold text-oro-300 ring-1 ring-oro-500/40 hover:bg-white/10">Salir</button>
            </form>
          </div>
        </div>
      </header>

      <main className="pb-nav mx-auto max-w-5xl px-4 pt-5 md:pb-12">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-paz-100 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        <ul className="mx-auto grid max-w-lg" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
          {items.map((i) => (
            <li key={i.href}>
              <Link
                href={i.href}
                className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${activo(i.href) ? "text-paz-800" : "text-gris"}`}
              >
                <span className={`grid h-8 w-12 place-items-center rounded-full transition ${activo(i.href) ? "bg-paz-100" : ""}`}>{i.icono}</span>
                {i.etiqueta}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
