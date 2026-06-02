import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getDatabaseUrl, postgresOptions } from "./connection";
import * as schema from "./schema";

const connectionString = getDatabaseUrl();

if (!connectionString) {
  throw new Error(
    process.env.VERCEL
      ? "DATABASE_URL is not set in Vercel environment variables"
      : "DATABASE_URL is not set",
  );
}

const client = postgres(connectionString, postgresOptions(connectionString));

export const db = drizzle(client, { schema });
