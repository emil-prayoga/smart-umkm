import "server-only";

import { redirect } from "next/navigation";
import { getServerAuthContext } from "@/lib/supabase/auth-context.server";

/** Server-side page guard. Data access still needs its own owner filters and RLS. */
export async function requirePageUser(nextPath: string) {
  const { user } = await getServerAuthContext();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }
  return user;
}

export function safeInternalPath(value: string | null | undefined, fallback = "/dashboard"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\") || /[\u0000-\u001f]/.test(value)) {
    return fallback;
  }

  try {
    const base = new URL("https://smart-umkm.invalid");
    const parsed = new URL(value, base);
    return parsed.origin === base.origin ? `${parsed.pathname}${parsed.search}${parsed.hash}` : fallback;
  } catch {
    return fallback;
  }
}
