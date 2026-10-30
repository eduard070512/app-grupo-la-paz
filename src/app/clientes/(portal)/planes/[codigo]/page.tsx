import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { requerirSesion } from "@/lib/sesion";
import { DetallePlan } from "@/components/DetallePlan";
import { BotonAsesor } from "@/components/BotonAsesor";
import { contactarAsesor } from "../../../acciones";

export default async function Page({ params }: { params: Promise<{ codigo: string }> }) {
  await requerirSesion("cliente");
  const { codigo } = await params;
  const plan = await db.plan.findUnique({ where: { codigo }, include: { funeraria: true } });
  if (!plan || !plan.activo) notFound();
  return (
    <div className="space-y-4">
      <Link href="/clientes/planes" className="inline-flex items-center gap-1 text-sm font-medium text-paz-700">
        <ArrowLeft className="h-4 w-4" /> Todos los planes
      </Link>
      <DetallePlan
        plan={plan}
        accion={
          <div className="tarjeta p-5">
            <p className="font-serif text-xl font-semibold text-paz-900">¿Te interesa este plan?</p>
            <p className="mt-1 mb-4 text-sm text-gris">Como cliente, un asesor te atiende con prioridad.</p>
            <BotonAsesor accion={contactarAsesor} campos={{ motivo: `Me interesa el plan ${plan.nombre}`, texto: `Me interesa el plan *${plan.nombre}* (${plan.funeraria?.nombre ?? "Grupo La Paz"}). ¿Me pueden dar más información?` }}>
              Me interesa
            </BotonAsesor>
          </div>
        }
      />
    </div>
  );
}
