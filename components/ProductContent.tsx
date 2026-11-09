"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Package, Edit2, Trash2, Loader2 } from "lucide-react";
import Pagination from "@/components/Pagination";
import { addProduct, deleteProduct, getProducts, updateProduct } from "@/lib/data/workspace-data";
import type { ProductRecord } from "@/lib/data/types";
import DirectionalReveal from "@/components/motion/DirectionalReveal";

const PAGE_SIZE = 5;

export default function ProductContent({ isDemo = false }: { isDemo?: boolean }) {
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [stock, setStock] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState("");

  const fetchProducts = useCallback(async () => {
    try {
      setProducts(await getProducts(isDemo ? "demo" : "user"));
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  }, [isDemo]);

  useEffect(() => {
    // This effect synchronizes the inventory with the selected data source.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchProducts();
  }, [fetchProducts]);

  const paginatedProducts = products.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const resetForm = () => {
    setName("");
    setCategory("");
    setPrice("");
    setCostPrice("");
    setStock("");
    setEditingId("");
  };

  const handleOpenAdd = () => {
    if (isDemo) return;
    resetForm();
    setIsOpen(true);
  };

  const handleOpenEdit = (product: ProductRecord) => {
    if (isDemo) return;
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
    if (isDemo) return;
    setLoading(true);

    const updatedData = {
      name,
      category,
      price: Number(price),
      cost_price: Number(costPrice),
      stock: Number(stock),
    };

    try {
      await updateProduct("user", editingId, updatedData);
    } catch (error) {
      setLoading(false);
      alert("Gagal memperbarui produk: " + (error instanceof Error ? error.message : String(error)));
      return;
    }
    setLoading(false);

    const updatedList = products.map((product) =>
      product.id === editingId ? { ...product, ...updatedData } : product
    );

    setProducts(updatedList);
    resetForm();
    setIsOpen(false);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemo) return;

    if (!name || !price || !costPrice || !stock) {
      return alert("Mohon isi field yang wajib!");
    }

    setLoading(true);

    try {
      await addProduct("user", {
        name,
        category: category || "Umum",
        price: Number(price),
        cost_price: Number(costPrice),
        stock: Number(stock) || 0,
      });
    } catch (error) {
      alert("Gagal menambah produk: " + (error instanceof Error ? error.message : String(error)));
      setLoading(false);
      return;
    }
    resetForm();
    setIsOpen(false);
    setCurrentPage(1);
    fetchProducts();
  };

  const handleDeleteProduct = async (idYangMauDihapus: string) => {
    if (isDemo) return;
    const yakin = confirm("Yakin ingin menghapus produk ini?");
    if (yakin) {
      try {
        await deleteProduct("user", idYangMauDihapus);

        const filteredProducts = products.filter(
          (item) => item.id !== idYangMauDihapus
        );
        setProducts(filteredProducts);
        setCurrentPage((page) =>
          Math.min(page, Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE)))
        );
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Gagal menghapus produk";
        alert("Gagal menghapus data: " + msg);
      }
    }
  };

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
    <div className="space-y-8  p-8">
      {/* HEADER */}
      <DirectionalReveal className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-6" direction="left">
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
          disabled={isDemo}
          hidden={isDemo}
          className="w-fit text-center flex items-center gap-2 bg-linear-to-r from-emerald-500 to-teal-500 text-neutral-950 font-bold px-5 py-2.5 rounded-xl text-sm hover:opacity-90 transition-all shadow-lg shadow-emerald-950/40"
        >
          <Plus className="w-4 h-4" /> Tambah Produk
        </button>
      </DirectionalReveal>

      {/* MODAL FORM */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 h-full z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-4 shadow-2xl relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-100 p-1 rounded-lg hover:bg-neutral-800 transition-colors"
            >
            </button>

            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-400" />
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
                  className="w-1/2 py-2.5 bg-neutral-800 text-neutral-300 font-semibold rounded-xl text-sm hover:bg-neutral-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-1/2 py-2.5 bg-emerald-500 text-white font-semibold rounded-xl text-sm hover:bg-emerald-400 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingId ? "Simpan Perubahan" : "Simpan Produk"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TABEL LIST PRODUK */}
      <DirectionalReveal className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-4" direction="up">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Package className="w-5 h-5 text-emerald-400" /> Daftar Inventaris Produk
        </h2>

        {loading && products.length === 0 ? (
          <div className="text-sm text-neutral-500 py-8 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
            <span>Memuat data inventaris...</span>
          </div>
        ) : products.length === 0 ? (
          <p className="text-sm text-neutral-500 py-8 text-center">
            Belum ada produk. Klik tombol &quot;Tambah Produk&quot; untuk membuat data pertama Anda!
          </p>
        ) : (
          <>
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
                    {!isDemo && <th className="py-3 px-2 text-center">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y border-neutral-800">
                {paginatedProducts.map((item) => (
                  <tr key={item.id} className="hover:bg-[#174A3A]/5 transition-colors">
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
                    {!isDemo && <td className="py-3 px-2">
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
                    </td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={currentPage}
            pageSize={PAGE_SIZE}
            totalItems={products.length}
            onPageChange={setCurrentPage}
            label="produk"
          />
          </>
        )}
      </DirectionalReveal>
    </div>
  );
}
