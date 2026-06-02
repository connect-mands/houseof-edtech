import "dotenv/config";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is missing from .env");
  process.exit(1);
}

const sql = postgres(url, { max: 1 });

try {
  await sql`select 1 as ok`;
  console.log("Database connection OK:", url.replace(/:[^:@]+@/, ":****@"));
} catch (error) {
  console.error("Database connection failed.");
  console.error(error?.message ?? error);
  console.error("\nFix: Docker Desktop on → docker compose up -d → npm run db:migrate");
  process.exit(1);
} finally {
  await sql.end();
}
