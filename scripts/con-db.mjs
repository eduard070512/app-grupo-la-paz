/**
 * Ejecuta un comando asegurando que Prisma tenga DATABASE_URL y DIRECT_URL.
 *
 * La integración Neon ↔ Vercel crea DATABASE_URL (pooled) y DATABASE_URL_UNPOOLED,
 * pero no DIRECT_URL. Aquí se completa con lo que exista:
 *   DIRECT_URL ← DIRECT_URL | DATABASE_URL_UNPOOLED | POSTGRES_URL_NON_POOLING | DATABASE_URL sin "-pooler"
 *
 *   node scripts/con-db.mjs prisma migrate deploy
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

// Cargar .env local si existe (en Vercel las variables ya vienen en el entorno)
if (existsSync(".env")) {
  for (const linea of readFileSync(".env", "utf8").split("\n")) {
    const m = linea.match(/^\s*([A-Z0-9_]+)\s*=\s*"?(.*?)"?\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
  }
}

const e = process.env;
e.DATABASE_URL ||= e.POSTGRES_PRISMA_URL || e.POSTGRES_URL || "";
e.DIRECT_URL ||= e.DATABASE_URL_UNPOOLED || e.POSTGRES_URL_NON_POOLING || e.DATABASE_URL.replace("-pooler.", ".");

if (!e.DATABASE_URL) {
  console.error(
    "\n✗ Falta la variable DATABASE_URL.\n" +
      "  En Vercel: Settings → Environment Variables → agrega DATABASE_URL con la cadena de conexión de Neon\n" +
      "  (o conecta Neon desde la pestaña Storage de Vercel).\n" +
      "  En local: ponla en el archivo .env (ver .env.example).\n",
  );
  process.exit(1);
}

const [cmd, ...args] = process.argv.slice(2);
const r = spawnSync(cmd, args, { stdio: "inherit", env: e, shell: process.platform === "win32" });
process.exit(r.status ?? 1);
