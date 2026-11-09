import "server-only";

import { getServerAuthContext } from "@/lib/supabase/auth-context.server";
import type { ProductRecord, TransactionRecord } from "./types";

async function requireUserDataContext() {
  const context = await getServerAuthContext();
  if (!context.user) throw new Error("Sesi pengguna tidak valid. Silakan login kembali.");
  return { supabase: context.supabase, user: context.user };
}

export async function getServerProducts(): Promise<ProductRecord[]> {
  const { supabase, user } = await requireUserDataContext();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as ProductRecord[];
}

export async function getServerTransactions(): Promise<TransactionRecord[]> {
  const { supabase, user } = await requireUserDataContext();
  const { data, error } = await supabase
    .from("cash_flows")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as TransactionRecord[];
}

