"use client";

import { useState, useEffect } from "react";
import { Store, MapPin, Tag, Key, Save, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  const [storeName, setStoreName] = useState("");
  const [category, setCategory] = useState("Makanan & Minuman");
  const [location, setLocation] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Ambil data yang tersimpan di localStorage jika ada
    const savedName = localStorage.getItem("smartumkm_store_name");
    const savedCategory = localStorage.getItem("smartumkm_store_category");
    const savedLocation = localStorage.getItem("smartumkm_store_location");

    if (savedName) setStoreName(savedName);
    if (savedCategory) setCategory(savedCategory);
    if (savedLocation) setLocation(savedLocation);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("smartumkm_store_name", storeName);
    localStorage.setItem("smartumkm_store_category", category);
    localStorage.setItem("smartumkm_store_location", location);

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <main className="bg-neutral-950 text-neutral-100 p-6 min-h-screen md:p-8">
      <div className="min-h-screen mx-auto space-y-8">
        <div className="border-b border-neutral-800 pb-6">
          <h1 className="text-3xl font-bold tracking-tight text-emerald-400 flex items-center gap-2.5">
            Pengaturan Profil Usaha
          </h1>
          <p className="text-neutral-400 text-sm mt-1">
            Kelola informasi dasar UMKM kamu untuk personalisasi analisis AI.
          </p>
        </div>

        {saved && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl flex items-center gap-3 text-sm">
            <CheckCircle2 className="w-5 h-5" />
            Pengaturan profil usaha berhasil disimpan!
          </div>
        )}

        <form onSubmit={handleSave} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-neutral-300 flex items-center gap-2">
              <Store className="w-4 h-4 text-emerald-400" /> Nama Toko / Usaha
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Kopi Kenangan Mantan"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-sm text-neutral-100 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-neutral-300 flex items-center gap-2">
              <Tag className="w-4 h-4 text-emerald-400" /> Kategori Usaha
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-sm text-neutral-100 focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="Makanan & Minuman">Makanan & Minuman (F&B)</option>
              <option value="Pakaian & Fashion">Pakaian & Fashion</option>
              <option value="Toko Kelontong / Retail">Toko Kelontong / Retail</option>
              <option value="Jasa & Service">Jasa & Service</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-neutral-300 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" /> Lokasi Kota / Wilayah
            </label>
            <input
              type="text"
              placeholder="Contoh: Bandung Jawa Barat"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-sm text-neutral-100 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="pt-4 border-t border-neutral-800">
            <button
              type="submit"
              className="w-full md:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-neutral-950 font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-all text-sm cursor-pointer"
            >
              <Save className="w-4 h-4" /> Simpan Pengaturan
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}