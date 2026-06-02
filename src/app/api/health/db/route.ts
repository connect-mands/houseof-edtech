import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  getDatabaseUrl,
  getDatabaseUrlSource,
  getMaskedDatabaseHost,
  isLocalDatabaseUrl,
  isVercelRuntime,
  logDbError,
} from "@/lib/db/connection";

/** Debug DB connectivity in production (no secrets returned). */
export async function GET() {
  const configuredUrl = process.env.DATABASE_URL?.trim();
  const resolvedHost = getMaskedDatabaseHost();
  const urlSource = getDatabaseUrlSource();

  try {
    await db.execute(sql`select 1`);
    return NextResponse.json({
      ok: true,
      vercel: isVercelRuntime(),
      urlSource,
      host: resolvedHost,
      databaseUrlIsLocalhost: configuredUrl ? isLocalDatabaseUrl(configuredUrl) : null,
      hint:
        configuredUrl && isLocalDatabaseUrl(configuredUrl) && isVercelRuntime()
          ? "DATABASE_URL points to localhost on Vercel — remove or replace it; use your Neon URL."
          : undefined,
    });
  } catch (error) {
    logDbError(error, "GET /api/health/db");
    return NextResponse.json(
      {
        ok: false,
        vercel: isVercelRuntime(),
        urlSource,
        host: resolvedHost,
        databaseUrlIsLocalhost: configuredUrl ? isLocalDatabaseUrl(configuredUrl) : null,
        hasDatabaseUrl: Boolean(getDatabaseUrl()),
      },
      { status: 503 },
    );
  }
}
