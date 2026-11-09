import "server-only";

import { ApiInputError, apiError, apiSuccess, databaseError, readJson, requireApiUser, validationError } from "@/lib/api/http";
import {
  validateAIInsightsResponse,
  validateAIPromotionsResponse,
  validateBusinessIdeaInput,
  validateBusinessIdeasResponse,
} from "@/lib/api/validation";
import {
  AIConfigurationError,
  AIProviderError,
  generateBusinessIdeas,
  generateInsights,
  generatePredictions,
  generatePromotions,
} from "@/lib/ai/groq-service";

type ProductAIKind = "predictions" | "insights" | "promotions";
type AuthResult = Awaited<ReturnType<typeof requireApiUser>>;
type AuthenticatedSupabase = Extract<AuthResult, { supabase: unknown }>["supabase"];

async function getOwnedProducts(supabase: AuthenticatedSupabase, userId: string) {
  return supabase
    .from("products")
    .select("id, name, category, price, cost_price, stock")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(500);
}

function aiFailure(error: unknown) {
  if (error instanceof AIConfigurationError) {
    return apiError("AI_UNAVAILABLE", "Layanan AI belum dikonfigurasi di server.", 503);
  }
  if (error instanceof AIProviderError) {
    const status = error.status === 429 ? 429 : error.status === 504 ? 504 : 502;
    return apiError("AI_PROVIDER_ERROR", "Layanan AI sedang gagal memproses permintaan.", status);
  }
  return apiError("SERVER_ERROR", "Permintaan AI belum dapat diproses.", 500);
}

export async function handleProductAI(kind: ProductAIKind) {
  const auth = await requireApiUser();
  if ("response" in auth) return auth.response;

  try {
    const { data: products, error } = await getOwnedProducts(auth.supabase, auth.user.id);
    if (error) return databaseError();
    if (!products?.length) return validationError("Tambahkan produk terlebih dahulu untuk menjalankan analisis.");

    if (kind === "predictions") {
      const result = await generatePredictions(products);
      return apiSuccess({ result });
    }
    if (kind === "insights") {
      const result = validateAIInsightsResponse(await generateInsights(products));
      return result ? apiSuccess(result) : apiError("AI_INVALID_RESPONSE", "Jawaban AI belum sesuai format yang diharapkan.", 502);
    }
    const result = validateAIPromotionsResponse(await generatePromotions(products));
    return result ? apiSuccess(result) : apiError("AI_INVALID_RESPONSE", "Jawaban AI belum sesuai format yang diharapkan.", 502);
  } catch (error) {
    return aiFailure(error);
  }
}

export async function handleBusinessIdeas(request: Request) {
  const auth = await requireApiUser();
  if ("response" in auth) return auth.response;

  try {
    const input = validateBusinessIdeaInput(await readJson(request));
    if (!input) return validationError("Modal, minat, atau lokasi belum valid.");
    const ideas = validateBusinessIdeasResponse(await generateBusinessIdeas(input));
    return ideas
      ? apiSuccess(ideas)
      : apiError("AI_INVALID_RESPONSE", "Jawaban AI belum sesuai format yang diharapkan.", 502);
  } catch (error) {
    if (error instanceof ApiInputError) return apiError(error.code, error.message, error.status);
    return aiFailure(error);
  }
}
