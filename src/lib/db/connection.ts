/** Shared Postgres.js options for local Docker, Neon, and Vercel. */
export function getDatabaseUrl(): string | undefined {
  const url =
    process.env.DATABASE_URL?.trim() ||
    process.env.POSTGRES_URL?.trim() ||
    process.env.POSTGRES_PRISMA_URL?.trim();
  return url && url.length > 0 ? url : undefined;
}

export function isLocalDatabaseUrl(url: string): boolean {
  return /localhost|127\.0\.0\.1/.test(url);
}

export function isNeonDatabaseUrl(url: string): boolean {
  return url.includes("neon.tech");
}

export function postgresOptions(connectionString: string) {
  const needsSsl =
    isNeonDatabaseUrl(connectionString) ||
    connectionString.includes("sslmode=require") ||
    connectionString.includes("ssl=true");

  return {
    prepare: false as const,
    ssl: needsSsl ? ("require" as const) : undefined,
    /** Serverless-friendly pool size on Vercel */
    max: process.env.VERCEL ? 1 : 10,
  };
}

export function formatDbConnectionHelp(): string {
  const url = getDatabaseUrl() ?? "";

  if (!url) {
    if (process.env.VERCEL) {
      return "DATABASE_URL is not set on Vercel. In your project → Settings → Environment Variables, add DATABASE_URL with your Neon connection string (from console.neon.tech), then redeploy.";
    }
    return "DATABASE_URL is missing. Add it to your .env file.";
  }

  if (process.env.VERCEL && isLocalDatabaseUrl(url)) {
    return "DATABASE_URL on Vercel points to localhost, which will not work in production. Replace it with your Neon connection string in Vercel → Settings → Environment Variables, then redeploy.";
  }

  if (isNeonDatabaseUrl(url) || process.env.VERCEL) {
    return "Cannot connect to the database. Confirm DATABASE_URL in Vercel matches Neon’s connection string (include ?sslmode=require), run migrations once from your machine (DATABASE_URL=\"your-neon-url\" npm run db:migrate), then redeploy.";
  }

  const port = url.match(/:(\d+)\//)?.[1] ?? "5433";
  return `Database is not reachable locally. Start Docker Desktop, run "docker compose up -d", then "npm run db:migrate". Use port ${port} in .env, e.g. postgresql://lessonforge:lessonforge@localhost:${port}/lessonforge`;
}
