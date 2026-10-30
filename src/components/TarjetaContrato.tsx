import Link from "next/link";
import { CalendarClock, ChevronRight } from "lucide-react";
import { SITUACION_ETIQUETA, type SituacionContrato, estadoDeCuenta } from "@/lib/contratos";
import { dinero, fecha } from "@/lib/formato";
import { BarraProgreso } from "./Piezas";

export const COLOR_SITUACION: Record<SituacionContrato, string> = {
  AL_CORRIENTE: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  ATRASADO: "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
  LIQUIDADO: "bg-paz-100 text-paz-800 ring-1 ring-paz-200",
  INACTIVO: "bg-gray-100 text-gray-600 ring-1 ring-gray-200",
};

export function ChipSituacion({ situacion }: { situacion: SituacionContrato }) {
  return <span className={`chip ${COLOR_SITUACION[situacion]}`}>{SITUACION_ETIQUETA[situacion]}</span>;
}

export function TarjetaContrato({
  numero,
  plan,
  funeraria,
  moneda,
  edo,
  href,
}: {
  numero: string;
  plan: string;
  funeraria: string;
  moneda: string;
  edo: ReturnType<typeof estadoDeCuenta>;
  href: string;
}) {
  return (
    <Link href={href} className="tarjeta block p-5 transition hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-oro-600">{funeraria}</p>
          <h3 className="titulo text-2xl leading-tight">{plan}</h3>
          <p className="text-xs text-gris">Contrato {numero}</p>
        </div>
        <ChipSituacion situacion={edo.situacion} />
      </div>
      <div className="mt-4">
        <div className="mb-1.5 flex justify-between text-xs text-gris">
          <span>Pagado {dinero(edo.pagado, moneda)}</span>
          <span>{edo.porcentaje}%</span>
        </div>
        <BarraProgreso porcentaje={edo.porcentaje} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-paz-50 p-3">
          <p className="text-xs text-gris">Te falta por pagar</p>
          <p className="text-lg font-bold text-paz-900">{dinero(edo.saldo, moneda)}</p>
        </div>
        <div className="rounded-xl bg-paz-50 p-3">
          <p className="text-xs text-gris">{edo.situacion === "LIQUIDADO" ? "Estado" : "Próximo pago"}</p>
          {edo.proximoPago ? (
            <p className={`text-sm font-semibold ${edo.proximoPagoVencido ? "text-amber-700" : "text-paz-900"}`}>
              <CalendarClock className="mr-1 inline h-3.5 w-3.5" />
              {dinero(edo.abono, moneda)} · {fecha(edo.proximoPago)}
            </p>
          ) : (
            <p className="text-sm font-semibold text-paz-900">¡Plan pagado!</p>
          )}
        </div>
      </div>
      {edo.atraso > 0 && (
        <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Tienes {dinero(edo.atraso, moneda)} pendientes. Ponte al corriente para mantener todos tus beneficios.
        </p>
      )}
      <p className="mt-3 flex items-center justify-end text-sm font-semibold text-paz-700">
        Ver estado de cuenta <ChevronRight className="h-4 w-4" />
      </p>
    </Link>
  );
}
