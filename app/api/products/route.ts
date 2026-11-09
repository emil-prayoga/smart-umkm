import {
  apiSuccess,
  databaseError,
  inputErrorResponse,
  readJson,
  requireApiUser,
  validationError,
} from "@/lib/api/http";
import { getRange, validateProductCreate } from "@/lib/api/validation";

export async function GET(request: Request) {
  const auth = await requireApiUser();
  if ("response" in auth) return auth.response;

  const range = getRange(request);
  if (!range) return validationError("Parameter limit atau offset tidak valid.");

  try {
    const { data, error } = await auth.supabase
      .from("products")
      .select("*")
      .eq("user_id", auth.user.id)
      .order("created_at", { ascending: false })
      .range(range.offset, range.offset + range.limit - 1);

    if (error) return databaseError();
    return apiSuccess(data ?? [], 200, range);
  } catch {
    return databaseError();
  }
}

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if ("response" in auth) return auth.response;

  try {
    const body = await readJson(request);
    const product = validateProductCreate(body);
    if (!product) return validationError("Produk wajib berisi nama, kategori, harga, modal, dan stok yang valid.");

    const { data, error } = await auth.supabase
      .from("products")
      .insert({ ...product, user_id: auth.user.id })
      .select("*")
      .single();

    if (error) return databaseError();
    return apiSuccess(data, 201);
  } catch (error) {
    return inputErrorResponse(error);
  }
}
