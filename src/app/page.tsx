import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Building2, HeartHandshake, Phone } from "lucide-react";
import { LogoClaro } from "@/components/Logo";
import { CONTACTO, LEMAS } from "@/lib/contenido";
import { telefonoLegible } from "@/lib/formato";

export default function Portada() {
  return (
    <div className="fondo-marca min-h-dvh text-white">
      <div className="mx-auto flex min-h-dvh max-w-5xl flex-col px-4 pt-[max(1.5rem,env(safe-area-inset-top))] pb-8">
        <header className="flex items-center justify-between">
          <LogoClaro />
          <a href={`tel:+52${CONTACTO.lineas24h[0].telefono}`} className="hidden items-center gap-2 rounded-full px-4 py-2 text-sm text-oro-300 ring-1 ring-oro-500/40 sm:flex">
            <Phone className="h-4 w-4" /> 24/7 · {telefonoLegible(CONTACTO.lineas24h[0].telefono)}
          </a>
        </header>

        <main className="grid flex-1 items-center gap-10 py-10 md:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.25em] text-oro-300">{LEMAS.compromiso}</p>
            <h1 className="mt-3 font-serif text-5xl font-semibold leading-[1.05] md:text-6xl">{LEMAS.principal}</h1>
            <p className="mt-4 max-w-md text-paz-200">{LEMAS.familia}. Elige cómo quieres entrar:</p>

            <div className="mt-8 space-y-3">
              <Link href="/clientes/entrar" className="group flex items-center gap-4 rounded-2xl bg-white p-4 text-paz-900 shadow-xl shadow-black/20 transition hover:-translate-y-0.5">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-paz-100">
                  <HeartHandshake className="h-6 w-6 text-paz-700" />
                </span>
                <span className="flex-1">
                  <span className="block font-semibold">Soy cliente de Grupo La Paz</span>
                  <span className="block text-sm text-gris">Consulta tu plan, pagos, saldo y promociones</span>
                </span>
                <ArrowRight className="h-5 w-5 text-paz-500 transition group-hover:translate-x-1" />
              </Link>
              <Link href="/empresas/entrar" className="group flex items-center gap-4 rounded-2xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur transition hover:bg-white/15">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-oro-500">
                  <Building2 className="h-6 w-6 text-paz-950" />
                </span>
                <span className="flex-1">
                  <span className="block font-semibold">Trabajo en una empresa afiliada</span>
                  <span className="block text-sm text-paz-200">Conoce tus beneficios y 15% de descuento</span>
                </span>
                <ArrowRight className="h-5 w-5 text-oro-300 transition group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          <div className="relative hidden aspect-[4/5] overflow-hidden rounded-[2rem] ring-1 ring-oro-500/30 md:block" style={{ borderTopLeftRadius: "50% 30%", borderTopRightRadius: "50% 30%" }}>
            <Image src="/galeria/compromiso.jpg" alt="" fill priority className="object-cover object-right" sizes="40vw" />
          </div>
        </main>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5 text-xs text-paz-200">
          <span>{CONTACTO.direccion}</span>
          <span className="flex gap-4">
            <a href={`tel:+52${CONTACTO.lineas24h[0].telefono}`} className="sm:hidden">Atención 24/7</a>
            <Link href="/admin/entrar" className="hover:text-white">Administración</Link>
          </span>
        </footer>
      </div>
    </div>
  );
}
