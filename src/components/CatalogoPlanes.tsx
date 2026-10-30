import Link from "next/link";
import type { Funeraria, Plan } from "@prisma/client";
import { CATEGORIAS_PLAN, etiqueta } from "@/lib/constantes";
import { TarjetaPlan, Vacio } from "./Piezas";

/** Listado de planes con filtros por casa funeraria y categoría (vía query string) */
export function CatalogoPlanes({
  planes,
  funerarias,
  base,
  casa,
  categoria,
  descuento = 0,
}: {
  planes: (Plan & { funeraria: Funeraria | null })[];
  funerarias: Funeraria[];
  base: string;
  casa?: string;
  categoria?: string;
  descuento?: number;
}) {
  const categorias = [...new Set(planes.map((p) => p.categoria))];
  const filtrados = planes.filter(
    (p) => (!casa || p.funeraria?.slug === casa || (casa === "grupo" && !p.funeraria)) && (!categoria || p.categoria === categoria),
  );
  const url = (c?: string, cat?: string) => {
    const q = new URLSearchParams();
    if (c) q.set("casa", c);
    if (cat) q.set("categoria", cat);
    const s = q.toString();
    return s ? `${base}?${s}` : base;
  };
  const chip = (activo: boolean) =>
    `chip whitespace-nowrap px-3.5 py-1.5 text-sm ${activo ? "bg-paz-800 text-white" : "bg-white text-paz-800 ring-1 ring-paz-200"}`;
  const casasConPlanes = funerarias.filter((f) => planes.some((p) => p.funerariaId === f.id));

  return (
    <>
      <div className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-1">
        <Link href={url(undefined, categoria)} className={chip(!casa)}>Todas las casas</Link>
        {casasConPlanes.map((f) => (
          <Link key={f.id} href={url(f.slug, categoria)} className={chip(casa === f.slug)}>{f.nombre}</Link>
        ))}
        <Link href={url("grupo", categoria)} className={chip(casa === "grupo")}>Grupo (Cobertura, Zoo)</Link>
      </div>
      <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1">
        <Link href={url(casa)} className={chip(!categoria)}>Todo</Link>
        {categorias.map((c) => (
          <Link key={c} href={url(casa, c)} className={chip(categoria === c)}>{etiqueta(CATEGORIAS_PLAN, c)}</Link>
        ))}
      </div>
      {filtrados.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtrados.map((p) => (
            <TarjetaPlan key={p.id} plan={p} href={`${base}/${p.codigo}`} descuento={descuento} casa={p.funeraria?.nombre ?? "Grupo La Paz"} />
          ))}
        </div>
      ) : (
        <Vacio>No hay planes con esos filtros.</Vacio>
      )}
    </>
  );
}
