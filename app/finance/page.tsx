"use client";

import { useState, useEffect } from "react";
import { ArrowUpRight, ArrowDownRight, Wallet, PlusCircle, Trash2, Calendar, Tag, Loader2 } from "lucide-react";
import { supabase } from "@/src/lib/supabaseClient";

export interface TransactionRecord {
  id: string;
  created_at: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
}

export default function FinancePage() {
  const [records, setRecords] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [type, setType] = useState<"income" | "expense">("income");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Penjualan");
  const [description, setDescription] = useState("");

  // Fetch Data Arus Kas
  const fetchRecords = async () => {
    const { data, error } = await supabase
      .from("cash_flows")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setRecords(data || []);
    setLoading(false);
  };

  useEffect(() => {
    const loadRecords = async () => {
      await fetchRecords();
    };

    loadRecords();
  }, []);

  // Submit Transaksi Baru
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return alert("Masukkan nominal uang yang valid!");

    setIsSubmitting(true);
    const { error } = await supabase.from("cash_flows").insert([
      {
        type,
        amount: Number(amount),
        category,
        description,
      },
    ]);

    setIsSubmitting(false);

    if (error) {
      alert("Gagal menyimpan transaksi: " + error.message);
    } else {
      setAmount("");
      setDescription("");
      fetchRecords();
    }
  };

  // Hapus Transaksi
  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus catatan transaksi ini?")) return;
    const { error } = await supabase.from("cash_flows").delete().eq("id", id);
    if (!error) fetchRecords();
  };

  // Kalkulasi Ringkasan
  const totalIncome = records
    .filter((r) => r.type === "income")
    .reduce((sum, r) => sum + r.amount, 0);

  const totalExpense = records
    .filter((r) => r.type === "expense")
    .reduce((sum, r) => sum + r.amount, 0);

  const netBalance = totalIncome - totalExpense;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-100">Pencatatan Keuangan & Arus Kas</h1>
        <p className="text-neutral-400 text-sm mt-1">
          Catat seluruh pemasukan penjualan dan pengeluaran operasional UMKM kamu.
        </p>
      </div>

      {/* RINGKASAN SALDO (CARDS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-neutral-400 font-medium">Total Pemasukan</p>
            <h3 className="text-2xl font-bold text-emerald-400 mt-1">
              Rp {totalIncome.toLocaleString("id-ID")}
            </h3>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-neutral-400 font-medium">Total Pengeluaran</p>
            <h3 className="text-2xl font-bold text-rose-400 mt-1">
              Rp {totalExpense.toLocaleString("id-ID")}
            </h3>
          </div>
          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl">
            <ArrowDownRight className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-neutral-400 font-medium">Sisa Arus Kas (Neto)</p>
            <h3 className={`text-2xl font-bold mt-1 ${netBalance >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              Rp {netBalance.toLocaleString("id-ID")}
            </h3>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
            <Wallet className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* UTAMA: FORM INPUT & RIWAYAT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* FORM INPUT (KIRI - 5 COL) */}
        <form onSubmit={handleSubmit} className="lg:col-span-5 bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-4">
          <h2 className="text-lg font-semibold text-neutral-100 flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-emerald-400" /> Catat Transaksi Baru
          </h2>

          {/* TOGGLE PEMASUKAN / PENGELUARAN */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-950 rounded-xl border border-neutral-800">
            <button
              type="button"
              onClick={() => { setType("income"); setCategory("Penjualan"); }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                type === "income" ? "bg-emerald-500 text-neutral-950" : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              + Pemasukan
            </button>
            <button
              type="button"
              onClick={() => { setType("expense"); setCategory("Bahan Baku"); }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                type === "expense" ? "bg-rose-500 text-neutral-100" : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              - Pengeluaran
            </button>
          </div>

          {/* INPUT NOMINAL */}
          <div>
            <label className="text-xs text-neutral-400">Nominal (Rp)</label>
            <input
              type="number"
              placeholder="Contoh: 50000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full mt-1 px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          {/* PILIH KATEGORI */}
          <div>
            <label className="text-xs text-neutral-400">Kategori</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full mt-1 px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 focus:outline-none focus:border-emerald-500"
            >
              {type === "income" ? (
                <>
                  <option value="Penjualan">Penjualan Harian</option>
                  <option value="Investasi/Modal">Suntikan Modal</option>
                  <option value="Lainnya">Pemasukan Lainnya</option>
                </>
              ) : (
                <>
                  <option value="Bahan Baku">Beli Bahan Baku</option>
                  <option value="Sewa & Sewa Alat">Sewa Tempat / Alat</option>
                  <option value="Gaji Karyawan">Gaji / Konsumsi</option>
                  <option value="Listrik & Air">Operasional (Listrik/Air/Gas)</option>
                  <option value="Pemasaran">Promosi / Iklan</option>
                  <option value="Lainnya">Pengeluaran Lainnya</option>
                </>
              )}
            </select>
          </div>

          {/* KETERANGAN */}
          <div>
            <label className="text-xs text-neutral-400">Keterangan / Catatan</label>
            <input
              type="text"
              placeholder="Misal: Beli Kopi 2kg & Gula 5kg"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full mt-1 px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
              type === "income" ? "bg-emerald-500 hover:bg-emerald-400 text-neutral-950" : "bg-rose-500 hover:bg-rose-400 text-neutral-100"
            }`}
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Simpan Catatan Keuangan"}
          </button>
        </form>

        {/* TABEL HISTORI (KANAN - 7 COL) */}
        <div className="lg:col-span-7 bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-4">
          <h2 className="text-lg font-semibold text-neutral-100">Riwayat Transaksi Kas</h2>

          {loading ? (
            <div className="p-8 text-center text-neutral-500 flex justify-center items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> Memuat data transaksi...
            </div>
          ) : records.length === 0 ? (
            <p className="text-xs text-neutral-500 text-center py-8">
              Belum ada riwayat transaksi yang dicatat.
            </p>
          ) : (
            <div className="space-y-3 max-h-105 overflow-y-auto pr-1">
              {records.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-neutral-950 p-3.5 rounded-xl border border-neutral-800/60 text-sm"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
                        item.type === "income" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}>
                        {item.category}
                      </span>
                      <span className="text-xs text-neutral-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <p className="font-medium text-neutral-200">
                      {item.description || item.category}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`font-bold ${item.type === "income" ? "text-emerald-400" : "text-rose-400"}`}>
                      {item.type === "income" ? "+" : "-"} Rp {item.amount.toLocaleString("id-ID")}
                    </span>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-neutral-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}