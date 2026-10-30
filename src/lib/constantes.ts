export const FRECUENCIAS = {
  SEMANAL: "Semanal",
  QUINCENAL: "Quincenal",
  MENSUAL: "Mensual",
  CONTADO: "Contado",
} as const;
export type Frecuencia = keyof typeof FRECUENCIAS;

export const ESTATUS_CONTRATO = {
  ACTIVO: "Activo",
  LIQUIDADO: "Liquidado",
  SUSPENDIDO: "Suspendido",
  CANCELADO: "Cancelado",
  UTILIZADO: "Utilizado",
} as const;

export const METODOS_PAGO = {
  EFECTIVO: "Efectivo",
  TRANSFERENCIA: "Transferencia",
  TARJETA: "Tarjeta",
  DEPOSITO: "Depósito",
} as const;

export const PARENTESCOS = {
  TITULAR: "Titular",
  CONYUGE: "Cónyuge",
  PADRE: "Padre",
  MADRE: "Madre",
  HIJO: "Hijo",
  HIJA: "Hija",
  MASCOTA: "Mascota",
  OTRO: "Otro",
} as const;

export const AUDIENCIAS = {
  TODOS: "Todos",
  CLIENTES: "Clientes",
  EMPRESAS: "Empresas afiliadas",
} as const;

export const ESTATUS_SOLICITUD = {
  NUEVA: "Nueva",
  CONTACTADA: "Contactada",
  CERRADA: "Cerrada",
} as const;

export const CATEGORIAS_PLAN = {
  COBERTURA_FAMILIAR: "Cobertura Familiar",
  PREVISION: "Previsión",
  CREMACION: "Cremación",
  CAPILLA: "Capilla",
  NICHO: "Nichos",
  DEVUELVELO_A_CASA: "Devuélvelo a Casa",
  ZOO_DESCANSO: "Zoo Descanso",
  NECESIDAD_INMEDIATA: "Necesidad Inmediata",
  OTRO: "Otro",
} as const;

export function etiqueta<T extends Record<string, string>>(catalogo: T, valor: string | null | undefined) {
  if (!valor) return "";
  return (catalogo as Record<string, string>)[valor] ?? valor;
}
