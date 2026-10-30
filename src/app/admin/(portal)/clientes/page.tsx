import Link from "next/link";
import { Plus, Search } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { estadoDeCuenta } from "@/lib/contratos";
import { dinero, normalizarTelefono, telefonoLegible } from "@/lib/formato";
import { Encabezado, Vacio } from "@/components/Piezas";
import { ChipSituacion } from "@/components/TarjetaContrato";

export const metadata = { title: "Clientes" };
const POR_PAGINA = 25;

export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string; p?: string; casa?: string }> }) {
  const { q = "", p = "1", casa = "" } = await searchParams;
  const pagina = Math.max(1, Number(p) || 1);
  const tel = normalizarTelefono(q);
  const where: Prisma.ClienteWhereInput = {
    ...(casa ? { funeraria: { slug: casa } } : {}),
    ...(q
      ? {
          OR: [
            { nombre: { contains: q } },
            { email: { contains: q.toLowerCase() } },
            { contratos: { some: { numero: { contains: q.toUpperCase() } } } },
            ...(tel.length >= 4 ? [{ telefono: { contains: tel } }] : []),
          ],
        }
      : {}),
  };
  const [total, clientes, funerarias] = await Promise.all([
    db.cliente.count({ where }),
    db.cliente.findMany({
      where,
      orderBy: { nombre: "asc" },
      skip: (pagina - 1) * POR_PAGINA,
      take: POR_PAGINA,
      include: { funeraria: true, contratos: { include: { plan: { select: { nombre: true, moneda: true } }, pagos: { select: { montoCentavos: true, fecha: true } } } } },
    }),
    db.funeraria.findMany({ orderBy: { orden: "asc" } }),
  ]);
  const paginas = Math.ceil(total / POR_PAGINA);
  const url = (n: number) => `/admin/clientes?${new URLSearchParams({ ...(q && { q }), ...(casa && { casa }), p: String(n) })}`;

  return (
    <>
      <Encabezado titulo="Clientes" texto={`${total.toLocaleString("es-MX")} clientes`}>
        <Link href="/admin/clientes/nuevo" className="btn-primario"><Plus className="h-4 w-4" /> Nuevo contrato</Link>
      </Encabezado>
      <form className="mb-4 flex flex-wrap gap-2">
        <div className="relative min-w-60 flex-1">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-gris" />
          <input name="q" defaultValue={q} className="campo pl-10" placeholder="Nombre, contrato, teléfono o correo" />
        </div>
        <select name="casa" defaultValue={casa} className="campo w-auto">
          <option value="">Todas las casas</option>
          {funerarias.map((f) => <option key={f.id} value={f.slug}>{f.nombre}</option>)}
        </select>
        <button className="btn-secundario">Buscar</button>
      </form>
      {clientes.length ? (
        <div className="tarjeta overflow-x-auto">
          <table className="tabla min-w-[720px]">
            <thead>
              <tr><th>Cliente</th><th>Contratos</th><th>Situación</th><th className="text-right">Saldo</th><th>App</th></tr>
            </thead>
            <tbody>
              {clientes.map((c) => (
                <tr key={c.id} className="hover:bg-paz-50/60">
                  <td>
                    <Link href={`/admin/clientes/${c.id}`} className="font-semibold text-paz-800 hover:underline">{c.nombre}</Link>
                    <span className="block text-xs text-gris">{telefonoLegible(c.telefono)} · {c.funeraria.nombre}</span>
                  </td>
                  <td className="text-xs">{c.contratos.map((k) => <span key={k.id} className="block">{k.numero} · {k.plan.nombre}</span>)}</td>
                  <td>{c.contratos.map((k) => <span key={k.id} className="mb-1 block"><ChipSituacion situacion={estadoDeCuenta(k, k.pagos).situacion} /></span>)}</td>
                  <td className="text-right text-xs">{c.contratos.map((k) => <span key={k.id} className="block font-semibold">{dinero(estadoDeCuenta(k, k.pagos).saldo, k.plan.moneda)}</span>)}</td>
                  <td>{c.activadoEn ? <span className="chip bg-emerald-50 text-emerald-700">Activa</span> : <span className="chip bg-gray-100 text-gray-600">Sin activar</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Vacio>Sin resultados.</Vacio>
      )}
      {paginas > 1 && (
        <nav className="mt-4 flex items-center justify-center gap-2 text-sm">
          {pagina > 1 && <Link href={url(pagina - 1)} className="btn-secundario px-3 py-2">Anterior</Link>}
          <span className="text-gris">Página {pagina} de {paginas}</span>
          {pagina < paginas && <Link href={url(pagina + 1)} className="btn-secundario px-3 py-2">Siguiente</Link>}
        </nav>
      )}
    </>
  );
}
