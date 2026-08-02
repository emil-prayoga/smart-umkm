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