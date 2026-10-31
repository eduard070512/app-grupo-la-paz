/**
 * Se ejecuta en cada despliegue (vercel-build). Solo actúa si la base está VACÍA:
 *  - CARGA_INICIAL=produccion → funerarias, catálogo y admin (ADMIN_EMAIL / ADMIN_PASSWORD)
 *  - cualquier otro valor     → datos de demostración
 * Si la base ya tiene datos, no hace nada.
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const funerarias = await db.funeraria.count();
  await db.$disconnect();
  if (funerarias > 0) {
    console.log("· La base ya tiene datos: no se carga nada.");
    return;
  }
  if (process.env.CARGA_INICIAL === "produccion") {
    console.log("· Base vacía → carga inicial de PRODUCCIÓN");
    await import("./produccion");
  } else {
    console.log("· Base vacía → carga de DEMO (define CARGA_INICIAL=produccion para datos reales)");
    await import("./seed");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
