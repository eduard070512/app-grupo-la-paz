import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Encabezado } from "@/components/Piezas";
import { FormEmpresa } from "../FormEmpresa";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const empresa = await db.empresa.findUnique({ where: { id: (await params).id } });
  if (!empresa) notFound();
  return (
    <div className="mx-auto max-w-2xl">
      <Encabezado titulo={empresa.nombre} />
      <div className="tarjeta p-5"><FormEmpresa empresa={empresa} /></div>
    </div>
  );
}
