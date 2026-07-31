"use client";

import { useState } from "react";
import { Lightbulb, Rocket, DollarSign, Target, Loader2, Sparkles, Compass } from "lucide-react";
import Groq from "groq-sdk";

export interface BusinessIdea {
  title: string;
  description: string;
  estimatedCapital: string;
  potentialProfit: string;
  competitorAnalysis: string;
}

export default function IdeUsahaPage() {
  const [capital, setCapital] = useState("");
  const [interest, setInterest] = useState("Kuliner / Makanan");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState<BusinessIdea[]>([]);

  const handleGenerateIdeas = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
      if (!apiKey) {
        alert("API Key Groq tidak ditemukan di .env.local!");
        setLoading(false);
        return;
      }

      const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });

      const prompt = `
Kamu adalah Konsultan Bisnis & Startup UMKM berpengalaman.
Pengguna ingin memulai usaha baru dari nol dengan detail:
- Modal Awal: ${capital || "Rp 5.000.000"}
- Minat/Kategori: ${interest}
- Lokasi: ${location || "Kota Indonesia"}

Berikan 3 rekomendasi ide bisnis terbaik yang realistis dalam format JSON murni TANPA MARKDOWN BACKTICKS.
Format JSON HARUS array of object seperti ini:
[
  {
    "title": "Nama Ide Bisnis KREATIF",
    "description": "Penjelasan singkat konsep bisnis dan kenapa menjanjikan",
    "estimatedCapital": "Rp x.xxx.xxx",
    "potentialProfit": "Rp x.xxx.xxx / bulan",
    "competitorAnalysis": "Kondisi persaingan lokal dan cara agar lebih unggul"
  }
]
      `;

      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.3-70b-versatile",
      });

      const replyText = completion.choices[0]?.message?.content || "";
      const cleanJson = replyText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsedIdeas: BusinessIdea[] = JSON.parse(cleanJson);

      setIdeas(parsedIdeas);
    } catch (err) {
      console.error("Error generating business ideas:", err);
      alert("Gagal merancang ide bisnis. Coba lagi!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-neutral-950 text-neutral-100 p-6 min-h-screen md:p-8">
      <div className="min-h-screen mx-auto space-y-8">
        <div className="border-b border-neutral-800 pb-6">
          <h1 className="text-3xl font-bold tracking-tight text-emerald-400">
            Rekomendasi Ide Usaha AI
          </h1>
          <p className="text-neutral-400 text-sm mt-1">
            Khusus pemula: Temukan peluang bisnis paling potensial sesuai modal dan minatmu.
          </p>
        </div>

        {/* FORM INPUT */}
        <form onSubmit={handleGenerateIdeas} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" /> Modal Awal (Rp)
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: 5.000.000"
              value={capital}
              onChange={(e) => setCapital(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-sm text-neutral-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-emerald-400" /> Minat / Bidang
            </label>
            <select
              value={interest}
              onChange={(e) => setInterest(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-sm text-neutral-100 focus:outline-none focus:border-emerald-500"
            >
              <option value="Kuliner / Makanan">Kuliner / Makanan</option>
              <option value="Minuman Kekinian">Minuman Kekinian</option>
              <option value="Fashion / Pakaian">Fashion / Pakaian</option>
              <option value="Jasa Digital / Kreatif">Jasa Digital / Kreatif</option>
              <option value="Agribisnis / Tanaman">Agribisnis / Tanaman</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-emerald-400" /> Lokasi Target
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Bandung Dekat Kampus"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-sm text-neutral-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="md:col-span-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-neutral-950 font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-all text-sm cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Menganalisis Peluang Bisnis...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" /> Cari Ide Usaha dengan AI
                </>
              )}
            </button>
          </div>
        </form>

        {/* HASIL IDE USAHA */}
        {ideas.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ideas.map((idea, index) => (
              <div key={index} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between hover:border-emerald-500/30 transition-all">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-bold">
                      Opsi {index + 1}
                    </span>
                    <span className="text-[11px] text-emerald-400 font-semibold">
                      Potensi: {idea.potentialProfit}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-neutral-100">{idea.title}</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">{idea.description}</p>
                </div>

                <div className="space-y-3 pt-4 border-t border-neutral-800 text-xs">
                  <div>
                    <span className="text-neutral-500 block">Estimasi Modal:</span>
                    <span className="font-bold text-neutral-200">{idea.estimatedCapital}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Analisis Kompetitor:</span>
                    <p className="text-neutral-300 italic">{idea.competitorAnalysis}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}