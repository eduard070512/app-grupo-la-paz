/**
 * Importación desde la terminal (para migraciones grandes).
 *
 *   npm run importar -- contratos ruta/contratos.csv
 *   npm run importar -- pagos ruta/pagos.csv
 *   npm run importar -- beneficiarios ruta/beneficiarios.csv
 *
 * Orden recomendado: contratos → pagos → beneficiarios. Se puede repetir sin duplicar.
 */
import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";
import { importar, type TipoImportacion } from "../src/lib/importacion";

const [tipo, archivo] = process.argv.slice(2) as [TipoImportacion, string];
if (!["contratos", "pagos", "beneficiarios"].includes(tipo) || !archivo) {
  console.error("Uso: npm run importar -- <contratos|pagos|beneficiarios> <archivo.csv>");
  process.exit(1);
}

const db = new PrismaClient();
importar(db, tipo, readFileSync(archivo, "utf8"))
  .then((r) => {
    console.log(`Filas: ${r.filas} · creados: ${r.creados} · actualizados: ${r.actualizados} · omitidos (duplicados): ${r.omitidos} · errores: ${r.errores.length}`);
    r.avisos.forEach((a) => console.log(`  aviso: ${a}`));
    r.errores.slice(0, 200).forEach((e) => console.log(`  fila ${e.fila}: ${e.mensaje}`));
    if (r.errores.length > 200) console.log(`  … y ${r.errores.length - 200} errores más`);
  })
  .finally(() => db.$disconnect());
