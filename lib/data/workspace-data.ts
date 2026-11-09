import type { BusinessProfileRecord, ProductRecord, TransactionRecord, WorkspaceMode } from "./types";
import { getDemoProducts, getDemoTransactions } from "./demo-fixture";

export async function getProducts(mode: WorkspaceMode): Promise<ProductRecord[]> {
  if (mode === "demo") return getDemoProducts();
  const adapter = await import("./supabase-adapter");
  return adapter.getProducts();
}

export async function getTransactions(mode: WorkspaceMode): Promise<TransactionRecord[]> {
  if (mode === "demo") return getDemoTransactions();
  const adapter = await import("./supabase-adapter");
  return adapter.getTransactions();
}

export async function getBusinessProfile(mode: WorkspaceMode): Promise<BusinessProfileRecord | null> {
  if (mode === "demo") {
    const { DEMO_STORE } = await import("./demo-fixture");
    return {
      user_id: "demo",
      store_name: DEMO_STORE.name,
      category: DEMO_STORE.category,
      location: DEMO_STORE.location,
    };
  }
  const adapter = await import("./supabase-adapter");
  return adapter.getBusinessProfile();
}

export async function saveBusinessProfile(
  mode: WorkspaceMode,
  profile: Omit<BusinessProfileRecord, "user_id">,
): Promise<void> {
  rejectDemoWrite(mode);
  const adapter = await import("./supabase-adapter");
  return adapter.saveBusinessProfile(profile);
}

function rejectDemoWrite(mode: WorkspaceMode): void {
  if (mode === "demo") throw new Error("Mode Demo hanya mengizinkan akses baca.");
}

export async function addProduct(mode: WorkspaceMode, product: Omit<ProductRecord, "id" | "created_at" | "user_id">): Promise<void> {
  rejectDemoWrite(mode);
  const adapter = await import("./supabase-adapter");
  return adapter.addProduct(product);
}

export async function updateProduct(mode: WorkspaceMode, id: string, product: Omit<ProductRecord, "id" | "created_at" | "user_id">): Promise<void> {
  rejectDemoWrite(mode);
  const adapter = await import("./supabase-adapter");
  return adapter.updateProduct(id, product);
}

export async function deleteProduct(mode: WorkspaceMode, id: string): Promise<void> {
  rejectDemoWrite(mode);
  const adapter = await import("./supabase-adapter");
  return adapter.deleteProduct(id);
}

export async function addTransaction(mode: WorkspaceMode, transaction: Omit<TransactionRecord, "id" | "created_at" | "user_id">): Promise<void> {
  rejectDemoWrite(mode);
  const adapter = await import("./supabase-adapter");
  return adapter.addTransaction(transaction);
}

export async function deleteTransaction(mode: WorkspaceMode, id: string): Promise<void> {
  rejectDemoWrite(mode);
  const adapter = await import("./supabase-adapter");
  return adapter.deleteTransaction(id);
}
