import { db } from "@/lib/db";
import { requerirSesion } from "@/lib/sesion";
import { planesActivos } from "@/lib/consultas";
import { Encabezado } from "@/components/Piezas";
import { FormAgendar } from "./FormAgendar";
import { CONTACTO } from "@/lib/contenido";
import { telefonoLegible } from "@/lib/formato";

export const metadata = { title: "Agendar cita" };

export default async function Page({ searchParams }: { searchParams: Promise<{ motivo?: string }> }) {
  const s = await requerirSesion("empresa");
  const { motivo } = await searchParams;
  const [empresa, planes] = await Promise.all([db.empresa.findUniqueOrThrow({ where: { id: s.sub } }), planesActivos()]);
  const motivos = [
    "Conocer planes y beneficios",
    ...planes.map((p) => `Me interesa el plan ${p.nombre} (${p.funeraria?.nombre ?? "Grupo La Paz"})`),
    "Solicitar taller de duelo / charla para mi empresa",
    "Necesito un servicio inmediato",
  ];
  if (motivo && !motivos.includes(motivo)) motivos.unshift(motivo);
  return (
    <div className="mx-auto max-w-xl">
      <Encabezado titulo="Agendar una cita" texto="Llena estos datos y te abriremos WhatsApp con tu mensaje listo para enviar. Un asesor te confirmará el día y la hora." />
      <div className="tarjeta p-5 sm:p-6">
        <FormAgendar empresa={empresa.nombre} motivos={motivos} motivoInicial={motivo ?? motivos[0]} />
      </div>
      <p className="mt-4 text-center text-xs text-gris">
        ¿Es una emergencia? Llama 24/7 al {telefonoLegible(CONTACTO.lineas24h[0].telefono)}.
      </p>
    </div>
  );
}
