"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabaseClient";
import { Plus, Package, Edit2, Trash2, Loader2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  cost_price: number;
  stock: number;
}

export default function ProductPage() {
  const [products, setProduct] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [stock, setStock] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState("");

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.log("Gagal mendapatkan produk:", error);
      } else {
        setProduct(data || []);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loansProduct = async()=>{
      fetchProduct();
    }
    loansProduct();
  }, []);

  const resetForm = () => {
    setName("");
    setCategory("");
    setPrice("");
    setCostPrice("");
    setStock("");
    setEditingId("");
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingId(product.id);
    setName(product.name);
    setCategory(product.category);
    setPrice(String(product.price));
    setCostPrice(String(product.cost_price));
    setStock(String(product.stock));
    setIsOpen(true);
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const updatedData = {
      name,
      category,
      price: Number(price),
      cost_price: Number(costPrice),
      stock: Number(stock),
    };

    const { error } = await supabase
      .from("products")
      .update(updatedData)
      .eq("id", editingId);

    setLoading(false);

    if (error) {
      alert("Gagal memperbarui produk: " + error.message);
      return;
    }

    const array_baru = products.map((product) =>
      product.id === editingId ? { ...product, ...updatedData } : product
    );

    setProduct(array_baru);
    resetForm();
    setIsOpen(false);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !price || !costPrice || !stock) {
      return alert("Mohon isi field yang wajib!");
    }

    setLoading(true);

    const { error } = await supabase.from("products").insert([
      {
        name,
        category: category || "Umum",
        price: Number(price),
        cost_price: Number(costPrice),
        stock: Number(stock) || 0,
      },
    ]);

    if (error) {
      alert("Gagal menambah produk: " + error.message);
      setLoading(false);
    } else {
      resetForm();
      setIsOpen(false);
      fetchProduct();
    }
  };

  const handleDeleteProduct = async (idYangMauDihapus: string) => {
    const yakin = confirm("Yakin ingin menghapus produk ini?");
    if (yakin) {
      try {
        const { error } = await supabase
          .from("products")
          .delete()
          .eq("id", idYangMauDihapus);

        if (error) throw error;

        const hapusProduct = products.filter(
          (item) => item.id !== idYangMauDihapus
        );
        setProduct(hapusProduct);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Gagal menghapus produk";
        alert("Gagal menghapus data: " + msg);
      }
    }
  };

  // Helper untuk menentukan badge status stok (Kriteria No. 4)
  const renderStockBadge = (stockNum: number) => {
    if (stockNum === 0) {
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
          Habis
        </span>
      );
    } else if (stockNum <= 10) {
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          Menipis ({stockNum})
        </span>
      );
    } else {
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Aman ({stockNum})
        </span>
      );
    }
  };

  return (
    <main className="bg-neutral-950 text-neutral-100 p-4 sm:p-6 md:p-8 min-h-screen">
      <div className="min-h-screen mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-emerald-400">
              Manajemen Produk & Stok
            </h1>
            <p className="text-neutral-400 text-sm mt-1">
              Kelola inventaris, kategori, harga HPP vs jual, dan pantau stok barang usaha Anda.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="w-fit text-center flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-neutral-950 font-semibold px-5 py-2.5 rounded-xl text-sm hover:opacity-90 transition-all shadow-lg shadow-emerald-950/40"
          >
            <Plus className="w-4 h-4" /> Tambah Produk
          </button>
        </div>

        {/* MODAL FORM */}
        {isOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-4 shadow-2xl relative">
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-100"
              >
              </button>

              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />{" "}
                {editingId ? "Edit Produk" : "Tambah Produk Baru"}
              </h2>

              <form
                onSubmit={editingId ? handleUpdateProduct : handleAddProduct}
                className="space-y-3"
              >
                <div>
                  <label className="text-xs text-neutral-400">Nama Produk *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Kopi Susu Aren"
                    className="w-full mt-1 px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-neutral-100"
                  />
                </div>

                <div>
                  <label className="text-xs text-neutral-400">Kategori</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Minuman / Makanan"
                    className="w-full mt-1 px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-neutral-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-neutral-400">Harga Jual (Rp) *</label>
                    <input
                      type="number"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="15000"
                      className="w-full mt-1 px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-neutral-100"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-400">Modal / HPP (Rp) *</label>
                    <input
                      type="number"
                      required
                      value={costPrice}
                      onChange={(e) => setCostPrice(e.target.value)}
                      placeholder="8000"
                      className="w-full mt-1 px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-neutral-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-neutral-400">Stok Barang *</label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="50"
                    className="w-full mt-1 px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-neutral-100"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="w-1/2 py-2.5 bg-neutral-800 text-neutral-300 font-semibold rounded-xl text-sm hover:bg-neutral-700"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-1/2 py-2.5 bg-emerald-500 text-neutral-950 font-semibold rounded-xl text-sm hover:bg-emerald-400 disabled:opacity-50 transition-colors"
                  >
                    {editingId ? "Simpan Perubahan" : "Simpan Produk"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TABEL LIST PRODUK */}
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-400" /> Daftar Inventaris Produk
          </h2>

          {loading && products.length === 0 ? (
            <p className="text-sm text-neutral-500 py-4 items-center flex gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Memuat data inventaris...</p>
          ) : products.length === 0 ? (
            <p className="text-sm text-neutral-500 py-8 text-center">
              Belum ada produk. Klik tombol &quot;Tambah Produk&quot; untuk membuat data pertama Anda!
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-neutral-300">
                <thead className="border-b border-neutral-800 text-xs text-neutral-500 uppercase">
                  <tr>
                    <th className="py-3 px-2">Nama Produk</th>
                    <th className="py-3 px-2">Kategori</th>
                    <th className="py-3 px-2">Harga Jual</th>
                    <th className="py-3 px-2">HPP (Modal)</th>
                    <th className="py-3 px-2">Laba / Unit</th>
                    <th className="py-3 px-2">Status Stok</th>
                    <th className="py-3 px-2 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/50">
                  {products.map((item) => (
                    <tr key={item.id} className="hover:bg-neutral-800/30 transition-colors">
                      <td className="py-3 px-2 font-medium text-neutral-100">{item.name}</td>
                      <td className="py-3 px-2 text-neutral-400">{item.category}</td>
                      <td className="py-3 px-2 font-medium">
                        Rp {item.price.toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-2 text-neutral-400">
                        Rp {item.cost_price.toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-2 text-emerald-400 font-medium">
                        +Rp {(item.price - item.cost_price).toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-2">{renderStockBadge(item.stock)}</td>
                      <td className="py-3 px-2">
                        <div className="flex justify-center items-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-neutral-950 rounded-lg transition-all"
                            title="Edit Produk"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(item.id)}
                            className="p-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-lg transition-all"
                            title="Hapus Produk"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}