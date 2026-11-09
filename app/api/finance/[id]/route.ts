import { apiSuccess, databaseError, inputErrorResponse, notFoundError, readJson, requireApiUser, validationError } from "@/lib/api/http";
import { isRecordId, validateTransactionPatch } from "@/lib/api/validation";

type RouteContext = { params: Promise<{ id: string }> };

async function getId(context: RouteContext) {
  const { id } = await context.params;
  return isRecordId(id) ? id : null;
}

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireApiUser();
  if ("response" in auth) return auth.response;
  const id = await getId(context);
  if (!id) return validationError("ID transaksi tidak valid.");

  try {
    const { data, error } = await auth.supabase
      .from("cash_flows")
      .select("*")
      .eq("id", id)
      .eq("user_id", auth.user.id)
      .maybeSingle();
    if (error) return databaseError();
    if (!data) return notFoundError("Transaksi");
    return apiSuccess(data);
  } catch {
    return databaseError();
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireApiUser();
  if ("response" in auth) return auth.response;
  const id = await getId(context);
  if (!id) return validationError("ID transaksi tidak valid.");

  try {
    const body = await readJson(request);
    const transaction = validateTransactionPatch(body);
    if (!transaction) return validationError("Kirim setidaknya satu field transaksi dengan nilai yang valid.");

    const { data, error } = await auth.supabase
      .from("cash_flows")
      .update(transaction)
      .eq("id", id)
      .eq("user_id", auth.user.id)
      .select("*")
      .maybeSingle();
    if (error) return databaseError();
    if (!data) return notFoundError("Transaksi");
    return apiSuccess(data);
  } catch (error) {
    return inputErrorResponse(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireApiUser();
  if ("response" in auth) return auth.response;
  const id = await getId(context);
  if (!id) return validationError("ID transaksi tidak valid.");

  try {
    const { data, error } = await auth.supabase
      .from("cash_flows")
      .delete()
      .eq("id", id)
      .eq("user_id", auth.user.id)
      .select("id")
      .maybeSingle();
    if (error) return databaseError();
    if (!data) return notFoundError("Transaksi");
    return apiSuccess({ id: data.id });
  } catch {
    return databaseError();
  }
}
