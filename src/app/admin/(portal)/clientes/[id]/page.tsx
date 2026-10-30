import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { estadoDeCuenta } from "@/lib/contratos";
import { ESTATUS_CONTRATO, FRECUENCIAS, METODOS_PAGO, PARENTESCOS, etiqueta } from "@/lib/constantes";
import { dinero, fecha, fechaCorta } from "@/lib/formato";
import { BarraProgreso } from "@/components/Piezas";
import { ChipSituacion } from "@/components/TarjetaContrato";
import { cambiarEstatusContrato, eliminarPago, reiniciarAcceso } from "../../../acciones";
import { FormCliente, FormPago } from "./Formularios";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = await db.cliente.findUnique({
    where: { id },
    include: {
      funeraria: true,
      contratos: { include: { plan: true, funeraria: true, beneficiarios: true, pagos: { orderBy: { fecha: "desc" } } }, orderBy: { fechaContratacion: "desc" } },
    },
  });
  if (!c) notFound();

  return (
    <div className="space-y-6">
      <Link href="/admin/clientes" className="inline-flex items-center gap-1 text-sm font-medium text-paz-700"><ArrowLeft className="h-4 w-4" /> Clientes</Link>
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <section className="tarjeta p-5">
          <h1 className="titulo text-3xl">{c.nombre}</h1>
          <p className="text-sm text-gris">{c.funeraria.nombre}{c.claveExterna && ` · clave anterior ${c.claveExterna}`}</p>
          <FormCliente cliente={{ id: c.id, nombre: c.nombre, telefono: c.telefono, email: c.email ?? "" }} />
        </section>
        <section className="tarjeta p-5 text-sm">
          <h2 className="font-semibold text-paz-900">Acceso a la app</h2>
          {c.activadoEn ? (
            <>
              <p className="mt-1 text-gris">Activada el {fecha(c.activadoEn)}{c.ultimoAcceso && `; último acceso ${fechaCorta(c.ultimoAcceso)}`}.</p>
              <form action={reiniciarAcceso} className="mt-3">
                <input type="hidden" name="id" value={c.id} />
                <button className="btn-peligro w-full">Reiniciar acceso</button>
                <p className="mt-1 text-xs text-gris">El cliente deberá activar de nuevo con contrato + teléfono + código.</p>
              </form>
            </>
          ) : (
            <p className="mt-1 text-gris">Aún no activa su cuenta. Puede hacerlo en <strong>/clientes/activar</strong> con su número de contrato y el teléfono {c.telefono}.</p>
          )}
        </section>
      </div>

      {c.contratos.map((k) => {
        const e = estadoDeCuenta(k, k.pagos);
        const m = k.plan.moneda;
        return (
          <section key={k.id} className="tarjeta p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="titulo text-2xl">{k.numero} · {k.plan.nombre}</h2>
                <p className="text-sm text-gris">
                  {k.funeraria.nombre} · {fecha(k.fechaContratacion)} · {etiqueta(FRECUENCIAS, k.frecuencia)} {k.abonoCentavos > 0 && `de ${dinero(k.abonoCentavos, m)}`}
                  {k.numeroAbonos > 0 && ` · ${k.numeroAbonos} abonos`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <ChipSituacion situacion={e.situacion} />
                <form action={cambiarEstatusContrato} className="flex gap-1">
                  <input type="hidden" name="id" value={k.id} />
                  <select name="estatus" defaultValue={k.estatus} className="rounded-lg border border-paz-200 px-2 py-1 text-xs">
                    {Object.entries(ESTATUS_CONTRATO).map(([v, t]) => <option key={v} value={v}>{t}</option>)}
                  </select>
                  <button className="rounded-lg bg-paz-100 px-2 text-xs font-semibold text-paz-800">Guardar</button>
                </form>
              </div>
            </div>
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-4">
              <div><p className="text-xs text-gris">Total</p><p className="font-semibold">{dinero(e.total, m)}</p></div>
              <div><p className="text-xs text-gris">Pagado</p><p className="font-semibold">{dinero(e.pagado, m)}</p></div>
              <div><p className="text-xs text-gris">Saldo</p><p className="font-semibold">{dinero(e.saldo, m)}</p></div>
              <div><p className="text-xs text-gris">Atraso</p><p className={`font-semibold ${e.atraso ? "text-amber-700" : ""}`}>{dinero(e.atraso, m)}</p></div>
            </div>
            <div className="mt-3"><BarraProgreso porcentaje={e.porcentaje} /></div>

            <div className="mt-5 grid gap-5 lg:grid-cols-[320px_1fr]">
              <div>
                <h3 className="mb-2 font-semibold text-paz-900">Registrar pago</h3>
                <FormPago contratoId={k.id} abono={k.abonoCentavos} />
                {k.beneficiarios.length > 0 && (
                  <>
                    <h3 className="mt-5 mb-1 font-semibold text-paz-900">Beneficiarios</h3>
                    <ul className="text-sm">{k.beneficiarios.map((b) => <li key={b.id}>{b.nombre} <span className="text-gris">· {etiqueta(PARENTESCOS, b.parentesco)}</span></li>)}</ul>
                  </>
                )}
              </div>
              <div className="max-h-96 overflow-auto">
                <table className="tabla">
                  <thead className="sticky top-0 bg-white"><tr><th>Fecha</th><th>Folio</th><th>Método</th><th className="text-right">Monto</th><th /></tr></thead>
                  <tbody>
                    {k.pagos.map((p) => (
                      <tr key={p.id}>
                        <td className="whitespace-nowrap">{fechaCorta(p.fecha)}</td>
                        <td className="text-xs">{p.folio}</td>
                        <td>{etiqueta(METODOS_PAGO, p.metodo)}</td>
                        <td className="text-right font-semibold">{dinero(p.montoCentavos, m)}</td>
                        <td className="w-8">
                          <form action={eliminarPago}>
                            <input type="hidden" name="id" value={p.id} />
                            <button title="Eliminar pago" className="text-gris hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <p className="mt-2 text-xs text-gris">Estatus del contrato: {etiqueta(ESTATUS_CONTRATO, k.estatus)}</p>
          </section>
        );
      })}
    </div>
  );
}
