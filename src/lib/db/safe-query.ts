import { formatDbUserMessage } from "@/lib/db/connection";

function hasDbErrorCode(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  if (value instanceof AggregateError) {
    return value.errors.some((entry) => hasDbErrorCode(entry));
  }
  if ("code" in value) {
    const code = value.code;
    return (
      code === "28P01" ||
      code === "ECONNREFUSED" ||
      code === "ENOTFOUND" ||
      code === "ECONNRESET"
    );
  }
  if ("errors" in value && Array.isArray(value.errors)) {
    return value.errors.some((entry) => hasDbErrorCode(entry));
  }
  if ("cause" in value) return hasDbErrorCode(value.cause);
  return false;
}

export function isDbConnectionError(error: unknown): boolean {
  if (hasDbErrorCode(error)) return true;
  if (error instanceof Error) {
    return /authentication failed|ECONNREFUSED|ECONNRESET|ENOTFOUND|\bSSL\b/i.test(
      error.message,
    );
  }
  return false;
}

export async function safeQuery<T>(
  fn: () => Promise<T>,
): Promise<{ ok: true; data: T } | { ok: false; message: string }> {
  try {
    return { ok: true, data: await fn() };
  } catch (error) {
    if (isDbConnectionError(error)) {
      return { ok: false, message: formatDbUserMessage() };
    }
    throw error;
  }
}
