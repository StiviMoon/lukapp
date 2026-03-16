/**
 * Valida la conexión a la base de datos Supabase.
 * Ejecutar: npm run db:validate
 *
 * Si falla, revisa en Supabase Dashboard → Project Settings → Database
 * que DATABASE_URL y DIRECT_URL en .env coincidan con el proyecto actual.
 */
import "dotenv/config";
import { checkDatabaseConnection } from "../db/utils";

async function main() {
  console.log("🔍 Validando conexión a Supabase...\n");

  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL no está definida en .env");
    console.log("\nObtén la connection string en:");
    console.log("  https://supabase.com/dashboard/project/_/settings/database");
    process.exit(1);
  }

  const ok = await checkDatabaseConnection();

  if (ok) {
    console.log("✅ Conexión exitosa. Puedes ejecutar migraciones con:");
    console.log("   npm run db:migrate:deploy\n");
    process.exit(0);
  }

  console.error("\n❌ No se pudo conectar. Comprueba:");
  console.error("  1. Que el proyecto en Supabase esté activo (no pausado).");
  console.error("  2. Que DATABASE_URL y DIRECT_URL en Lukapp-b/.env sean del proyecto correcto.");
  console.error("  3. En Dashboard → Database → Connection string, copia URI (Transaction) y (Session).");
  process.exit(1);
}

main();
