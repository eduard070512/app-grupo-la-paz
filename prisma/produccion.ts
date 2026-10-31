/**
 * Carga inicial para PRODUCCIÓN (no borra nada, se puede repetir):
 *  - Casas funerarias del grupo
 *  - Catálogo real de planes (también actualiza precios si editaste catalogo.ts)
 *  - Usuario administrador, tomado de ADMIN_EMAIL / ADMIN_NOMBRE / ADMIN_PASSWORD
 *
 *   npm run db:produccion
 *
 * Los clientes reales se cargan después con Admin → Importar (o npm run importar).
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { cargarCatalogo, cargarFunerarias } from "./base";

const db = new PrismaClient();

async function main() {
  const funerarias = await cargarFunerarias(db);
  console.log(`✓ ${funerarias.length} casas funerarias`);
  const planes = await cargarCatalogo(db);
  console.log(`✓ ${Object.keys(planes).length} planes en el catálogo`);

  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "";
  const nombre = process.env.ADMIN_NOMBRE?.trim() || "Administración La Paz";
  if (!email) {
    console.log("· ADMIN_EMAIL no está definido: no se creó administrador.");
  } else if (password.length < 10) {
    console.error("✗ ADMIN_PASSWORD debe tener al menos 10 caracteres.");
    process.exitCode = 1;
  } else {
    const passwordHash = bcrypt.hashSync(password, 10);
    await db.admin.upsert({ where: { email }, create: { email, nombre, passwordHash }, update: { nombre, passwordHash } });
    console.log(`✓ Administrador ${email}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
