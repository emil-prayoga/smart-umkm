import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const { capital, interest, location } = await req.json();

    const prompt = `
Kamu adalah Konsultan Bisnis & Startup UMKM berpengalaman.
Pengguna ingin memulai usaha baru dari nol dengan detail:
- Modal Awal: ${capital || "Rp 5.000.000"}
- Minat/Kategori: ${interest}
- Lokasi: ${location || "Kota Indonesia"}

Berikan 3 rekomendasi ide bisnis terbaik yang realistis dalam format JSON murni TANPA MARKDOWN BACKTICKS.
Format JSON HARUS array of object:
[
  {
    "title": "...",
    "description": "...",
    "estimatedCapital": "...",
    "potentialProfit": "...",
    "competitorAnalysis": "..."
  }
]
    `;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
    });

    const replyText = completion.choices[0]?.message?.content || "";
    const cleanJson = replyText.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsedData = JSON.parse(cleanJson);

    return NextResponse.json(parsedData);
  } catch (error) {
    console.error("Groq API Error:", error);
    return NextResponse.json({ error: "Gagal merancang ide bisnis" }, { status: 500 });
  }
}