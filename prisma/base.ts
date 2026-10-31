/**
 * Datos base reales: casas funerarias y catálogo de planes.
 * Usa upsert, así que se puede correr cuantas veces sea necesario sin duplicar
 * (sirve también para actualizar precios después de editar catalogo.ts).
 */
import type { PrismaClient } from "@prisma/client";
import { CATALOGO } from "./catalogo";

const j = (v: unknown) => JSON.stringify(v);
const c = (pesos: number) => Math.round(pesos * 100);

export const FUNERARIAS = [
  { slug: "la-paz", nombre: "Funeraria La Paz", telefono: "3123124511", direccion: "Av. San Fernando No. 200, Centro, Colima, Col.", prefijo: "LP" },
  { slug: "magana", nombre: "Funeraria Magaña", telefono: "3123145151", direccion: "Colima, Col.", prefijo: "MG" },
  { slug: "ramos", nombre: "Funerales Ramos", telefono: "3414140298", direccion: "Zapotiltic, Jal.", prefijo: "RM" },
];

export async function cargarFunerarias(db: PrismaClient) {
  const r = [];
  for (const [orden, { prefijo, ...f }] of FUNERARIAS.entries()) {
    const fila = await db.funeraria.upsert({ where: { slug: f.slug }, create: { ...f, orden }, update: { ...f, orden } });
    r.push({ ...fila, prefijo });
  }
  return r;
}

export async function cargarCatalogo(db: PrismaClient) {
  const funerarias = Object.fromEntries((await db.funeraria.findMany()).map((f) => [f.slug, f.id]));
  const ids: Record<string, string> = {};
  for (const [orden, p] of CATALOGO.entries()) {
    const variantes = p.variantes.map((x) => ({
      nombre: x.nombre,
      precioCentavos: c(x.precio),
      inicialCentavos: c(x.inicial),
      abonos: Object.fromEntries(Object.entries(x.abonos).map(([k, m]) => [k, c(m!)])),
      ...(x.nota ? { nota: x.nota } : {}),
    }));
    const datos = {
      nombre: p.nombre,
      categoria: p.categoria,
      funerariaId: p.funeraria ? funerarias[p.funeraria] : null,
      subtitulo: p.subtitulo ?? null,
      resumen: p.resumen,
      moneda: p.moneda ?? "MXN",
      precioCentavos: Math.min(...variantes.map((x) => x.precioCentavos)),
      incluye: j(p.incluye),
      beneficios: j(p.beneficios),
      cremacion: j(p.cremacion ?? []),
      variantes: j(variantes),
      plazos: j(p.plazos),
      aplicaPara: p.aplicaPara ?? null,
      notas: p.notas ?? null,
      imagenUrl: `/planes/${p.imagen}-mini.jpg`,
      fichaUrl: `/planes/${p.imagen}.jpg`,
      orden,
    };
    const plan = await db.plan.upsert({ where: { codigo: p.codigo }, create: { codigo: p.codigo, ...datos }, update: datos });
    ids[p.codigo] = plan.id;
  }
  return ids;
}
