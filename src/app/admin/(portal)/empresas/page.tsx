import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { Encabezado } from "@/components/Piezas";
import { fechaCorta } from "@/lib/formato";

export const metadata = { title: "Empresas" };

export default async function Page() {
  const empresas = await db.empresa.findMany({ orderBy: { nombre: "asc" }, include: { _count: { select: { solicitudes: true } } } });
  return (
    <>
      <Encabezado titulo="Empresas afiliadas" texto="Cada empresa tiene un solo usuario que comparte con sus colaboradores.">
        <Link href="/admin/empresas/nueva" className="btn-primario"><Plus className="h-4 w-4" /> Nueva empresa</Link>
      </Encabezado>
      <div className="tarjeta overflow-x-auto">
        <table className="tabla min-w-[680px]">
          <thead><tr><th>Empresa</th><th>Usuario</th><th>Descuento</th><th>Solicitudes</th><th>Último acceso</th><th>Estado</th></tr></thead>
          <tbody>
            {empresas.map((e) => (
              <tr key={e.id}>
                <td><Link href={`/admin/empresas/${e.id}`} className="font-semibold text-paz-800 hover:underline">{e.nombre}</Link><span className="block text-xs text-gris">{e.giro}</span></td>
                <td className="font-mono text-xs">{e.usuario}</td>
                <td>{e.descuentoEmpleados}%</td>
                <td>{e._count.solicitudes}</td>
                <td className="text-xs">{e.ultimoAcceso ? fechaCorta(e.ultimoAcceso) : "—"}</td>
                <td>{e.activa ? <span className="chip bg-emerald-50 text-emerald-700">Activa</span> : <span className="chip bg-gray-100 text-gray-600">Inactiva</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
