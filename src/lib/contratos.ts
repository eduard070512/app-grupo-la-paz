import type { Contrato, Pago } from "@prisma/client";

export type SituacionContrato = "AL_CORRIENTE" | "ATRASADO" | "LIQUIDADO" | "INACTIVO";

export const SITUACION_ETIQUETA: Record<SituacionContrato, string> = {
  AL_CORRIENTE: "Al corriente",
  ATRASADO: "Con atraso",
  LIQUIDADO: "Liquidado",
  INACTIVO: "Inactivo",
};

function sumarPeriodos(base: Date, frecuencia: string, n: number) {
  const d = new Date(base);
  if (frecuencia === "SEMANAL") d.setDate(d.getDate() + 7 * n);
  else if (frecuencia === "QUINCENAL") d.setDate(d.getDate() + 15 * n);
  else d.setMonth(d.getMonth() + n);
  return d;
}

function periodosTranscurridos(desde: Date, hasta: Date, frecuencia: string) {
  if (hasta <= desde) return 0;
  const dias = (hasta.getTime() - desde.getTime()) / 86_400_000;
  if (frecuencia === "SEMANAL") return Math.floor(dias / 7);
  if (frecuencia === "QUINCENAL") return Math.floor(dias / 15);
  let meses = (hasta.getFullYear() - desde.getFullYear()) * 12 + (hasta.getMonth() - desde.getMonth());
  if (hasta.getDate() < desde.getDate()) meses -= 1;
  return Math.max(0, meses);
}

/**
 * Calcula el estado de cuenta de un contrato a partir de sus pagos.
 * Regla: el primer abono vence un periodo después de la fecha de contratación
 * (el pago inicial se cubre al contratar).
 */
export function estadoDeCuenta(contrato: Contrato, pagos: Pick<Pago, "montoCentavos" | "fecha">[], hoy = new Date()) {
  const total = contrato.montoTotalCentavos;
  const pagado = pagos.reduce((s, p) => s + p.montoCentavos, 0);
  const saldo = Math.max(total - pagado, 0);
  const porcentaje = total > 0 ? Math.min(100, Math.round((pagado / total) * 100)) : 100;
  const abono = contrato.abonoCentavos;
  const inactivo = ["CANCELADO", "SUSPENDIDO", "UTILIZADO"].includes(contrato.estatus);

  let esperado = total;
  let proximoPago: Date | null = null;
  let abonosRestantes = 0;

  if (contrato.frecuencia !== "CONTADO" && abono > 0) {
    const periodos = periodosTranscurridos(contrato.fechaContratacion, hoy, contrato.frecuencia);
    esperado = Math.min(total, contrato.pagoInicialCentavos + periodos * abono);
    const abonosCubiertos = Math.floor(Math.max(0, pagado - contrato.pagoInicialCentavos) / abono);
    if (saldo > 0) proximoPago = sumarPeriodos(contrato.fechaContratacion, contrato.frecuencia, abonosCubiertos + 1);
    abonosRestantes = Math.ceil(saldo / abono);
  }

  const atraso = Math.max(0, esperado - pagado);
  let situacion: SituacionContrato;
  if (saldo === 0 || contrato.estatus === "LIQUIDADO") situacion = "LIQUIDADO";
  else if (inactivo) situacion = "INACTIVO";
  else if (abono > 0 && atraso >= abono) situacion = "ATRASADO";
  else situacion = "AL_CORRIENTE";

  const ultimoPago = pagos.length
    ? pagos.reduce((a, b) => (new Date(a.fecha) > new Date(b.fecha) ? a : b))
    : null;

  return {
    total,
    pagado,
    saldo,
    porcentaje,
    atraso: situacion === "ATRASADO" ? atraso : 0,
    abono,
    abonosRestantes,
    proximoPago,
    proximoPagoVencido: !!proximoPago && proximoPago < hoy,
    ultimoPago,
    situacion,
  };
}
