"use client"
import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabaseClient";
import { Plus, Package} from 'lucide-react'

interface Product {
    id: string;
    name: string;
    category:string;
    price: number;
    cost_price:number;
    stock: number;
}

export default function ProductPage(){
    const [products, setProduct] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [price, setPrice] = useState("");
    const [costPrice, setCostPrice] = useState("");
    const [stock, setStock] = useState("");

    const fetchProduct = async() => {
        try{
            const {data, error} = await supabase
            .from("products")
            .select("*")
            .order("created_at", {ascending: false})

            if (error) {
                console.log("Gagal mendapatakan produk", error)
            } else {
            setProduct(data || []);
        }
        } catch(err){
                console.error("Unexpected error:", err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
    const loadProducts = async () => {
      await fetchProduct();
    };
  loadProducts();
  }, []);

      const handleDeleteProduct = (idYangMauDihapus:string) =>{
            const updateProduct = products.filter((item) => item.id !== idYangMauDihapus);
            setProduct(updateProduct);
        };

    const handleAddProduct = async(e: React.FormEvent) =>{
        e.preventDefault();

        if (!name || !price || !costPrice || !stock) {
            return alert("Mohon isi field yang wajib!");
        }

        setLoading(true);

        const {error} = await  supabase.from("products").insert([
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
      setName("");
      setCategory("");
      setPrice("");
      setCostPrice("");
      setStock("");
      fetchProduct();
    }
    }
    return(
        <main className="bg-neutral-950 text-neutral-100 p-6  ">
      <div className=" mx-auto min-h-screen  space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-emerald-400">Manajemen Produk</h1>
          <p className="text-neutral-400 text-sm mt-1">
            Tambah dan kelola daftar inventaris tokomu di sini
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-4 bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Plus className="w-5 h-5 text-emerald-400" /> Tambah Produk Baru
          </h2>

          <form onSubmit={handleAddProduct} className="space-y-3">
            <div>
              <label className="text-xs text-neutral-400">Nama Produk *</label>
              <input
                type="text"
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
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  placeholder="8000"
                  className="w-full mt-1 px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-neutral-100"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-neutral-400">Stok Awal</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="50"
                className="w-full mt-1 px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-neutral-100"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-2 bg-emerald-500 text-neutral-950 font-semibold rounded-xl text-sm hover:bg-emerald-400 transition-colors disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Simpan Produk"}
            </button>
          </form>
        </div>

        {/* TABEL LIST PRODUK */}
        <div className="lg:col-span-8 bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-400" /> Daftar Inventaris Produk
          </h2>

          {loading && products.length === 0 ? (
            <p className="text-sm text-neutral-500">Memuat data...</p>
          ) : products.length === 0 ? (
            <p className="text-sm text-neutral-500 py-8 text-center">Belum ada produk. Tambahkan produk pertamamu!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-neutral-300">
                <thead className="border-b border-neutral-800 text-xs text-neutral-500 uppercase">
                  <tr>
                    <th className="py-3 px-2">Nama</th>
                    <th className="py-3 px-2">Kategori</th>
                    <th className="py-3 px-2">Harga Jual</th>
                    <th className="py-3 px-2">Laba/Unit</th>
                    <th className="py-3 px-2">Stok</th>
                    <th className="py-3 px-2"> Aksi </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/50">
                  {products.map((item) => (
                    <tr key={item.id} className="hover:bg-neutral-800/30 transition-colors">
                      <td className="py-3 px-2 font-medium text-neutral-100">{item.name}</td>
                      <td className="py-3 px-2 text-neutral-400">{item.category}</td>
                      <td className="py-3 px-2">Rp {item.price.toLocaleString("id-ID")}</td>
                      <td className="py-3 px-2 text-emerald-400">
                        Rp {(item.price - item.cost_price).toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-2">{item.stock}</td>
                      <td className="py-3 px-2">
                      <div className="inline-block">
                        <button
                          onClick={() => handleDeleteProduct(item.id)}
                          className="w-16 py-2.5 mt-2 bg-emerald-500 text-neutral-950 font-semibold rounded-xl text-sm hover:bg-emerald-400 transition-colors disabled:opacity-50">
                            Hapus
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
      </div>
    </main>
    )
}