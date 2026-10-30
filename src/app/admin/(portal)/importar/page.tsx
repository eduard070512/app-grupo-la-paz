import { Download } from "lucide-react";
import { Encabezado } from "@/components/Piezas";
import { COLUMNAS } from "@/lib/importacion";
import { FormImportar } from "./FormImportar";

export const metadata = { title: "Importar datos" };

export default function Page() {
  return (
    <div className="space-y-6">
      <Encabezado
        titulo="Importar datos"
        texto="Migra la información del sistema actual con archivos CSV (se pueden exportar desde Excel: «Guardar como → CSV UTF-8»). Se puede repetir sin duplicar."
      />
      <div className="grid gap-4 lg:grid-cols-3">
        {(["contratos", "pagos", "beneficiarios"] as const).map((t, i) => (
          <section key={t} className="tarjeta p-5">
            <p className="text-xs font-semibold text-oro-600">Paso {i + 1}</p>
            <h2 className="titulo text-2xl capitalize">{t}</h2>
            <p className="mt-2 text-xs text-gris">
              <strong>Obligatorias:</strong> {COLUMNAS[t].requeridas.join(", ")}
              <br />
              <strong>Opcionales:</strong> {COLUMNAS[t].opcionales.join(", ")}
            </p>
            <a href={`/plantillas/${t}.csv`} download className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-paz-700 hover:underline">
              <Download className="h-4 w-4" /> Descargar plantilla
            </a>
            <FormImportar tipo={t} />
          </section>
        ))}
      </div>
      <section className="tarjeta p-5 text-sm text-gris">
        <h2 className="font-semibold text-paz-900">Reglas</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li><strong>casa_funeraria:</strong> la-paz, magana o ramos (o el nombre).</li>
          <li><strong>plan:</strong> código del catálogo (p. ej. LP-BOSNIA, MG-ZAFIRO, CF-DIAMANTE). Si no existe se crea un plan inactivo para no perder el contrato.</li>
          <li><strong>frecuencia:</strong> SEMANAL, QUINCENAL, MENSUAL o CONTADO. <strong>estatus:</strong> ACTIVO, LIQUIDADO, SUSPENDIDO, CANCELADO o UTILIZADO.</li>
          <li><strong>Fechas:</strong> AAAA-MM-DD o DD/MM/AAAA. <strong>Montos:</strong> en pesos, con o sin $ y comas.</li>
          <li>Los clientes se agrupan por <strong>clave_cliente</strong> (recomendado) o, si no viene, por teléfono + nombre. Así un cliente con varios contratos ve todos en su app.</li>
          <li>Para cargas de decenas de miles de filas usa la terminal: <code className="rounded bg-paz-50 px-1">npm run importar -- contratos archivo.csv</code></li>
        </ul>
      </section>
    </div>
  );
}
