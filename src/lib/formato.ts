const mxnFmt = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });
const mxnEnteroFmt = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

/** Formatea centavos como pesos mexicanos */
export function mxn(centavos: number, { enteros = false } = {}) {
  const pesos = centavos / 100;
  if (enteros || Number.isInteger(pesos)) return mxnEnteroFmt.format(pesos);
  return mxnFmt.format(pesos);
}

export function pesosACentavos(valor: string | number) {
  const n = typeof valor === "number" ? valor : Number(String(valor).replace(/[$,\s]/g, ""));
  if (!Number.isFinite(n)) return NaN;
  return Math.round(n * 100);
}

const fechaFmt = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Mexico_City" });
const fechaCortaFmt = new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "short", year: "numeric", timeZone: "America/Mexico_City" });

export const fecha = (d: Date | string) => fechaFmt.format(new Date(d));
export const fechaCorta = (d: Date | string) => fechaCortaFmt.format(new Date(d));

/** Normaliza un teléfono mexicano a 10 dígitos */
export function normalizarTelefono(tel: string) {
  const digitos = tel.replace(/\D/g, "");
  return digitos.length > 10 ? digitos.slice(-10) : digitos;
}

export function enmascararTelefono(tel: string) {
  const t = normalizarTelefono(tel);
  return t.length >= 4 ? `*** *** ${t.slice(-4)}` : t;
}

export function telefonoLegible(tel: string) {
  const t = normalizarTelefono(tel);
  if (t.length !== 10) return tel;
  return `${t.slice(0, 3)} ${t.slice(3, 6)} ${t.slice(6)}`;
}

export function normalizarContrato(numero: string) {
  return numero.trim().toUpperCase().replace(/\s+/g, "");
}

export function slugify(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function parsearLista(json: string | null | undefined): string[] {
  if (!json) return [];
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}

const usdFmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

/** Formatea según la moneda del plan */
export function dinero(centavos: number, moneda = "MXN") {
  return moneda === "USD" ? `${usdFmt.format(centavos / 100)} USD` : mxn(centavos);
}

export type Frec = "SEMANAL" | "QUINCENAL" | "MENSUAL";
export type Variante = {
  nombre: string;
  precioCentavos: number;
  inicialCentavos: number;
  abonos: Partial<Record<Frec, number>>;
  nota?: string;
};
export type Plazos = Partial<Record<Frec, number>>;

function json<T>(texto: string | null | undefined, porDefecto: T): T {
  if (!texto) return porDefecto;
  try {
    return JSON.parse(texto) as T;
  } catch {
    return porDefecto;
  }
}
export const parsearVariantes = (t: string | null | undefined) => json<Variante[]>(t, []);
export const parsearPlazos = (t: string | null | undefined) => json<Plazos>(t, {});

export const NOMBRE_FREC: Record<Frec, { plural: string; corto: string }> = {
  SEMANAL: { plural: "semanas", corto: "semana" },
  QUINCENAL: { plural: "quincenas", corto: "quincena" },
  MENSUAL: { plural: "meses", corto: "mes" },
};

/** Abono más bajo disponible del plan (para "desde $X al mes") */
export function abonoDesde(variantes: Variante[]) {
  let mejor: { monto: number; frec: Frec } | null = null;
  for (const v of variantes)
    for (const f of ["MENSUAL", "QUINCENAL", "SEMANAL"] as Frec[]) {
      const m = v.abonos[f];
      if (m && (!mejor || (f === "MENSUAL" && (mejor.frec !== "MENSUAL" || m < mejor.monto)))) mejor = { monto: m, frec: f };
    }
  return mejor;
}
