import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(req: Request) {
  try {
    // 1. Validasi API Key
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "GROQ_API_KEY tidak ditemukan di environment server (.env.local)" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { summaryData } = body;

    if (!summaryData) {
      return NextResponse.json(
        { error: "Data summaryData tidak ditemukan pada payload request" },
        { status: 400 }
      );
    }

    // 2. Inisialisasi Groq SDK
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const prompt = `
Kamu adalah Analis Bisnis & Rantai Pasok UMKM Senior.
Analisis data inventaris toko berikut dan berikan rekomendasi aksi strategis secara singkat, jelas, dan actionable:

Data Ringkasan:
${JSON.stringify(summaryData, null, 2)}

Sajikan rekomendasi dalam poin-poin berikut:
1. **Analisis Stok & Restock**: Produk mana yang harus segera di-restock dan prioritasnya.
2. **Evaluasi Margin**: Rekomendasi terhadap produk margin tipis vs margin tinggi.
3. **Strategi Penjualan**: Ide promosi/bundling produk berdasarkan data di atas.
    `;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
    });

    const result = completion.choices[0]?.message?.content || "Tidak ada analisis yang dihasilkan.";

    return NextResponse.json({ result });
  } catch (error) {
    console.error("Error in /api/groq-analytic:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: message || "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}