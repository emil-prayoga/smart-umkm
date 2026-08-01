"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  PlusCircle,
  Trash2,
  Calendar,
  Tag,
  Loader2,
  Plus,
} from "lucide-react";
import { supabase } from "@/src/lib/supabaseClient";

export interface TransactionRecord {
  id: string;
  created_at: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
}

interface FinanceClientProps {
  initialRecords: TransactionRecord[];
}

export default function FinanceClient({ initialRecords }: FinanceClientProps) {
  const router = useRouter();
  const [records, setRecords] = useState<TransactionRecord[]>(initialRecords);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State Modal Pop-up
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [type, setType] = useState<"income" | "expense">("income");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Penjualan");
  const [description, setDescription] = useState("");

  // Refresh data dari server menggunakan router.refresh()
  const refreshData = async () => {
    router.refresh();
    // Opsional: memperbarui local state jika diinginkan
    const { data } = await supabase
      .from("cash_flows")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setRecords(data);
  };

  // Submit Transaksi Baru
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0)
      return alert("Masukkan nominal uang yang valid!");

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
      setIsModalOpen(false);
      refreshData();
    }
  };

  // Hapus Transaksi
  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus catatan transaksi ini?")) return;
    const { error } = await supabase.from("cash_flows").delete().eq("id", id);
    if (!error) {
      refreshData();
    } else {
      alert("Gagal menghapus transaksi: " + error.message);
    }
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
    <main className="bg-neutral-950 text-neutral-100 p-6 min-h-screen md:p-8">
      <div className="min-h-screen mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-emerald-400">
              Pencatatan Keuangan & Arus Kas
            </h1>
            <p className="text-neutral-400 text-sm mt-1">
              Catat seluruh pemasukan penjualan dan pengeluaran operasional UMKM.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="w-fit text-center flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-neutral-950 font-semibold px-5 py-2.5 rounded-xl text-sm hover:opacity-90 transition-all shadow-lg shadow-emerald-950/40 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Catat Transaksi
          </button>
        </div>

        {/* RINGKASAN SALDO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs text-neutral-400 font-medium uppercase tracking-wider">
                Total Pemasukan
              </p>
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
              <p className="text-xs text-neutral-400 font-medium uppercase tracking-wider">
                Total Pengeluaran
              </p>
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
              <p className="text-xs text-neutral-400 font-medium uppercase tracking-wider">
                Sisa Arus Kas (Neto)
              </p>
              <h3
                className={`text-2xl font-bold mt-1 ${
                  netBalance >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                Rp {netBalance.toLocaleString("id-ID")}
              </h3>
            </div>
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
              <Wallet className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* TABEL HISTORI */}
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-4">
          <h2 className="text-lg font-semibold text-neutral-100 flex items-center gap-2">
            <Tag className="w-5 h-5 text-emerald-400" /> Riwayat Transaksi Kas
          </h2>

          {records.length === 0 ? (
            <p className="text-xs text-neutral-500 text-center py-12">
              Belum ada riwayat transaksi yang dicatat. Klik tombol Catat Transaksi di atas untuk memulai.
            </p>
          ) : (
            <div className="space-y-3 max-h-125 overflow-y-auto pr-1">
              {records.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-neutral-950 p-4 rounded-xl border border-neutral-800/60 text-sm hover:border-neutral-700 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
                          item.type === "income"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}
                      >
                        {item.category}
                      </span>
                      <span className="text-xs text-neutral-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="font-medium text-neutral-200">
                      {item.description || item.category}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span
                      className={`font-bold text-base ${
                        item.type === "income" ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {item.type === "income" ? "+" : "-"} Rp{" "}
                      {item.amount.toLocaleString("id-ID")}
                    </span>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-neutral-500 hover:text-rose-400 transition-colors p-1 cursor-pointer"
                      title="Hapus Catatan"
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

      {/* MODAL TRANSAKSI BARU */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-neutral-900 border border-neutral-800 w-full max-w-md rounded-2xl p-6 space-y-5 shadow-2xl relative">
            <h2 className="text-lg font-semibold text-neutral-100 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-emerald-400" /> Catat Transaksi Baru
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-950 rounded-xl border border-neutral-800">
                <button
                  type="button"
                  onClick={() => {
                    setType("income");
                    setCategory("Penjualan");
                  }}
                  className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    type === "income"
                      ? "bg-emerald-500 text-neutral-950"
                      : "text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  + Pemasukan
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setType("expense");
                    setCategory("Bahan Baku");
                  }}
                  className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    type === "expense"
                      ? "bg-rose-500 text-neutral-100"
                      : "text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  - Pengeluaran
                </button>
              </div>

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

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 py-2.5 bg-neutral-800 text-neutral-300 font-semibold rounded-xl text-sm hover:bg-neutral-700 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-1/2 py-2.5 font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    type === "income"
                      ? "bg-emerald-500 hover:bg-emerald-400 text-neutral-950"
                      : "bg-rose-500 hover:bg-rose-400 text-neutral-100"
                  }`}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Simpan"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}