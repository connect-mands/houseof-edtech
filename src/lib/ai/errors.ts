import { APICallError } from "ai";

function getNestedApiError(error: unknown): APICallError | null {
  if (error instanceof APICallError) return error;
  if (error && typeof error === "object") {
    if ("lastError" in error && error.lastError) {
      return getNestedApiError(error.lastError);
    }
    if ("errors" in error && Array.isArray(error.errors) && error.errors[0]) {
      return getNestedApiError(error.errors[0]);
    }
    if ("cause" in error && error.cause) {
      return getNestedApiError(error.cause);
    }
  }
  return null;
}

export function mapAiProviderError(error: unknown): {
  message: string;
  status: number;
} {
  const apiError = getNestedApiError(error);

  if (apiError) {
    const status = apiError.statusCode ?? 502;

    if (status === 401 || status === 403) {
      return {
        status: 401,
        message:
          "Invalid Groq API key. Set GROQ_API_KEY in .env (from https://console.groq.com/keys), then restart the dev server.",
      };
    }
    if (status === 429) {
      return {
        status: 429,
        message:
          "Groq rate limit exceeded. Wait a moment or check limits at https://console.groq.com",
      };
    }

    let detail = apiError.message;
    if (apiError.responseBody && typeof apiError.responseBody === "string") {
      try {
        const json = JSON.parse(apiError.responseBody) as {
          error?: { message?: string };
        };
        if (json.error?.message) detail = json.error.message;
      } catch {
        /* keep default */
      }
    }

    return {
      status,
      message: `Groq error (${status}): ${detail}`,
    };
  }

  if (error instanceof Error && process.env.NODE_ENV === "development") {
    return { status: 502, message: `AI error: ${error.message}` };
  }

  return {
    status: 502,
    message: "AI provider request failed. Try again later.",
  };
}
