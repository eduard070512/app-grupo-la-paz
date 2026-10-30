import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { requerirSesion } from "@/lib/sesion";
import { estadoDeCuenta } from "@/lib/contratos";
import { ESTATUS_CONTRATO, FRECUENCIAS, METODOS_PAGO, PARENTESCOS, etiqueta } from "@/lib/constantes";
import { dinero, fecha, fechaCorta, parsearLista } from "@/lib/formato";
import { BarraProgreso, Lista } from "@/components/Piezas";
import { ChipSituacion } from "@/components/TarjetaContrato";
import { BotonAsesor } from "@/components/BotonAsesor";
import { contactarAsesor } from "../../../acciones";

export async function generateMetadata({ params }: { params: Promise<{ numero: string }> }) {
  return { title: `Contrato ${(await params).numero}` };
}

export default async function Page({ params }: { params: Promise<{ numero: string }> }) {
  const s = await requerirSesion("cliente");
  const { numero } = await params;
  const c = await db.contrato.findUnique({
    where: { numero: decodeURIComponent(numero) },
    include: { plan: true, funeraria: true, beneficiarios: true, pagos: { orderBy: { fecha: "desc" } } },
  });
  if (!c || c.clienteId !== s.sub) notFound();
  const edo = estadoDeCuenta(c, c.pagos);
  const m = c.plan.moneda;
  const dato = (t: string, v: React.ReactNode) => (
    <div className="rounded-xl bg-paz-50 p-3">
      <p className="text-xs text-gris">{t}</p>
      <p className="font-semibold text-paz-900">{v}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <Link href="/clientes" className="inline-flex items-center gap-1 text-sm font-medium text-paz-700">
        <ArrowLeft className="h-4 w-4" /> Mis planes
      </Link>

      <section className="tarjeta p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-oro-600">{c.funeraria.nombre}</p>
            <h1 className="titulo text-3xl md:text-4xl">{c.plan.nombre}</h1>
            <p className="text-sm text-gris">
              Contrato <strong>{c.numero}</strong> · desde el {fecha(c.fechaContratacion)} · {etiqueta(ESTATUS_CONTRATO, c.estatus)}
            </p>
          </div>
          <ChipSituacion situacion={edo.situacion} />
        </div>

        <div className="mt-5">
          <div className="mb-1.5 flex justify-between text-sm">
            <span className="text-gris">Llevas pagado</span>
            <span className="font-semibold text-paz-900">{edo.porcentaje}%</span>
          </div>
          <BarraProgreso porcentaje={edo.porcentaje} />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          {dato("Costo del plan", dinero(edo.total, m))}
          {dato("Pagado", dinero(edo.pagado, m))}
          {dato("Te falta", <span className="text-lg">{dinero(edo.saldo, m)}</span>)}
          {dato("Abonos restantes", edo.saldo ? `${edo.abonosRestantes} de ${dinero(edo.abono, m)}` : "0")}
          {dato("Forma de pago", `${etiqueta(FRECUENCIAS, c.frecuencia)}${c.numeroAbonos ? ` · ${c.numeroAbonos} abonos` : ""}`)}
          {dato("Próximo pago", edo.proximoPago ? fecha(edo.proximoPago) : "—")}
          {dato("Último pago", edo.ultimoPago ? fechaCorta(edo.ultimoPago.fecha) : "—")}
          {dato("Pago inicial", c.pagoInicialCentavos ? dinero(c.pagoInicialCentavos, m) : "—")}
        </div>

        {edo.atraso > 0 && (
          <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
            Tienes un saldo vencido de <strong>{dinero(edo.atraso, m)}</strong>. Si ya pagaste, puede tardar en reflejarse; escríbenos para aclararlo.
          </p>
        )}

        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <BotonAsesor accion={contactarAsesor} campos={{ contrato: c.numero, motivo: "Aclaración de pagos", texto: "Quisiera solicitar mi estado de cuenta / aclarar un pago." }}>
            Aclarar un pago
          </BotonAsesor>
          <BotonAsesor
            accion={contactarAsesor}
            campos={{ contrato: c.numero, motivo: "Ampliar protección", texto: "Me interesa ampliar mi protección o agregar a otro familiar." }}
            className="btn-secundario w-full"
          >
            Ampliar mi protección
          </BotonAsesor>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="tarjeta p-5">
          <div className="flex items-baseline justify-between">
            <h2 className="titulo text-2xl">Qué cubre tu plan</h2>
            <Link href={`/clientes/planes/${c.plan.codigo}`} className="text-sm font-semibold text-paz-700">Ver detalle</Link>
          </div>
          <Lista items={parsearLista(c.plan.incluye)} className="mt-4" />
          {parsearLista(c.plan.cremacion).length > 0 && (
            <>
              <h3 className="titulo mt-5 text-xl">En caso de cremación</h3>
              <Lista items={parsearLista(c.plan.cremacion)} className="mt-2" />
            </>
          )}
        </section>

        <div className="space-y-6">
          {c.beneficiarios.length > 0 && (
            <section className="tarjeta p-5">
              <h2 className="titulo text-2xl">Personas protegidas</h2>
              <ul className="mt-3 divide-y divide-paz-50">
                {c.beneficiarios.map((b) => (
                  <li key={b.id} className="flex items-center justify-between py-2.5 text-sm">
                    <span className="font-medium text-paz-900">{b.nombre}</span>
                    <span className="chip bg-paz-50 text-paz-700">{etiqueta(PARENTESCOS, b.parentesco)}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="tarjeta p-5">
            <h2 className="titulo text-2xl">Historial de pagos</h2>
            <p className="text-sm text-gris">{c.pagos.length} pagos registrados</p>
            <div className="mt-3 max-h-[28rem] overflow-y-auto">
              <table className="tabla">
                <thead className="sticky top-0 bg-white">
                  <tr>
                    <th>Fecha</th>
                    <th>Método</th>
                    <th className="text-right">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {c.pagos.map((p) => (
                    <tr key={p.id}>
                      <td>
                        {fechaCorta(p.fecha)}
                        {p.folio && <span className="block text-[11px] text-gris">Folio {p.folio}</span>}
                      </td>
                      <td>{etiqueta(METODOS_PAGO, p.metodo)}</td>
                      <td className="text-right font-semibold">{dinero(p.montoCentavos, m)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
