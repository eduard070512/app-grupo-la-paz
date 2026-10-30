import "server-only";
import { db } from "./db";

export function promocionesVigentes(audiencia: "CLIENTES" | "EMPRESAS", limite?: number) {
  const ahora = new Date();
  return db.promocion.findMany({
    where: {
      activa: true,
      audiencia: { in: [audiencia, "TODOS"] },
      vigenteDesde: { lte: ahora },
      OR: [{ vigenteHasta: null }, { vigenteHasta: { gte: ahora } }],
    },
    orderBy: [{ orden: "asc" }, { creadoEn: "desc" }],
    take: limite,
  });
}

export function planesActivos() {
  return db.plan.findMany({ where: { activo: true }, include: { funeraria: true }, orderBy: { orden: "asc" } });
}

export function funerariasActivas() {
  return db.funeraria.findMany({ where: { activa: true }, orderBy: { orden: "asc" } });
}

export function aliadosVisibles(excluir?: string) {
  return db.empresa.findMany({
    where: { activa: true, visibleDirectorio: true, ...(excluir ? { NOT: { id: excluir } } : {}) },
    orderBy: { nombre: "asc" },
  });
}
