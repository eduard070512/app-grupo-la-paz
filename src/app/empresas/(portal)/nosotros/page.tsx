import Image from "next/image";
import { MapPin, Phone, Clock, Globe } from "lucide-react";
import { requerirSesion } from "@/lib/sesion";
import { aliadosVisibles, funerariasActivas } from "@/lib/consultas";
import { COBERTURA_NACIONAL, COMODIDADES_SALAS, CONTACTO, LEMAS, MISION, POR_QUE_PREVENIR, VALORES, VISION } from "@/lib/contenido";
import { Encabezado, Lista, TarjetaAliado } from "@/components/Piezas";
import { telefonoLegible } from "@/lib/formato";

export const metadata = { title: "Grupo La Paz" };

export default async function Page() {
  const s = await requerirSesion("empresa");
  const [funerarias, aliados] = await Promise.all([funerariasActivas(), aliadosVisibles(s.sub)]);
  return (
    <div className="space-y-8">
      <Encabezado titulo="Grupo La Paz" texto={`${LEMAS.principal}. ${LEMAS.compromiso}.`} />

      <section className="grid gap-4 md:grid-cols-2">
        <div className="tarjeta p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-oro-600">Misión</p>
          <p className="mt-2 font-serif text-xl leading-snug text-paz-900">{MISION}</p>
        </div>
        <div className="tarjeta p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-oro-600">Visión</p>
          <p className="mt-2 font-serif text-xl leading-snug text-paz-900">{VISION}</p>
        </div>
      </section>

      <section>
        <h2 className="titulo mb-3 text-2xl">Nuestros valores</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {VALORES.map((v) => (
            <div key={v.nombre} className="tarjeta p-4">
              <p className="font-serif text-xl font-semibold text-paz-800">{v.nombre}</p>
              <p className="mt-1 text-sm text-gris">{v.texto}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="tarjeta grid overflow-hidden md:grid-cols-2">
        <div className="relative aspect-[4/5]">
          <Image src="/galeria/salas-velacion.jpg" alt="Salas de velación" fill className="object-cover" sizes="(max-width:768px) 100vw, 50vw" />
        </div>
        <div className="p-6">
          <h2 className="titulo text-2xl">Acogedoras salas de velación</h2>
          <Lista items={COMODIDADES_SALAS} className="mt-4" />
          <div className="mt-6 space-y-2 text-sm">
            <a href={CONTACTO.mapsUrl} target="_blank" rel="noopener noreferrer" className="flex gap-2 text-paz-800 hover:underline">
              <MapPin className="h-4 w-4 shrink-0 text-oro-600" /> {CONTACTO.direccion}
            </a>
            <p className="flex gap-2"><Clock className="h-4 w-4 shrink-0 text-oro-600" /> Oficina de previsión: {CONTACTO.horarioOficina}</p>
            <a href={`tel:+52${CONTACTO.oficinaPrevision.telefono}`} className="flex gap-2 text-paz-800 hover:underline">
              <Phone className="h-4 w-4 shrink-0 text-oro-600" /> {telefonoLegible(CONTACTO.oficinaPrevision.telefono)} · {CONTACTO.oficinaPrevision.nombre}
            </a>
            <a href={CONTACTO.web} target="_blank" rel="noopener noreferrer" className="flex gap-2 text-paz-800 hover:underline">
              <Globe className="h-4 w-4 shrink-0 text-oro-600" /> lapazgrupofunerario.com
            </a>
          </div>
        </div>
      </section>

      <section>
        <h2 className="titulo mb-3 text-2xl">¿Por qué prevenir?</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {POR_QUE_PREVENIR.map((p) => (
            <div key={p.titulo} className="tarjeta p-4">
              <p className="font-serif text-xl font-semibold text-paz-800">{p.titulo}</p>
              <p className="mt-1 text-sm text-gris">{p.texto}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="tarjeta p-5">
          <h2 className="titulo text-2xl">Nuestras casas funerarias</h2>
          <ul className="mt-3 divide-y divide-paz-50">
            {funerarias.map((f) => (
              <li key={f.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <span>
                  <span className="block font-semibold text-paz-900">{f.nombre}</span>
                  {f.direccion && <span className="text-xs text-gris">{f.direccion}</span>}
                </span>
                {f.telefono && (
                  <a href={`tel:+52${f.telefono}`} className="chip bg-paz-50 text-paz-800">
                    <Phone className="h-3 w-3" /> {telefonoLegible(f.telefono)}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div className="tarjeta overflow-hidden">
          <div className="relative aspect-[4/3]">
            <Image src="/galeria/cobertura-nacional.jpg" alt="Cobertura nacional" fill className="object-cover object-top" sizes="(max-width:768px) 100vw, 50vw" />
          </div>
          <p className="p-5 text-sm text-gris">{COBERTURA_NACIONAL}</p>
        </div>
      </section>

      {aliados.length > 0 && (
        <section>
          <h2 className="titulo text-2xl">Otras empresas de la red</h2>
          <p className="mb-3 text-sm text-gris">Empresas que, como la tuya, cuidan a sus colaboradores con Grupo La Paz.</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {aliados.map((e) => (
              <TarjetaAliado key={e.id} empresa={e} mostrarOferta={false} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
