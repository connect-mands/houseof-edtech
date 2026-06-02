/** Shared Postgres.js options for local Docker, Neon, and Vercel. */
export function getDatabaseUrl(): string | undefined {
  const candidates = [
    process.env.DATABASE_URL?.trim(),
    process.env.POSTGRES_URL?.trim(),
    process.env.POSTGRES_PRISMA_URL?.trim(),
  ].filter((url): url is string => Boolean(url && url.length > 0));

  if (candidates.length === 0) return undefined;

  // On Vercel, prefer a cloud URL if DATABASE_URL was left as localhost by mistake.
  if (isVercelRuntime()) {
    const cloud = candidates.find((url) => !isLocalDatabaseUrl(url));
    if (cloud) return cloud;
  }

  return candidates[0];
}

export function getDatabaseUrlSource(): "DATABASE_URL" | "POSTGRES_URL" | "POSTGRES_PRISMA_URL" | "none" {
  const url = getDatabaseUrl();
  if (!url) return "none";
  if (process.env.DATABASE_URL?.trim() === url) return "DATABASE_URL";
  if (process.env.POSTGRES_URL?.trim() === url) return "POSTGRES_URL";
  if (process.env.POSTGRES_PRISMA_URL?.trim() === url) return "POSTGRES_PRISMA_URL";
  // Resolved from a different env var than DATABASE_URL (e.g. Neon POSTGRES_URL on Vercel)
  if (process.env.POSTGRES_URL?.trim() && !isLocalDatabaseUrl(process.env.POSTGRES_URL)) {
    return "POSTGRES_URL";
  }
  return "DATABASE_URL";
}

export function isLocalDatabaseUrl(url: string): boolean {
  return /localhost|127\.0\.0\.1/.test(url);
}

export function isNeonDatabaseUrl(url: string): boolean {
  return url.includes("neon.tech");
}

export function getMaskedDatabaseHost(): string {
  const url = getDatabaseUrl();
  if (!url) return "(not set)";
  try {
    const parsed = new URL(url.replace(/^postgresql:/i, "http:"));
    const port = parsed.port ? `:${parsed.port}` : "";
    return `${parsed.hostname}${port}${parsed.pathname}`;
  } catch {
    return "(invalid DATABASE_URL)";
  }
}

export function isVercelRuntime(): boolean {
  return process.env.VERCEL === "1" || process.env.VERCEL === "true";
}

function extractErrorCode(error: unknown): string | undefined {
  if (!error || typeof error !== "object") return undefined;
  if ("code" in error && typeof error.code === "string") return error.code;
  if ("cause" in error && error.cause) return extractErrorCode(error.cause);
  if (error instanceof AggregateError) {
    for (const entry of error.errors) {
      const code = extractErrorCode(entry);
      if (code) return code;
    }
  }
  if ("errors" in error && Array.isArray(error.errors)) {
    for (const entry of error.errors) {
      const code = extractErrorCode(entry);
      if (code) return code;
    }
  }
  return undefined;
}

function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

/** Server-side diagnostics — always logged; never shown verbatim to users. */
export function logDbError(error: unknown, context?: string): void {
  console.error("DB ERROR:", error);
  console.error("[db] context:", context ?? "unknown");
  console.error("[db] message:", extractErrorMessage(error));
  console.error("[db] code:", extractErrorCode(error) ?? "(none)");
  console.error("[db] host:", getMaskedDatabaseHost());
  console.error("[db] urlSource:", getDatabaseUrlSource());
  console.error("[db] VERCEL:", isVercelRuntime());
}

export function postgresOptions(connectionString: string) {
  const needsSsl =
    isNeonDatabaseUrl(connectionString) ||
    connectionString.includes("sslmode=require") ||
    connectionString.includes("ssl=true");

  return {
    prepare: false as const,
    ssl: needsSsl ? ("require" as const) : undefined,
    max: isVercelRuntime() ? 1 : 10,
  };
}

/** Short UI copy only — details go to server logs via logDbError. */
export function formatDbUserMessage(): string {
  if (!getDatabaseUrl()) {
    return "Database is not configured. Set DATABASE_URL and redeploy.";
  }
  return "Could not connect to the database. Check deployment logs for details.";
}
