import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, CalendarCheck, Gift } from "lucide-react";
import { db } from "@/lib/db";
import { requerirSesion } from "@/lib/sesion";
import { promocionesVigentes } from "@/lib/consultas";
import { SERVICIOS, LEMAS } from "@/lib/contenido";
import { TarjetaPromocion } from "@/components/Piezas";
import { Linea24h } from "@/components/Linea24h";
import { BotonAgendarRapido } from "./BotonAgendarRapido";

export default async function Inicio() {
  const s = await requerirSesion("empresa");
  const empresa = await db.empresa.findUniqueOrThrow({ where: { id: s.sub } });
  const promos = await promocionesVigentes("EMPRESAS", 2);

  return (
    <div className="space-y-6">
      <section className="fondo-marca relative overflow-hidden rounded-3xl p-6 text-white md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[.2em] text-oro-300">Colaborador de</p>
        <h1 className="mt-1 font-serif text-4xl font-semibold md:text-5xl">{empresa.nombre}</h1>
        <p className="mt-3 max-w-xl text-paz-200">
          Tu empresa se afilió a Grupo La Paz para cuidarte a ti y a tu familia. {LEMAS.familia}.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <div className="rounded-2xl bg-oro-500 px-5 py-3 text-paz-950">
            <p className="font-serif text-5xl font-bold leading-none">{empresa.descuentoEmpleados}%</p>
            <p className="text-xs font-semibold uppercase tracking-wider">de descuento</p>
          </div>
          <p className="max-w-xs text-sm text-paz-200">en Previsión, Cobertura Familiar, Nichos, Devuélvelo a Casa, Zoo Descanso y Necesidad Inmediata.</p>
        </div>
        <div className="mt-6 max-w-sm">
          <BotonAgendarRapido />
        </div>
      </section>

      <div className="grid grid-cols-3 gap-3">
        {[
          { href: "/empresas/beneficios", t: "Mis beneficios", i: Gift },
          { href: "/empresas/planes", t: "Ver planes", i: BookOpen },
          { href: "/empresas/agendar", t: "Agendar cita", i: CalendarCheck },
        ].map(({ href, t, i: I }) => (
          <Link key={href} href={href} className="tarjeta flex flex-col items-center gap-2 p-4 text-center text-sm font-semibold text-paz-800 transition hover:-translate-y-0.5">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-paz-100">
              <I className="h-5 w-5 text-paz-700" />
            </span>
            {t}
          </Link>
        ))}
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gris">Servicios con tu descuento</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICIOS.map((x) => (
            <div key={x.clave} className="tarjeta p-4">
              <p className="font-serif text-lg font-semibold text-paz-900">{x.nombre}</p>
              <p className="mt-1 text-sm text-gris">{x.texto}</p>
            </div>
          ))}
        </div>
      </section>

      {promos.length > 0 && (
        <section className="grid gap-4 md:grid-cols-2">
          {promos.map((p) => (
            <TarjetaPromocion key={p.id} promo={p} />
          ))}
        </section>
      )}

      <Link href="/empresas/nosotros" className="tarjeta group grid overflow-hidden md:grid-cols-2">
        <div className="relative aspect-[16/10] md:aspect-auto">
          <Image src="/galeria/salas-velacion.jpg" alt="Salas de velación La Paz" fill className="object-cover" sizes="(max-width:768px) 100vw, 50vw" />
        </div>
        <div className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-oro-600">Conoce Grupo La Paz</p>
          <h2 className="titulo mt-1 text-2xl">{LEMAS.principal}</h2>
          <p className="mt-2 text-sm text-gris">Dos acogedoras salas de velación, cafetería 24 horas, servicio 24/7 y cobertura en las principales ciudades del país a través de la ANDF.</p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-paz-700">
            Conocer más <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>

      <Linea24h />
    </div>
  );
}
