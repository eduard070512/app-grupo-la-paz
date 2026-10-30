import { CatalogoPlanes } from "@/components/CatalogoPlanes";
import { Encabezado } from "@/components/Piezas";
import { funerariasActivas, planesActivos } from "@/lib/consultas";

export const metadata = { title: "Planes" };

export default async function Page({ searchParams }: { searchParams: Promise<{ casa?: string; categoria?: string }> }) {
  const { casa, categoria } = await searchParams;
  const [planes, funerarias] = await Promise.all([planesActivos(), funerariasActivas()]);
  return (
    <>
      <Encabezado titulo="Planes y servicios" texto="Conoce todo lo que Grupo La Paz ofrece para ti y tu familia. Prevenir es una decisión inteligente, valiente y llena de amor." />
      <CatalogoPlanes planes={planes} funerarias={funerarias} base="/clientes/planes" casa={casa} categoria={categoria} />
    </>
  );
}
