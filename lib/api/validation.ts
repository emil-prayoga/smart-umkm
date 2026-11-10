import { z } from "zod";
import type { BusinessProfileInput, ProductRecord, TransactionRecord } from "@/lib/data/types";

// Reject control characters while keeping Indonesian text, punctuation, emoji,
// and ordinary business names usable. React still escapes rendered text.
const SAFE_TEXT = /^[^\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]*$/u;
const RECORD_ID = /^[a-zA-Z0-9_-]{1,128}$/;
const CAPITAL_AMOUNT = /^(?:Rp\s*)?(?:\d{1,3}(?:[.,]\d{3})+|\d+)\s*$/iu;

const text = (max: number) => z.string().trim().min(1).max(max).regex(SAFE_TEXT);
const optionalText = (max: number) => z.string().trim().max(max).regex(SAFE_TEXT);
const amount = z.number().finite().min(0).max(Number.MAX_SAFE_INTEGER);
const positiveAmount = z.number().finite().gt(0).max(Number.MAX_SAFE_INTEGER);
const stock = z.number().int().min(0).max(Number.MAX_SAFE_INTEGER);

const BusinessProfileSchema = z.object({
  store_name: text(120),
  category: text(80),
  location: optionalText(120),
}).strict();

const ProductSchema = z.object({
  name: text(120),
  category: text(80),
  price: amount,
  cost_price: amount,
  stock,
}).strict();

const ProductPatchSchema = ProductSchema.partial().strict()
  .refine((value) => Object.keys(value).length > 0);

const TransactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: positiveAmount,
  category: text(80),
  description: optionalText(500),
}).strict();

const TransactionPatchSchema = TransactionSchema.partial().strict()
  .refine((value) => Object.keys(value).length > 0);

const RecordIdSchema = z.string().regex(RECORD_ID);

const QueryIntegerSchema = z.string().regex(/^\d{1,16}$/).transform(Number);
const RangeSchema = z.object({
  limit: QueryIntegerSchema.pipe(z.number().int().min(1).max(1000)),
  offset: QueryIntegerSchema.pipe(z.number().int().min(0).max(Number.MAX_SAFE_INTEGER)),
}).strict();

const BusinessIdeaRequestSchema = z.object({
  capital: z.string().trim().min(1).max(40).regex(CAPITAL_AMOUNT)
    .transform((value) => Number(value.replace(/\D/g, "")))
    .pipe(z.number().int().min(1).max(1_000_000_000_000)),
  interest: text(100),
  location: optionalText(120),
}).strict();

const responseText = (max = 1200) => z.string().trim().min(1).max(max).regex(SAFE_TEXT);

const AIInsightsSchema = z.object({
  bundling: z.object({
    title: responseText(160),
    description: responseText(),
    suggestedPrice: responseText(100),
  }),
  promo: z.object({
    title: responseText(160),
    strategy: responseText(),
    targetDays: responseText(160),
  }),
  pricing: z.object({
    title: responseText(160),
    advice: responseText(),
  }),
});

const AIPromotionsSchema = z.object({
  title: responseText(160),
  strategy: responseText(),
  targetDays: responseText(160),
  products: z.array(responseText(120)).max(10),
});

const BusinessIdeaSchema = z.object({
  title: responseText(160),
  description: responseText(),
  estimatedCapital: responseText(100),
  potentialProfit: responseText(160),
  competitorAnalysis: responseText(),
});

const BusinessIdeasSchema = z.union([
  z.object({ ideas: z.array(BusinessIdeaSchema).length(3) }),
  z.array(BusinessIdeaSchema).length(3),
]).transform((value) => Array.isArray(value) ? value : value.ideas);

type ProductInput = Omit<ProductRecord, "id" | "created_at" | "user_id">;
type TransactionInput = Omit<TransactionRecord, "id" | "created_at" | "user_id">;

export function asBusinessProfile(value: unknown): BusinessProfileInput | null {
  const parsed = BusinessProfileSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export function validateProductCreate(value: unknown): ProductInput | null {
  const parsed = ProductSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export function validateProductPatch(value: unknown): Partial<ProductInput> | null {
  const parsed = ProductPatchSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export function validateTransactionCreate(value: unknown): TransactionInput | null {
  const parsed = TransactionSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export function validateTransactionPatch(value: unknown): Partial<TransactionInput> | null {
  const parsed = TransactionPatchSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export function isRecordId(value: string): boolean {
  return RecordIdSchema.safeParse(value).success;
}

export function getRange(request: Request) {
  const url = new URL(request.url);
  const parsed = RangeSchema.safeParse({
    limit: url.searchParams.get("limit") ?? "1000",
    offset: url.searchParams.get("offset") ?? "0",
  });
  return parsed.success ? parsed.data : null;
}

export interface BusinessIdeaInput {
  capital: string;
  interest: string;
  location: string;
}

export function validateBusinessIdeaInput(value: unknown): BusinessIdeaInput | null {
  const parsed = BusinessIdeaRequestSchema.safeParse(value);
  if (!parsed.success) return null;

  return {
    capital: `Rp ${new Intl.NumberFormat("id-ID").format(parsed.data.capital)}`,
    interest: parsed.data.interest,
    location: parsed.data.location || "Indonesia",
  };
}

export function validateAIInsightsResponse(value: unknown) {
  const parsed = AIInsightsSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export function validateAIPromotionsResponse(value: unknown) {
  const parsed = AIPromotionsSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export function validateBusinessIdeasResponse(value: unknown) {
  const parsed = BusinessIdeasSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}
