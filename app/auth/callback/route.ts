import { NextResponse, type NextRequest } from "next/server";
import { ensureBusinessProfile } from "@/lib/supabase/profile";
import { createClient } from "@/lib/supabase/server";
import { safeInternalPath } from "@/lib/supabase/require-user";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const nextPath = safeInternalPath(request.nextUrl.searchParams.get("next"));
  if (!code) {
    return NextResponse.redirect(new URL("/login?error=callback", request.url));
  }

  const supabase = await createClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    return NextResponse.redirect(new URL("/login?error=callback", request.url));
  }

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return NextResponse.redirect(new URL("/login?error=session", request.url));
  }

  try {
    await ensureBusinessProfile(supabase, data.user);
  } catch (profileError) {
    console.error("Profile bootstrap failed:", profileError);
    return NextResponse.redirect(new URL("/login?error=profile", request.url));
  }

  return NextResponse.redirect(new URL(nextPath, request.url));
}
