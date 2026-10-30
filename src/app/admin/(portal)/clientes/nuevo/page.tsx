import { db } from "@/lib/db";
import { Encabezado } from "@/components/Piezas";
import { FormNuevoContrato } from "./FormNuevoContrato";
import { parsearPlazos, parsearVariantes } from "@/lib/formato";

export const metadata = { title: "Nuevo contrato" };

export default async function Page() {
  const [funerarias, planes] = await Promise.all([
    db.funeraria.findMany({ where: { activa: true }, orderBy: { orden: "asc" } }),
    db.plan.findMany({ orderBy: { orden: "asc" }, include: { funeraria: true } }),
  ]);
  return (
    <div className="mx-auto max-w-2xl">
      <Encabezado titulo="Nuevo contrato" texto="Registra un cliente nuevo (o un contrato adicional de un cliente existente: mismo nombre y teléfono)." />
      <div className="tarjeta p-5">
        <FormNuevoContrato
          funerarias={funerarias.map((f) => ({ id: f.id, nombre: f.nombre }))}
          planes={planes.map((p) => ({
            id: p.id,
            nombre: `${p.nombre} · ${p.funeraria?.nombre ?? "Grupo"}`,
            variantes: parsearVariantes(p.variantes),
            plazos: parsearPlazos(p.plazos),
          }))}
        />
      </div>
    </div>
  );
}
