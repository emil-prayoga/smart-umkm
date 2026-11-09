import { apiSuccess, databaseError, inputErrorResponse, readJson, requireApiUser, validationError } from "@/lib/api/http";
import { asBusinessProfile } from "@/lib/api/validation";

export async function GET() {
  const auth = await requireApiUser();
  if ("response" in auth) return auth.response;

  try {
    const { data, error } = await auth.supabase
      .from("profiles")
      .select("user_id, store_name, category, location")
      .eq("user_id", auth.user.id)
      .maybeSingle();
    if (error) return databaseError();
    return apiSuccess(data);
  } catch {
    return databaseError();
  }
}

export async function PATCH(request: Request) {
  const auth = await requireApiUser();
  if ("response" in auth) return auth.response;

  try {
    const body = await readJson(request);
    const profile = asBusinessProfile(body);
    if (!profile) return validationError("Nama usaha, kategori, dan lokasi harus berupa teks yang valid.");

    const { data, error } = await auth.supabase
      .from("profiles")
      .upsert({ ...profile, user_id: auth.user.id }, { onConflict: "user_id" })
      .select("user_id, store_name, category, location")
      .single();
    if (error) return databaseError();
    return apiSuccess(data);
  } catch (error) {
    return inputErrorResponse(error);
  }
}
