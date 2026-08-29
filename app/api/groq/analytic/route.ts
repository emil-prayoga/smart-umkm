import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(req: Request) {
  try {
    const rawApiKey = process.env.GROQ_API_KEY;
    const apiKey = rawApiKey ? rawApiKey.trim() : "";

    if (!apiKey) {
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

    const groq = new Groq({ apiKey });

    const prompt = `
Kamu adalah Konsultan Business Intelligence & Data Analyst Senior untuk UMKM Indonesia.
Berikut data inventaris dan produk toko saat ini:
${JSON.stringify(summaryData, null, 2)}

Berdasarkan data di atas dan karakteristik kategori bisnis produk tersebut, berikan **"Analisis & Prediksi AI Masa Depan"** yang mencakup 3 poin utama berikut:

1. **Analisis Produk Terlaris vs Kurang Diminati**:
   - Prediksikan produk mana yang berpotensi menjadi 'Top Seller' (berdasarkan margin laba & perputaran stok) vs produk yang kemungkinan 'Slow-moving' (kurang diminati).
2. **Prediksi Waktu Penjualan Terbaik (Peak Hours & Peak Days)**:
   - Berikan rekomendasi/analisis jam dan hari terramai yang ideal untuk menggenjot penjualan produk-produk kategori tersebut (misal: jam makan siang, akhir pekan, dll).
3. **Prediksi Tren Pasar Musiman (Big Data Trend)**:
   - Berikan proyeksi tren pasar dalam 1-3 bulan ke depan terkait kategori produk yang dijual (misal: pengaruh musim hujan/kemarau, momen gajian, hari libur nasional, atau tren sosial media).

Gunakan bahasa Indonesia yang profesional, menyemangati, ramah, dan format Markdown (bullet points / bold) yang sangat rapi.
    `;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "openai/gpt-oss-120b",
    });

    const result = completion.choices[0]?.message?.content || "Tidak ada analisis yang dihasilkan.";

    return NextResponse.json({ result });
  } catch (error: unknown) {
    console.error("Error in /api/groq/analytic:", error);

    // Penanganan error tanpa 'any'
    if (error instanceof Groq.APIError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status || 500 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}
