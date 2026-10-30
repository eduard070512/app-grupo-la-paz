import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarCheck } from "lucide-react";
import { db } from "@/lib/db";
import { requerirSesion } from "@/lib/sesion";
import { DetallePlan } from "@/components/DetallePlan";
import { BotonAgendarRapido } from "../../BotonAgendarRapido";

export default async function Page({ params }: { params: Promise<{ codigo: string }> }) {
  const s = await requerirSesion("empresa");
  const { codigo } = await params;
  const [empresa, plan] = await Promise.all([
    db.empresa.findUniqueOrThrow({ where: { id: s.sub } }),
    db.plan.findUnique({ where: { codigo }, include: { funeraria: true } }),
  ]);
  if (!plan || !plan.activo) notFound();
  const motivo = `Me interesa el plan ${plan.nombre} (${plan.funeraria?.nombre ?? "Grupo La Paz"})`;
  return (
    <div className="space-y-4">
      <Link href="/empresas/planes" className="inline-flex items-center gap-1 text-sm font-medium text-paz-700">
        <ArrowLeft className="h-4 w-4" /> Todos los planes
      </Link>
      <DetallePlan
        plan={plan}
        descuento={empresa.descuentoEmpleados}
        accion={
          <div className="tarjeta space-y-2 p-5">
            <p className="font-serif text-xl font-semibold text-paz-900">¿Te interesa este plan?</p>
            <p className="text-sm text-gris">Envía tu solicitud por WhatsApp con un toque. El mensaje ya indica que eres colaborador de {empresa.nombre}.</p>
            <BotonAgendarRapido motivo={motivo} texto="Me interesa este plan" />
            <Link href={`/empresas/agendar?motivo=${encodeURIComponent(motivo)}`} className="btn-secundario w-full">
              <CalendarCheck className="h-4 w-4" /> Elegir día y modalidad
            </Link>
          </div>
        }
      />
    </div>
  );
}
