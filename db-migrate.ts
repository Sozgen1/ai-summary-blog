import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db, pool } from "./server/db";

console.log("Running database migrations...");

async function main() {
  try {
    // Push schema to database
    console.log("Migrating database schema...");
    await migrate(db, { migrationsFolder: "drizzle" });
    console.log("Database migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();