import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { db } from "@/lib/db";
import { ESTATUS_SOLICITUD } from "@/lib/constantes";
import { fechaCorta } from "@/lib/formato";
import { linkWhatsApp } from "@/lib/whatsapp";
import { Encabezado, Vacio } from "@/components/Piezas";
import { cambiarEstatusSolicitud } from "../../acciones";

export const metadata = { title: "Solicitudes" };

export default async function Page({ searchParams }: { searchParams: Promise<{ estatus?: string }> }) {
  const { estatus } = await searchParams;
  const solicitudes = await db.solicitud.findMany({
    where: estatus ? { estatus } : {},
    orderBy: { creadoEn: "desc" },
    take: 200,
    include: { empresa: true, cliente: { include: { contratos: { select: { numero: true }, take: 1 } } } },
  });
  return (
    <>
      <Encabezado titulo="Solicitudes" texto="Cada vez que alguien toca «Agendar» o «Hablar con un asesor» queda registrado aquí antes de abrir WhatsApp." />
      <div className="mb-4 flex gap-2">
        {[["", "Todas"], ...Object.entries(ESTATUS_SOLICITUD)].map(([v, t]) => (
          <Link key={v} href={v ? `?estatus=${v}` : "?"} className={`chip px-3 py-1.5 text-sm ${(estatus ?? "") === v ? "bg-paz-800 text-white" : "bg-white text-paz-800 ring-1 ring-paz-200"}`}>{t}</Link>
        ))}
      </div>
      {solicitudes.length ? (
        <div className="space-y-3">
          {solicitudes.map((s) => (
            <article key={s.id} className="tarjeta p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-paz-900">
                    {s.cliente ? <Link href={`/admin/clientes/${s.cliente.id}`} className="hover:underline">{s.nombre}</Link> : s.nombre}
                    <span className="ml-2 chip bg-paz-50 text-paz-700">{s.empresa ? s.empresa.nombre : `Cliente ${s.cliente?.contratos[0]?.numero ?? ""}`}</span>
                  </p>
                  <p className="text-sm text-gris">{fechaCorta(s.creadoEn)} · {s.motivo}{s.modalidad && ` · ${s.modalidad.toLowerCase()}`}{s.preferencia && ` · ${s.preferencia}`}</p>
                </div>
                <form action={cambiarEstatusSolicitud} className="flex gap-1">
                  <input type="hidden" name="id" value={s.id} />
                  <select name="estatus" defaultValue={s.estatus} className="rounded-lg border border-paz-200 px-2 py-1 text-xs">
                    {Object.entries(ESTATUS_SOLICITUD).map(([v, t]) => <option key={v} value={v}>{t}</option>)}
                  </select>
                  <button className="rounded-lg bg-paz-100 px-2 text-xs font-semibold text-paz-800">Guardar</button>
                </form>
              </div>
              <p className="mt-2 whitespace-pre-line rounded-xl bg-paz-50 p-3 text-sm">{s.mensaje}</p>
              {s.telefono && (
                <a href={linkWhatsApp(`Hola ${s.nombre.split(" ")[0]}, te escribimos de Grupo La Paz por tu solicitud: ${s.motivo}.`, `52${s.telefono}`)} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#1f9d55]">
                  <MessageCircle className="h-4 w-4" /> Responder por WhatsApp ({s.telefono})
                </a>
              )}
            </article>
          ))}
        </div>
      ) : (
        <Vacio>No hay solicitudes.</Vacio>
      )}
    </>
  );
}
