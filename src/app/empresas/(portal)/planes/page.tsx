import { db } from "@/lib/db";
import { requerirSesion } from "@/lib/sesion";
import { CatalogoPlanes } from "@/components/CatalogoPlanes";
import { Encabezado } from "@/components/Piezas";
import { funerariasActivas, planesActivos } from "@/lib/consultas";

export const metadata = { title: "Planes" };

export default async function Page({ searchParams }: { searchParams: Promise<{ casa?: string; categoria?: string }> }) {
  const s = await requerirSesion("empresa");
  const { casa, categoria } = await searchParams;
  const [empresa, planes, funerarias] = await Promise.all([db.empresa.findUniqueOrThrow({ where: { id: s.sub } }), planesActivos(), funerariasActivas()]);
  return (
    <>
      <Encabezado titulo="Planes y servicios" texto={`Precios con tu ${empresa.descuentoEmpleados}% de descuento como colaborador de ${empresa.nombre}.`} />
      <CatalogoPlanes planes={planes} funerarias={funerarias} base="/empresas/planes" casa={casa} categoria={categoria} descuento={empresa.descuentoEmpleados} />
    </>
  );
}
