import Image from "next/image";
import { db } from "@/lib/db";
import { AUDIENCIAS, etiqueta } from "@/lib/constantes";
import { fechaCorta } from "@/lib/formato";
import { Encabezado } from "@/components/Piezas";
import { alternarPromocion, eliminarPromocion } from "../../acciones";
import { FormPromocion } from "./FormPromocion";

export const metadata = { title: "Promociones" };

export default async function Page() {
  const promos = await db.promocion.findMany({ orderBy: [{ activa: "desc" }, { orden: "asc" }, { creadoEn: "desc" }] });
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div>
        <Encabezado titulo="Promociones" texto="Se muestran en las apps según la audiencia y la vigencia." />
        <div className="space-y-3">
          {promos.map((p) => (
            <article key={p.id} className={`tarjeta flex gap-4 p-4 ${p.activa ? "" : "opacity-60"}`}>
              {p.imagenUrl && <Image src={p.imagenUrl} alt="" width={96} height={96} className="h-24 w-24 shrink-0 rounded-xl object-cover object-top" />}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap gap-1.5">
                  <span className="chip bg-paz-100 text-paz-800">{etiqueta(AUDIENCIAS, p.audiencia)}</span>
                  {!p.activa && <span className="chip bg-gray-100 text-gray-600">Pausada</span>}
                  {p.vigenteHasta && <span className="chip bg-oro-100 text-oro-700">Hasta {fechaCorta(p.vigenteHasta)}</span>}
                </div>
                <h3 className="mt-1 font-semibold text-paz-900">{p.titulo}</h3>
                <p className="line-clamp-2 text-sm text-gris">{p.descripcion}</p>
                <div className="mt-2 flex gap-2">
                  <form action={alternarPromocion}><input type="hidden" name="id" value={p.id} /><button className="text-xs font-semibold text-paz-700 hover:underline">{p.activa ? "Pausar" : "Activar"}</button></form>
                  <form action={eliminarPromocion}><input type="hidden" name="id" value={p.id} /><button className="text-xs font-semibold text-red-600 hover:underline">Eliminar</button></form>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
      <aside className="tarjeta h-fit p-5 lg:sticky lg:top-24">
        <h2 className="titulo text-2xl">Nueva promoción</h2>
        <FormPromocion />
      </aside>
    </div>
  );
}
