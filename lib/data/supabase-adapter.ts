import type { BusinessProfileInput, BusinessProfileRecord, ProductRecord, TransactionRecord } from "./types";

interface ApiEnvelope<T> {
  data: T | null;
  error: { code: string; message: string } | null;
}

async function requestApi<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  const response = await fetch(path, {
    ...init,
    headers,
    credentials: "same-origin",
    cache: "no-store",
  });
  const payload = await response.json().catch(() => null) as ApiEnvelope<T> | null;
  if (!response.ok || !payload || payload.error) {
    throw new Error(payload?.error?.message || "Request ke server belum berhasil.");
  }
  return payload.data as T;
}

export function getProducts(): Promise<ProductRecord[]> {
  return requestApi<ProductRecord[]>("/api/products?limit=1000");
}

export function getTransactions(): Promise<TransactionRecord[]> {
  return requestApi<TransactionRecord[]>("/api/finance?limit=1000");
}

export async function addProduct(product: Omit<ProductRecord, "id" | "created_at" | "user_id">): Promise<void> {
  await requestApi<ProductRecord>("/api/products", { method: "POST", body: JSON.stringify(product) });
}

export async function updateProduct(id: string, product: Omit<ProductRecord, "id" | "created_at" | "user_id">): Promise<void> {
  await requestApi<ProductRecord>(`/api/products/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(product) });
}

export async function deleteProduct(id: string): Promise<void> {
  await requestApi<{ id: string }>(`/api/products/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export async function addTransaction(transaction: Omit<TransactionRecord, "id" | "created_at" | "user_id">): Promise<void> {
  await requestApi<TransactionRecord>("/api/finance", { method: "POST", body: JSON.stringify(transaction) });
}

export async function updateTransaction(id: string, transaction: Partial<Omit<TransactionRecord, "id" | "created_at" | "user_id">>): Promise<void> {
  await requestApi<TransactionRecord>(`/api/finance/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(transaction) });
}

export async function deleteTransaction(id: string): Promise<void> {
  await requestApi<{ id: string }>(`/api/finance/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export function getBusinessProfile(): Promise<BusinessProfileRecord | null> {
  return requestApi<BusinessProfileRecord | null>("/api/profile");
}

export async function saveBusinessProfile(profile: BusinessProfileInput): Promise<void> {
  await requestApi<BusinessProfileRecord>("/api/profile", { method: "PATCH", body: JSON.stringify(profile) });
}
