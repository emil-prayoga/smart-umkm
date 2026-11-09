import "server-only";

import Groq from "groq-sdk";

export class AIConfigurationError extends Error {}
export class AIProviderError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
  }
}

type ProductForAI = Pick<
  import("@/lib/data/types").ProductRecord,
  "name" | "category" | "price" | "cost_price" | "stock"
>;

function createClient() {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) throw new AIConfigurationError("GROQ_API_KEY belum tersedia pada server.");

  return new Groq({ apiKey, timeout: 30_000, maxRetries: 1 });
}

function selectedModel() {
  return process.env.GROQ_MODEL?.trim() || "openai/gpt-oss-120b";
}

async function complete(prompt: string, json = false): Promise<string> {
  try {
    const response = await createClient().chat.completions.create({
      model: selectedModel(),
      messages: [
        {
          role: "system",
          content: "Anda adalah konsultan bisnis UMKM Indonesia. Gunakan hanya data yang diberikan. Jangan mengarang data pasar, angka penjualan, atau fakta. Tandai rekomendasi sebagai saran yang perlu diuji.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_completion_tokens: 1400,
      ...(json ? { response_format: { type: "json_object" as const } } : {}),
    });

    const content = response.choices[0]?.message?.content;
    if (typeof content !== "string" || content.trim().length === 0) {
      throw new AIProviderError("Provider mengembalikan jawaban kosong.", 502);
    }
    return content.trim();
  } catch (error) {
    if (error instanceof AIConfigurationError || error instanceof AIProviderError) throw error;
    if (error instanceof Groq.APIError) {
      throw new AIProviderError("Provider AI menolak atau gagal memproses permintaan.", error.status);
    }
    throw new AIProviderError("Provider AI tidak merespons dalam batas waktu.", 504);
  }
}

function productPayload(products: ProductForAI[]) {
  return products.map((product) => ({
    nama: product.name,
    kategori: product.category,
    harga_jual: product.price,
    modal_hpp: product.cost_price,
    stok: product.stock,
  }));
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new AIProviderError("Provider mengembalikan JSON yang tidak valid.", 502);
  }
}

export async function generatePredictions(products: ProductForAI[]) {
  return complete(
    `Analisis katalog berikut. Beri prediksi produk yang berpotensi laris atau lambat, hipotesis waktu penjualan yang layak diuji, serta faktor yang perlu dipantau. Jangan menyebut tren atau musim sebagai fakta tanpa data pendukung. Data produk: ${JSON.stringify(productPayload(products))}`,
  );
}

export async function generateInsights(products: ProductForAI[]) {
  const text = await complete(
    `Berdasarkan katalog produk ini, buat rekomendasi dalam JSON dengan bentuk {"bundling":{"title":"","description":"","suggestedPrice":""},"promo":{"title":"","strategy":"","targetDays":""},"pricing":{"title":"","advice":""}}. Harga saran harus mempertimbangkan harga/modal yang diberikan dan ditandai sebagai saran uji. Data: ${JSON.stringify(productPayload(products))}`,
    true,
  );
  return parseJson(text);
}

export async function generatePromotions(products: ProductForAI[]) {
  const text = await complete(
    `Buat satu strategi promosi yang dapat diuji berdasarkan katalog ini. Kembalikan JSON dengan bentuk {"title":"","strategy":"","targetDays":"","products":[]}. Jangan menyatakan waktu atau hasil sebagai kepastian. Data: ${JSON.stringify(productPayload(products))}`,
    true,
  );
  return parseJson(text);
}

export async function generateBusinessIdeas(input: { capital: string; interest: string; location: string }) {
  const text = await complete(
    `Usulkan tiga ide usaha UMKM yang masuk akal untuk modal dan konteks yang diberikan. Kembalikan JSON {"ideas":[{"title":"","description":"","estimatedCapital":"","potentialProfit":"","competitorAnalysis":""}]}. Jangan menjanjikan profit; jelaskan bahwa angka margin/modal hanya perkiraan awal untuk diuji. Modal: ${input.capital}. Minat: ${input.interest}. Lokasi target: ${input.location}.`,
    true,
  );
  return parseJson(text);
}
