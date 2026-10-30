import { Phone } from "lucide-react";
import { CONTACTO } from "@/lib/contenido";
import { telefonoLegible } from "@/lib/formato";

export function Linea24h() {
  return (
    <section className="tarjeta overflow-hidden">
      <div className="fondo-marca p-5 text-white">
        <p className="text-xs font-semibold uppercase tracking-widest text-oro-300">Atención las 24 horas</p>
        <h2 className="mt-1 font-serif text-2xl font-semibold">¿Necesitas un servicio ahora?</h2>
        <p className="mt-1 text-sm text-paz-200">No te preocupes por tomar decisiones. Llámanos y nuestro equipo estará contigo en poco tiempo.</p>
      </div>
      <div className="grid gap-2 p-4 sm:grid-cols-3">
        {CONTACTO.lineas24h.map((l) => (
          <a key={l.telefono} href={`tel:+52${l.telefono}`} className="btn-secundario justify-start">
            <Phone className="h-4 w-4 text-oro-600" />
            <span className="text-left">
              <span className="block">{telefonoLegible(l.telefono)}</span>
              <span className="block text-[11px] font-normal text-gris">{l.nombre}</span>
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
