import Link from "next/link";
import { db } from "@/lib/db";
import { estadoDeCuenta } from "@/lib/contratos";
import { mxn, fechaCorta } from "@/lib/formato";
import { Encabezado } from "@/components/Piezas";
import { ESTATUS_SOLICITUD, etiqueta } from "@/lib/constantes";

export const dynamic = "force-dynamic";

export default async function Panel() {
  const [clientes, activados, empresas, solicitudesNuevas, recientes, contratos] = await Promise.all([
    db.cliente.count(),
    db.cliente.count({ where: { activadoEn: { not: null } } }),
    db.empresa.count({ where: { activa: true } }),
    db.solicitud.count({ where: { estatus: "NUEVA" } }),
    db.solicitud.findMany({ take: 6, orderBy: { creadoEn: "desc" }, include: { empresa: true } }),
    // Para miles de contratos esto conviene moverlo a una vista/consulta agregada en Postgres
    db.contrato.findMany({ where: { estatus: "ACTIVO" }, include: { pagos: { select: { montoCentavos: true, fecha: true } }, plan: { select: { moneda: true } } } }),
  ]);
  let atrasados = 0;
  let saldoMxn = 0;
  for (const c of contratos) {
    const e = estadoDeCuenta(c, c.pagos);
    if (e.situacion === "ATRASADO") atrasados++;
    if (c.plan.moneda === "MXN") saldoMxn += e.saldo;
  }
  const kpi = (t: string, v: React.ReactNode, sub?: string, href?: string) => {
    const cuerpo = (
      <>
        <p className="text-xs font-semibold uppercase tracking-wider text-gris">{t}</p>
        <p className="mt-1 font-serif text-4xl font-semibold text-paz-900">{v}</p>
        {sub && <p className="text-xs text-gris">{sub}</p>}
      </>
    );
    return href ? (
      <Link href={href} className="tarjeta block p-4 transition hover:-translate-y-0.5">{cuerpo}</Link>
    ) : (
      <div className="tarjeta p-4">{cuerpo}</div>
    );
  };

  return (
    <div className="space-y-6">
      <Encabezado titulo="Panel" texto="Resumen de la plataforma Grupo La Paz." />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpi("Clientes", clientes.toLocaleString("es-MX"), `${activados} con app activada (${clientes ? Math.round((activados / clientes) * 100) : 0}%)`, "/admin/clientes")}
        {kpi("Contratos activos", contratos.length.toLocaleString("es-MX"), `${atrasados} con atraso`, "/admin/clientes")}
        {kpi("Saldo por cobrar", mxn(saldoMxn, { enteros: true }), "contratos activos en MXN")}
        {kpi("Solicitudes nuevas", solicitudesNuevas, `${empresas} empresas afiliadas activas`, "/admin/solicitudes")}
      </div>

      <section className="tarjeta p-5">
        <div className="flex items-baseline justify-between">
          <h2 className="titulo text-2xl">Últimas solicitudes</h2>
          <Link href="/admin/solicitudes" className="text-sm font-semibold text-paz-700">Ver todas</Link>
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="tabla min-w-[560px]">
            <thead>
              <tr><th>Fecha</th><th>Nombre</th><th>Origen</th><th>Motivo</th><th>Estatus</th></tr>
            </thead>
            <tbody>
              {recientes.map((r) => (
                <tr key={r.id}>
                  <td className="whitespace-nowrap">{fechaCorta(r.creadoEn)}</td>
                  <td>{r.nombre}</td>
                  <td>{r.empresa?.nombre ?? "Cliente"}</td>
                  <td className="max-w-xs truncate">{r.motivo}</td>
                  <td>{etiqueta(ESTATUS_SOLICITUD, r.estatus)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
