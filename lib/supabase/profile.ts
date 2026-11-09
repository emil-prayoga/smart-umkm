import "server-only";

import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { BusinessProfileInput } from "@/lib/data/types";

function metadataText(value: unknown, fallback: string): string {
  return typeof value === "string" ? value.trim().slice(0, 120) : fallback;
}

export async function ensureBusinessProfile(
  supabase: SupabaseClient,
  user: User,
) {
  const { data: existing, error: readError } = await supabase
    .from("profiles")
    .select("user_id, store_name, category, location")
    .eq("user_id", user.id)
    .maybeSingle();

  if (readError) throw readError;
  if (existing) return existing;

  const metadata = user.user_metadata ?? {};
  const profile: BusinessProfileInput = {
    store_name: metadataText(metadata.store_name, "Usaha Saya"),
    category: metadataText(metadata.category, "Lainnya"),
    location: metadataText(metadata.location, ""),
  };

  const { data, error } = await supabase
    .from("profiles")
    .upsert({ ...profile, user_id: user.id }, { onConflict: "user_id" })
    .select("user_id, store_name, category, location")
    .single();

  if (error) throw error;
  return data;
}
