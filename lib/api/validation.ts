import type { BusinessProfileInput, ProductRecord, TransactionRecord } from "@/lib/data/types";

type ProductInput = Omit<ProductRecord, "id" | "created_at" | "user_id">;
type TransactionInput = Omit<TransactionRecord, "id" | "created_at" | "user_id">;

function asObject(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function hasOnlyKeys(input: Record<string, unknown>, allowed: string[]) {
  return Object.keys(input).every((key) => allowed.includes(key));
}

function validText(value: unknown, maxLength: number, allowEmpty = false): value is string {
  return typeof value === "string" && value.trim().length <= maxLength && (allowEmpty || value.trim().length > 0);
}

function validAmount(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

export function asBusinessProfile(value: unknown): BusinessProfileInput | null {
  const input = asObject(value);
  if (!input || !hasOnlyKeys(input, ["store_name", "category", "location"])) return null;
  if (!validText(input.store_name, 120) || !validText(input.category, 80) || !validText(input.location, 120, true)) return null;
  return {
    store_name: input.store_name.trim(),
    category: input.category.trim(),
    location: input.location.trim(),
  };
}

function validStock(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

export function validateProductCreate(value: unknown): ProductInput | null {
  const input = asObject(value);
  const allowed = ["name", "category", "price", "cost_price", "stock"];
  if (!input || !hasOnlyKeys(input, allowed)) return null;
  if (!validText(input.name, 120) || !validText(input.category, 80)) return null;
  if (!validAmount(input.price) || !validAmount(input.cost_price) || !validStock(input.stock)) return null;

  return {
    name: input.name.trim(),
    category: input.category.trim(),
    price: input.price,
    cost_price: input.cost_price,
    stock: input.stock,
  };
}

export function validateProductPatch(value: unknown): Partial<ProductInput> | null {
  const input = asObject(value);
  const allowed = ["name", "category", "price", "cost_price", "stock"];
  if (!input || Object.keys(input).length === 0 || !hasOnlyKeys(input, allowed)) return null;
  const result: Partial<ProductInput> = {};

  if ("name" in input) {
    if (!validText(input.name, 120)) return null;
    result.name = input.name.trim();
  }
  if ("category" in input) {
    if (!validText(input.category, 80)) return null;
    result.category = input.category.trim();
  }
  if ("price" in input) {
    if (!validAmount(input.price)) return null;
    result.price = input.price;
  }
  if ("cost_price" in input) {
    if (!validAmount(input.cost_price)) return null;
    result.cost_price = input.cost_price;
  }
  if ("stock" in input) {
    if (!validStock(input.stock)) return null;
    result.stock = input.stock;
  }
  return result;
}

export function validateTransactionCreate(value: unknown): TransactionInput | null {
  const input = asObject(value);
  const allowed = ["type", "amount", "category", "description"];
  if (!input || !hasOnlyKeys(input, allowed)) return null;
  if (input.type !== "income" && input.type !== "expense") return null;
  if (typeof input.amount !== "number" || !Number.isFinite(input.amount) || input.amount <= 0) return null;
  if (!validText(input.category, 80)) return null;
  if (!validText(input.description, 500, true)) return null;

  return {
    type: input.type,
    amount: input.amount,
    category: input.category.trim(),
    description: input.description.trim(),
  };
}

export function validateTransactionPatch(value: unknown): Partial<TransactionInput> | null {
  const input = asObject(value);
  const allowed = ["type", "amount", "category", "description"];
  if (!input || Object.keys(input).length === 0 || !hasOnlyKeys(input, allowed)) return null;
  const result: Partial<TransactionInput> = {};

  if ("type" in input) {
    if (input.type !== "income" && input.type !== "expense") return null;
    result.type = input.type;
  }
  if ("amount" in input) {
    if (typeof input.amount !== "number" || !Number.isFinite(input.amount) || input.amount <= 0) return null;
    result.amount = input.amount;
  }
  if ("category" in input) {
    if (!validText(input.category, 80)) return null;
    result.category = input.category.trim();
  }
  if ("description" in input) {
    if (!validText(input.description, 500, true)) return null;
    result.description = input.description.trim();
  }
  return result;
}

export function isRecordId(value: string): boolean {
  return value.length > 0 && value.length <= 128 && /^[a-zA-Z0-9_-]+$/.test(value);
}

export function getRange(request: Request) {
  const url = new URL(request.url);
  const rawLimit = url.searchParams.get("limit");
  const rawOffset = url.searchParams.get("offset");
  const limit = rawLimit === null ? 1000 : Number(rawLimit);
  const offset = rawOffset === null ? 0 : Number(rawOffset);

  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 1000) return null;
  if (!Number.isSafeInteger(offset) || offset < 0) return null;
  return { limit, offset };
}

export interface BusinessIdeaInput {
  capital: string;
  interest: string;
  location: string;
}

export function validateBusinessIdeaInput(value: unknown): BusinessIdeaInput | null {
  const input = asObject(value);
  if (!input || !hasOnlyKeys(input, ["capital", "interest", "location"])) return null;
  if (!validText(input.capital, 40) || !validText(input.interest, 100) || !validText(input.location, 120, true)) return null;

  const digits = input.capital.replace(/[^0-9]/g, "");
  const capital = Number(digits);
  if (!digits || !Number.isSafeInteger(capital) || capital < 1 || capital > 1_000_000_000_000) return null;

  return {
    capital: `Rp ${new Intl.NumberFormat("id-ID").format(capital)}`,
    interest: input.interest.trim(),
    location: input.location.trim() || "Indonesia",
  };
}

function boundedResponseText(value: unknown, limit = 1200): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.trim().length <= limit;
}

export function validateAIInsightsResponse(value: unknown) {
  const input = asObject(value);
  if (!input) return null;
  const bundling = asObject(input.bundling);
  const promo = asObject(input.promo);
  const pricing = asObject(input.pricing);
  if (!bundling || !promo || !pricing) return null;
  if (!boundedResponseText(bundling.title, 160) || !boundedResponseText(bundling.description)
    || !boundedResponseText(bundling.suggestedPrice, 100) || !boundedResponseText(promo.title, 160)
    || !boundedResponseText(promo.strategy) || !boundedResponseText(promo.targetDays, 160)
    || !boundedResponseText(pricing.title, 160) || !boundedResponseText(pricing.advice)) return null;
  return { bundling, promo, pricing };
}

export function validateAIPromotionsResponse(value: unknown) {
  const input = asObject(value);
  if (!input || !boundedResponseText(input.title, 160) || !boundedResponseText(input.strategy)
    || !boundedResponseText(input.targetDays, 160) || !Array.isArray(input.products)
    || !input.products.every((product) => boundedResponseText(product, 120))) return null;
  return { title: input.title, strategy: input.strategy, targetDays: input.targetDays, products: input.products };
}

export function validateBusinessIdeasResponse(value: unknown) {
  const input = asObject(value);
  const ideas = input && Array.isArray(input.ideas) ? input.ideas : Array.isArray(value) ? value : null;
  if (!ideas || ideas.length !== 3) return null;
  const normalized = ideas.map((idea) => {
    const item = asObject(idea);
    if (!item || !boundedResponseText(item.title, 160) || !boundedResponseText(item.description)
      || !boundedResponseText(item.estimatedCapital, 100) || !boundedResponseText(item.potentialProfit, 160)
      || !boundedResponseText(item.competitorAnalysis)) return null;
    return {
      title: item.title,
      description: item.description,
      estimatedCapital: item.estimatedCapital,
      potentialProfit: item.potentialProfit,
      competitorAnalysis: item.competitorAnalysis,
    };
  });
  return normalized.every(Boolean) ? normalized : null;
}
