export function getDatabaseUrl(): string | undefined {
  const candidates = [
    process.env.DATABASE_URL?.trim(),
    process.env.POSTGRES_URL?.trim(),
    process.env.POSTGRES_PRISMA_URL?.trim(),
  ].filter((url): url is string => Boolean(url && url.length > 0));

  if (candidates.length === 0) return undefined;

  if (isVercelRuntime()) {
    const cloud = candidates.find((url) => !isLocalDatabaseUrl(url));
    if (cloud) return cloud;
  }

  return candidates[0];
}

function isLocalDatabaseUrl(url: string): boolean {
  return /localhost|127\.0\.0\.1/.test(url);
}

function isNeonDatabaseUrl(url: string): boolean {
  return url.includes("neon.tech");
}

function isVercelRuntime(): boolean {
  return process.env.VERCEL === "1" || process.env.VERCEL === "true";
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

export function formatDbUserMessage(): string {
  if (!getDatabaseUrl()) {
    return "Database is not configured. Contact the administrator.";
  }
  return "Could not connect to the database. Please try again later.";
}
