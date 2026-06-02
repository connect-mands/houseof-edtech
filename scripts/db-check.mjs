import "dotenv/config";
import postgres from "postgres";

const url =
  process.env.DATABASE_URL?.trim() ||
  process.env.POSTGRES_URL?.trim();

if (!url) {
  console.error("DATABASE_URL is missing from .env");
  process.exit(1);
}

const needsSsl =
  url.includes("neon.tech") ||
  url.includes("sslmode=require") ||
  url.includes("ssl=true");

const sql = postgres(url, {
  max: 1,
  prepare: false,
  ssl: needsSsl ? "require" : undefined,
});

try {
  await sql`select 1 as ok`;
  const host = url.replace(/:[^:@]+@/, ":****@");
  console.log("Database connection OK:", host);
} catch (error) {
  console.error("Database connection failed.");
  console.error(error?.message ?? error);
  if (/localhost|127\.0\.0\.1/.test(url) && process.env.VERCEL) {
    console.error("\nOn Vercel you must use your Neon URL, not localhost.");
  } else if (url.includes("neon.tech")) {
    console.error("\nNeon: use the connection string with ?sslmode=require from console.neon.tech");
    console.error("Then run: DATABASE_URL=\"your-url\" npm run db:migrate");
  } else {
    console.error("\nLocal: docker compose up -d && npm run db:migrate");
  }
  process.exit(1);
} finally {
  await sql.end();
}
