import {
  ApiError,
  type HashAlgorithm,
  type HashResultResponse,
  type JsonResultResponse,
  type JsonValidateResponse,
  type JwtDecodeResponse,
  type UuidResultResponse,
} from "@/lib/types";

export const API_BASE_URL =
  process.env.API_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  (process.env.NODE_ENV === "development" ? "http://localhost:5183" : "");

function getRequestBaseUrl(): string {
  if (typeof window !== "undefined") {
    return "/api-proxy";
  }

  return API_BASE_URL;
}

async function parseErrorResponse(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as {
      error?: string;
      message?: string;
      title?: string;
      detail?: string;
    };

    if (data.error && data.message) {
      return `${data.error} ${data.message}`.trim();
    }

    if (data.error) {
      return data.error;
    }

    if (data.message) {
      return data.message;
    }

    if (data.title && data.detail) {
      return `${data.title} ${data.detail}`.trim();
    }

    if (data.title) {
      return data.title;
    }
  } catch {
    // ignore parse failures
  }

  if (response.status === 404) {
    return "The requested API endpoint was not found.";
  }

  if (response.status >= 500) {
    return "The DevToolset API encountered an error. Try again shortly.";
  }

  if (response.status === 413) {
    return "That input is too large. Reduce it and try again.";
  }

  if (response.status === 429) {
    return "Too many requests. Wait a moment and try again.";
  }

  return "The request could not be completed.";
}

async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const url = `${getRequestBaseUrl()}${path}`;

  try {
    const response = await fetch(url, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init?.headers ?? {}),
      },
    });

    if (!response.ok) {
      const message = await parseErrorResponse(response);
      throw new ApiError(message, response.status);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      "DevToolset API is unavailable. Check that the backend is running.",
      0,
    );
  }
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

async function postRawJsonString<T>(
  path: string,
  rawValue: string,
): Promise<T> {
  return request<T>(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(rawValue),
  });
}

export async function checkApiConnectivity(): Promise<boolean> {
  try {
    const response = await fetch(`${getRequestBaseUrl()}/api/health`, {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    return response.ok;
  } catch {
    return false;
  }
}

export const api = {
  json: {
    format: (json: string) =>
      postJson<JsonResultResponse>("/api/json/format", { json }),
    validate: (json: string) =>
      postJson<JsonValidateResponse>("/api/json/validate", { json }),
    minify: (json: string) =>
      postJson<JsonResultResponse>("/api/json/minify", { json }),
  },
  encoding: {
    base64Encode: (value: string) =>
      postJson<JsonResultResponse>("/api/encoding/base64/encode", { value }),
    base64Decode: (value: string) =>
      postJson<JsonResultResponse>("/api/encoding/base64/decode", { value }),
    urlEncode: (value: string) =>
      postJson<JsonResultResponse>("/api/encoding/url/encode", { value }),
    urlDecode: (value: string) =>
      postJson<JsonResultResponse>("/api/encoding/url/decode", { value }),
  },
  security: {
    hash: (value: string, algorithm: HashAlgorithm) =>
      postJson<HashResultResponse>("/api/security/hash", {
        value,
        algorithm,
      }),
    decodeJwt: (token: string) =>
      postRawJsonString<JwtDecodeResponse>("/api/security/jwt/decode", token),
  },
  generator: {
    uuid: () =>
      request<UuidResultResponse>("/api/generator/uuid", {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
      }),
  },
};
