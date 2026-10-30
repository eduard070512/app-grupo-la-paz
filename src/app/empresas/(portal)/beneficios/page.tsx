import Image from "next/image";
import { BookOpenText, HeartHandshake, MessagesSquare, Percent, ShieldCheck } from "lucide-react";
import { db } from "@/lib/db";
import { requerirSesion } from "@/lib/sesion";
import { BENEFICIOS_EMPRESA, BENEFICIOS_PREVISION, NOM035, SEGUROS } from "@/lib/contenido";
import { Encabezado, Lista } from "@/components/Piezas";
import { BotonAgendarRapido } from "../BotonAgendarRapido";

export const metadata = { title: "Beneficios" };

const ICONOS = { escudo: ShieldCheck, corazon: HeartHandshake, libro: BookOpenText, charla: MessagesSquare, descuento: Percent };

export default async function Page() {
  const s = await requerirSesion("empresa");
  const empresa = await db.empresa.findUniqueOrThrow({ where: { id: s.sub } });
  return (
    <div className="space-y-6">
      <Encabezado
        titulo="Tus beneficios"
        texto={`Gracias al convenio de coordinación y colaboración de servicios entre ${empresa.nombre} y Grupo La Paz.`}
      />

      <div className="grid gap-4 md:grid-cols-2">
        {BENEFICIOS_EMPRESA.map((b, i) => {
          const I = ICONOS[b.icono as keyof typeof ICONOS];
          const destacado = b.icono === "descuento";
          return (
            <article key={b.titulo} className={`tarjeta flex gap-4 p-5 ${destacado ? "bg-paz-900 text-white md:col-span-2" : ""}`}>
              <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${destacado ? "bg-oro-500 text-paz-950" : "bg-paz-100 text-paz-700"}`}>
                <I className="h-6 w-6" />
              </span>
              <div>
                <p className={`text-xs font-semibold ${destacado ? "text-oro-300" : "text-oro-600"}`}>Beneficio {i + 1}</p>
                <h2 className={`font-serif text-xl font-semibold ${destacado ? "" : "text-paz-900"}`}>
                  {destacado ? `${empresa.descuentoEmpleados}% de descuento` : b.titulo}
                </h2>
                <p className={`mt-1 text-sm ${destacado ? "text-paz-200" : "text-gris"}`}>
                  {destacado ? b.texto.replace("15%", `${empresa.descuentoEmpleados}%`) : b.texto}
                </p>
              </div>
            </article>
          );
        })}
      </div>

      <section className="tarjeta grid overflow-hidden md:grid-cols-[2fr_3fr]">
        <div className="relative aspect-[4/5] md:aspect-auto">
          <Image src="/galeria/empresas-portada.jpg" alt="" fill className="object-cover" sizes="(max-width:768px) 100vw, 40vw" />
        </div>
        <div className="p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-oro-600">NOM-035-STPS-2018</p>
          <h2 className="titulo mt-1 text-2xl">{NOM035.titulo}</h2>
          <p className="mt-3 text-sm text-gris">{NOM035.texto}</p>
          <div className="mt-5 max-w-xs">
            <BotonAgendarRapido motivo="Solicitar taller de duelo / charla para mi empresa" texto="Solicitar taller para mi empresa" className="btn-primario w-full" />
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="tarjeta p-5">
          <h2 className="titulo text-2xl">Al contratar un plan de previsión</h2>
          <Lista items={BENEFICIOS_PREVISION} className="mt-4" />
        </section>
        <section className="tarjeta bg-paz-900 p-5 text-white">
          <h2 className="flex items-center gap-2 font-serif text-2xl font-semibold">
            <ShieldCheck className="h-5 w-5 text-oro-300" /> 2 seguros incluidos
          </h2>
          <p className="mt-1 text-sm text-paz-200">Únicos y exclusivos en nuestro grupo funerario.</p>
          {SEGUROS.map((x) => (
            <div key={x.titulo} className="mt-4 rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
              <p className="font-semibold text-oro-300">{x.titulo}</p>
              <p className="text-sm text-paz-200">{x.texto}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
