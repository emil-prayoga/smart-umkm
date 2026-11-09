import { NextResponse } from "next/server";
import { ensureBusinessProfile } from "@/lib/supabase/profile";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return NextResponse.json({ error: "Sesi tidak valid." }, { status: 401 });
  }

  try {
    const profile = await ensureBusinessProfile(supabase, data.user);
    return NextResponse.json({ profile });
  } catch (profileError) {
    console.error("Profile bootstrap failed:", profileError);
    return NextResponse.json(
      { error: "Profil usaha belum dapat dibuat. Pastikan migration database telah diterapkan." },
      { status: 503 },
    );
  }
}
