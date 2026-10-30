import Image from "next/image";
import Link from "next/link";
import { Check, ExternalLink, Globe, MapPin, Phone, Sparkles } from "lucide-react";
import type { Empresa, Plan, Promocion } from "@prisma/client";
import { abonoDesde, dinero, fechaCorta, NOMBRE_FREC, parsearVariantes, telefonoLegible } from "@/lib/formato";

export function Encabezado({ titulo, texto, children }: { titulo: string; texto?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="titulo text-3xl md:text-4xl">{titulo}</h1>
        {texto && <p className="mt-1 max-w-2xl text-sm text-gris">{texto}</p>}
      </div>
      {children}
    </div>
  );
}

export function BarraProgreso({ porcentaje }: { porcentaje: number }) {
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-paz-100" role="progressbar" aria-valuenow={porcentaje} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full bg-gradient-to-r from-paz-600 to-oro-500" style={{ width: `${porcentaje}%` }} />
    </div>
  );
}

export function Lista({ items, className = "" }: { items: string[]; className?: string }) {
  return (
    <ul className={`space-y-2 ${className}`}>
      {items.map((i) => (
        <li key={i} className="flex gap-2.5 text-sm">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-oro-600" />
          <span>{i}</span>
        </li>
      ))}
    </ul>
  );
}

export function TarjetaPlan({ plan, href, descuento = 0, casa }: { plan: Plan; href: string; descuento?: number; casa?: string | null }) {
  const desde = abonoDesde(parsearVariantes(plan.variantes));
  const precioDesc = Math.round((plan.precioCentavos * (1 - descuento / 100)) / 100) * 100;
  return (
    <Link href={href} className="tarjeta group flex flex-col overflow-hidden transition hover:-translate-y-0.5">
      {plan.imagenUrl && (
        <div className="relative aspect-[16/10] overflow-hidden bg-paz-100">
          <Image src={plan.imagenUrl} alt={plan.nombre} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover object-top transition group-hover:scale-[1.02]" />
          {descuento > 0 && <span className="chip absolute left-3 top-3 bg-oro-500 text-paz-950 shadow">-{descuento}% empleado</span>}
        </div>
      )}
      <div className="flex flex-1 flex-col p-4">
        {casa && <p className="text-[11px] font-semibold uppercase tracking-wider text-oro-600">{casa}</p>}
        <h3 className="titulo text-xl">{plan.nombre}</h3>
        {plan.subtitulo && <p className="text-xs text-paz-600">{plan.subtitulo}</p>}
        <p className="mt-1.5 line-clamp-2 text-sm text-gris">{plan.resumen}</p>
        <div className="mt-auto pt-4">
          <p className="text-xs text-gris">Desde</p>
          {descuento > 0 ? (
            <p className="text-sm">
              <span className="text-gris line-through">{dinero(plan.precioCentavos, plan.moneda)}</span>{" "}
              <span className="text-lg font-bold text-paz-800">{dinero(precioDesc, plan.moneda)}</span>
            </p>
          ) : (
            <p className="text-lg font-bold text-paz-800">{dinero(plan.precioCentavos, plan.moneda)}</p>
          )}
          {desde && (
            <p className="text-xs text-gris">
              o abonos desde {dinero(desde.monto, plan.moneda)} por {NOMBRE_FREC[desde.frec].corto}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

export function TarjetaPromocion({ promo }: { promo: Promocion }) {
  return (
    <article className="tarjeta overflow-hidden">
      {promo.imagenUrl && (
        <div className="relative aspect-[16/9] bg-paz-100">
          <Image src={promo.imagenUrl} alt="" fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover object-top" />
        </div>
      )}
      <div className="p-4">
        <span className="chip bg-oro-100 text-oro-700">
          <Sparkles className="h-3 w-3" /> Promoción
        </span>
        <h3 className="titulo mt-2 text-xl">{promo.titulo}</h3>
        <p className="mt-1 whitespace-pre-line text-sm text-gris">{promo.descripcion}</p>
        {promo.vigenteHasta && <p className="mt-3 text-xs font-medium text-paz-700">Vigente hasta el {fechaCorta(promo.vigenteHasta)}</p>}
      </div>
    </article>
  );
}

export function TarjetaAliado({ empresa, mostrarOferta = true }: { empresa: Empresa; mostrarOferta?: boolean }) {
  const iniciales = empresa.nombre.split(/\s+/).slice(0, 2).map((p) => p[0]).join("");
  return (
    <article className="tarjeta flex flex-col p-4">
      <div className="flex items-center gap-3">
        {empresa.logoUrl ? (
          <Image src={empresa.logoUrl} alt="" width={56} height={56} className="h-14 w-14 rounded-xl object-contain ring-1 ring-paz-100" />
        ) : (
          <span className="grid h-14 w-14 place-items-center rounded-xl bg-paz-100 font-serif text-xl font-bold text-paz-700">{iniciales}</span>
        )}
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-paz-900">{empresa.nombre}</h3>
          {empresa.giro && <p className="text-xs text-gris">{empresa.giro}</p>}
        </div>
      </div>
      {empresa.descripcion && <p className="mt-3 text-sm text-gris">{empresa.descripcion}</p>}
      {mostrarOferta && empresa.ofertaClientes && (
        <p className="mt-3 rounded-xl bg-oro-100 px-3 py-2 text-sm font-medium text-oro-700">
          <Sparkles className="mr-1 inline h-3.5 w-3.5" />
          {empresa.ofertaClientes}
        </p>
      )}
      <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-3 text-xs text-paz-700">
        {empresa.telefono && (
          <a href={`tel:${empresa.telefono}`} className="inline-flex items-center gap-1 hover:underline">
            <Phone className="h-3.5 w-3.5" /> {telefonoLegible(empresa.telefono)}
          </a>
        )}
        {empresa.direccion && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" /> {empresa.direccion}
          </span>
        )}
        {empresa.sitioWeb && (
          <a href={empresa.sitioWeb} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:underline">
            <Globe className="h-3.5 w-3.5" /> Sitio web <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </article>
  );
}

export function Vacio({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-paz-200 p-8 text-center text-sm text-gris">{children}</div>;
}
