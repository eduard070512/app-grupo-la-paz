import Image from "next/image";
import { FileText, ShieldCheck } from "lucide-react";
import type { Funeraria, Plan } from "@prisma/client";
import { dinero, NOMBRE_FREC, parsearLista, parsearPlazos, parsearVariantes, type Frec } from "@/lib/formato";
import { Lista } from "./Piezas";
import { SEGUROS } from "@/lib/contenido";

const FRECS: Frec[] = ["SEMANAL", "QUINCENAL", "MENSUAL"];

export function DetallePlan({ plan, descuento = 0, accion }: { plan: Plan & { funeraria: Funeraria | null }; descuento?: number; accion?: React.ReactNode }) {
  const variantes = parsearVariantes(plan.variantes);
  const plazos = parsearPlazos(plan.plazos);
  const frecs = FRECS.filter((f) => variantes.some((v) => v.abonos[f]));
  const incluye = parsearLista(plan.incluye);
  const cremacion = parsearLista(plan.cremacion);
  const beneficios = parsearLista(plan.beneficios);
  const conSeguros = beneficios.some((b) => b.toLowerCase().includes("doble seguro"));
  // precio con descuento redondeado a pesos completos
  const d = (c: number) => Math.round((c * (1 - descuento / 100)) / 100) * 100;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0 space-y-6">
        <section className="tarjeta overflow-hidden">
          {plan.imagenUrl && (
            <div className="relative aspect-[16/9] bg-paz-100">
              <Image src={plan.imagenUrl} alt={plan.nombre} fill priority sizes="(max-width:1024px) 100vw, 640px" className="object-cover object-top" />
            </div>
          )}
          <div className="p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-oro-600">{plan.funeraria?.nombre ?? "Grupo La Paz"}</p>
            <h1 className="titulo text-3xl md:text-4xl">{plan.nombre}</h1>
            {plan.subtitulo && <p className="text-sm text-paz-600">{plan.subtitulo}</p>}
            <p className="mt-3 text-sm text-gris">{plan.resumen}</p>
            {plan.aplicaPara && (
              <p className="mt-4 rounded-xl bg-paz-50 p-3 text-sm text-paz-800">
                <strong>Aplica para:</strong> {plan.aplicaPara}
              </p>
            )}
          </div>
        </section>

        <section className="tarjeta p-5">
          <h2 className="titulo text-2xl">Precios y formas de pago</h2>
          {descuento > 0 && <p className="mt-1 text-sm font-medium text-oro-700">Precios con tu {descuento}% de descuento como empleado de empresa afiliada.</p>}
          <div className="mt-4 -mx-5 overflow-x-auto px-5">
            <table className="tabla min-w-[520px]">
              <thead>
                <tr>
                  <th>Plan</th>
                  <th className="text-right">Precio</th>
                  <th className="text-right">Inicial</th>
                  {frecs.map((f) => (
                    <th key={f} className="text-right">
                      {f === "SEMANAL" ? "Semanal" : f === "QUINCENAL" ? "Quincenal" : "Mensual"}
                      {plazos[f] && <span className="block font-normal normal-case tracking-normal">{plazos[f]} {NOMBRE_FREC[f].plural}</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {variantes.map((v) => (
                  <tr key={v.nombre}>
                    <td className="font-medium text-paz-900">
                      {v.nombre}
                      {v.nota && <span className="block text-xs font-normal text-gris">{v.nota}</span>}
                    </td>
                    <td className="text-right font-semibold text-paz-800">
                      {descuento > 0 && <span className="block text-xs font-normal text-gris line-through">{dinero(v.precioCentavos, plan.moneda)}</span>}
                      {dinero(d(v.precioCentavos), plan.moneda)}
                    </td>
                    <td className="text-right">{v.inicialCentavos ? dinero(v.inicialCentavos, plan.moneda) : "—"}</td>
                    {frecs.map((f) => (
                      <td key={f} className="text-right">
                        {v.abonos[f] ? dinero(v.abonos[f]!, plan.moneda) : "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {descuento > 0 && <p className="mt-3 text-xs text-gris">Los abonos se ajustan al aplicar el descuento; un asesor te confirmará el esquema final.</p>}
        </section>

        <section className="tarjeta p-5">
          <h2 className="titulo text-2xl">Incluye</h2>
          <Lista items={incluye} className="mt-4 sm:columns-2 sm:gap-6 [&>li]:break-inside-avoid [&>li]:mb-2" />
          {cremacion.length > 0 && (
            <>
              <h3 className="titulo mt-6 text-xl">En caso de cremación</h3>
              <Lista items={cremacion} className="mt-3" />
            </>
          )}
          {plan.notas && <p className="mt-6 whitespace-pre-line rounded-xl bg-paz-50 p-3 text-sm text-paz-800">{plan.notas}</p>}
        </section>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        {accion}
        {beneficios.length > 0 && (
          <section className="tarjeta p-5">
            <h2 className="titulo text-xl">Beneficios</h2>
            <Lista items={beneficios} className="mt-3" />
          </section>
        )}
        {conSeguros && (
          <section className="tarjeta bg-paz-900 p-5 text-white">
            <h2 className="flex items-center gap-2 font-serif text-xl font-semibold">
              <ShieldCheck className="h-5 w-5 text-oro-300" /> 2 seguros incluidos
            </h2>
            {SEGUROS.map((s) => (
              <div key={s.titulo} className="mt-3">
                <p className="text-sm font-semibold text-oro-300">{s.titulo}</p>
                <p className="text-sm text-paz-200">{s.texto}</p>
              </div>
            ))}
          </section>
        )}
        {plan.fichaUrl && (
          <a href={plan.fichaUrl} target="_blank" className="btn-secundario w-full">
            <FileText className="h-4 w-4" /> Ver ficha del catálogo
          </a>
        )}
      </aside>
    </div>
  );
}
