import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { db } from "@/lib/db";
import { requerirSesion } from "@/lib/sesion";
import { estadoDeCuenta } from "@/lib/contratos";
import { promocionesVigentes } from "@/lib/consultas";
import { TarjetaContrato } from "@/components/TarjetaContrato";
import { TarjetaPromocion, Vacio } from "@/components/Piezas";
import { Linea24h } from "@/components/Linea24h";
import { BotonAsesor } from "@/components/BotonAsesor";
import { Alerta } from "@/components/Formulario";
import { contactarAsesor } from "../acciones";
import { SEGUROS } from "@/lib/contenido";

export default async function Inicio({ searchParams }: { searchParams: Promise<{ bienvenida?: string }> }) {
  const s = await requerirSesion("cliente");
  const { bienvenida } = await searchParams;
  const cliente = await db.cliente.findUniqueOrThrow({
    where: { id: s.sub },
    include: {
      contratos: {
        include: { plan: true, funeraria: true, pagos: { select: { montoCentavos: true, fecha: true } } },
        orderBy: { fechaContratacion: "desc" },
      },
    },
  });
  const promos = await promocionesVigentes("CLIENTES", 2);
  const primerNombre = cliente.nombre.split(" ")[0];

  return (
    <div className="space-y-6">
      {bienvenida && <Alerta tipo="exito">¡Tu cuenta quedó activada! Ya puedes consultar tu plan cuando quieras.</Alerta>}
      <div>
        <p className="text-sm text-gris">Hola,</p>
        <h1 className="titulo text-4xl">{primerNombre}</h1>
        <p className="mt-1 text-sm text-gris">Gracias por confiar en Grupo La Paz. Aquí está todo sobre tu protección.</p>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gris">Mis planes</h2>
        {cliente.contratos.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {cliente.contratos.map((c) => (
              <TarjetaContrato
                key={c.id}
                numero={c.numero}
                plan={c.plan.nombre}
                funeraria={c.funeraria.nombre}
                moneda={c.plan.moneda}
                edo={estadoDeCuenta(c, c.pagos)}
                href={`/clientes/contratos/${c.numero}`}
              />
            ))}
          </div>
        ) : (
          <Vacio>No encontramos contratos asociados a tu cuenta. Escríbenos por WhatsApp y lo revisamos.</Vacio>
        )}
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="tarjeta p-5">
          <h2 className="flex items-center gap-2 font-serif text-2xl font-semibold text-paz-900">
            <ShieldCheck className="h-5 w-5 text-oro-600" /> Tus seguros incluidos
          </h2>
          <p className="mt-1 text-sm text-gris">Los planes de previsión incluyen dos seguros únicos en nuestro grupo:</p>
          {SEGUROS.map((x) => (
            <div key={x.titulo} className="mt-3 rounded-xl bg-paz-50 p-3">
              <p className="text-sm font-semibold text-paz-900">{x.titulo}</p>
              <p className="text-sm text-gris">{x.texto}</p>
            </div>
          ))}
        </section>
        <section className="tarjeta flex flex-col p-5">
          <h2 className="font-serif text-2xl font-semibold text-paz-900">¿Tienes dudas sobre tu plan?</h2>
          <p className="mt-1 text-sm text-gris">
            Un asesor te atiende por WhatsApp. El mensaje ya va con tu nombre y número de contrato.
          </p>
          <div className="mt-auto pt-4">
            <BotonAsesor accion={contactarAsesor} campos={{ contrato: cliente.contratos[0]?.numero ?? "", motivo: "Dudas sobre mi plan" }} />
          </div>
        </section>
      </div>

      <Linea24h />

      {promos.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gris">Promociones para ti</h2>
            <Link href="/clientes/promociones" className="flex items-center gap-1 text-sm font-semibold text-paz-700">
              Ver todas <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {promos.map((p) => (
              <TarjetaPromocion key={p.id} promo={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
