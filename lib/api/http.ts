import "server-only";

import { NextResponse } from "next/server";
import { getServerAuthContext } from "@/lib/supabase/auth-context.server";

export type ApiErrorCode =
  | "UNAUTHENTICATED"
  | "INVALID_JSON"
  | "PAYLOAD_TOO_LARGE"
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "DATABASE_ERROR"
  | "AI_UNAVAILABLE"
  | "AI_PROVIDER_ERROR"
  | "AI_INVALID_RESPONSE"
  | "SERVER_ERROR";

export function apiSuccess<T>(data: T, status = 200, meta?: Record<string, unknown>) {
  return NextResponse.json({ data, error: null, ...(meta ? { meta } : {}) }, { status });
}

export function apiError(code: ApiErrorCode, message: string, status: number) {
  return NextResponse.json({ data: null, error: { code, message } }, { status });
}

export async function requireApiUser() {
  try {
    const context = await getServerAuthContext();
    if (!context.user) {
      return { response: apiError("UNAUTHENTICATED", "Login diperlukan untuk mengakses data ini.", 401) } as const;
    }
    return { supabase: context.supabase, user: context.user } as const;
  } catch {
    return { response: apiError("SERVER_ERROR", "Sesi belum dapat diverifikasi.", 500) } as const;
  }
}

export async function readJson(request: Request): Promise<unknown> {
  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (declaredLength > 16_384) throw new ApiInputError("Ukuran request melewati batas 16 KB.", 413, "PAYLOAD_TOO_LARGE");

  try {
    const body = await request.text();
    if (new TextEncoder().encode(body).byteLength > 16_384) {
      throw new ApiInputError("Ukuran request melewati batas 16 KB.", 413, "PAYLOAD_TOO_LARGE");
    }
    return JSON.parse(body) as unknown;
  } catch (error) {
    if (error instanceof ApiInputError) throw error;
    throw new ApiInputError("Body harus berupa JSON yang valid.", 400, "INVALID_JSON");
  }
}

export class ApiInputError extends Error {
  constructor(message: string, public status: number, public code: "INVALID_JSON" | "PAYLOAD_TOO_LARGE") {
    super(message);
  }
}

export function inputErrorResponse(error: unknown) {
  if (error instanceof ApiInputError) {
    return apiError(error.code, error.message, error.status);
  }
  return apiError("SERVER_ERROR", "Request belum dapat diproses.", 500);
}

export function validationError(message: string) {
  return apiError("VALIDATION_ERROR", message, 400);
}

export function databaseError() {
  return apiError("DATABASE_ERROR", "Data belum dapat diproses. Coba kembali sebentar lagi.", 500);
}

export function notFoundError(entity: string) {
  return apiError("NOT_FOUND", `${entity} tidak ditemukan.`, 404);
}
