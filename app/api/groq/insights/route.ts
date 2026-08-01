import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY, // Tanpa NEXT_PUBLIC_
});

export async function POST(req: Request) {
  try {
    const { productList } = await req.json();

    const summaryData = productList.map((p: { name: string; category: string; price: number; cost_price: number; stock: number }) => ({
      nama: p.name,
      kategori: p.category,
      harga_jual: p.price,
      modal_hpp: p.cost_price,
      stok: p.stock,
    }));

    const prompt = `
Kamu adalah Konsultan Bisnis UMKM. Berdasarkan data produk berikut:
${JSON.stringify(summaryData, null, 2)}

Berikan rekomendasi strategi bisnis nyata dalam format JSON murni.
Format JSON HARUS berupa objek tunggal seperti ini:
{
  "bundling": {
    "title": "Nama Paket Bundling",
    "description": "Alasan singkat bundling",
    "suggestedPrice": "Rp xx.xxx"
  },
  "promo": {
    "title": "Nama Strategi Promo",
    "strategy": "Penjelasan eksekusi promo",
    "targetDays": "Hari/Jam target"
  },
  "pricing": {
    "title": "Evaluasi Margin / Harga Optimal",
    "advice": "Saran penyesuaian harga"
  }
}
    `;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }, // Memaksa Groq mengembalikan JSON murni
    });

    const replyText = completion.choices[0]?.message?.content || "{}";
    const parsedData = JSON.parse(replyText);

    return NextResponse.json(parsedData);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error in Groq API Route:", message);
    return NextResponse.json(
      { error: message || "Internal Server Error" },
      { status: 500 }
    );
  }
}