import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import postgres from "postgres";

const url = process.env.DATABASE_URL?.trim();
if (!url) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const needsSsl =
  url.includes("neon.tech") ||
  url.includes("sslmode=require") ||
  url.includes("ssl=true");

const sqlFile = path.join(process.cwd(), "drizzle/migrations/0000_init.sql");
const migration = fs.readFileSync(sqlFile, "utf8");
const db = postgres(url, {
  max: 1,
  prepare: false,
  ssl: needsSsl ? "require" : undefined,
});

try {
  await db.unsafe(migration);
  console.log("Migration applied:", sqlFile);
} finally {
  await db.end();
}
