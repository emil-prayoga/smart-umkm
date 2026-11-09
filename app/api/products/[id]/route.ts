import { apiSuccess, databaseError, inputErrorResponse, notFoundError, readJson, requireApiUser, validationError } from "@/lib/api/http";
import { isRecordId, validateProductPatch } from "@/lib/api/validation";

type RouteContext = { params: Promise<{ id: string }> };

async function getId(context: RouteContext) {
  const { id } = await context.params;
  return isRecordId(id) ? id : null;
}

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireApiUser();
  if ("response" in auth) return auth.response;
  const id = await getId(context);
  if (!id) return validationError("ID produk tidak valid.");

  try {
    const { data, error } = await auth.supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .eq("user_id", auth.user.id)
      .maybeSingle();
    if (error) return databaseError();
    if (!data) return notFoundError("Produk");
    return apiSuccess(data);
  } catch {
    return databaseError();
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireApiUser();
  if ("response" in auth) return auth.response;
  const id = await getId(context);
  if (!id) return validationError("ID produk tidak valid.");

  try {
    const body = await readJson(request);
    const product = validateProductPatch(body);
    if (!product) return validationError("Kirim setidaknya satu field produk dengan nilai yang valid.");

    const { data, error } = await auth.supabase
      .from("products")
      .update(product)
      .eq("id", id)
      .eq("user_id", auth.user.id)
      .select("*")
      .maybeSingle();
    if (error) return databaseError();
    if (!data) return notFoundError("Produk");
    return apiSuccess(data);
  } catch (error) {
    return inputErrorResponse(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireApiUser();
  if ("response" in auth) return auth.response;
  const id = await getId(context);
  if (!id) return validationError("ID produk tidak valid.");

  try {
    const { data, error } = await auth.supabase
      .from("products")
      .delete()
      .eq("id", id)
      .eq("user_id", auth.user.id)
      .select("id")
      .maybeSingle();
    if (error) return databaseError();
    if (!data) return notFoundError("Produk");
    return apiSuccess({ id: data.id });
  } catch {
    return databaseError();
  }
}
