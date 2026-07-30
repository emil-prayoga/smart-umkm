"use client";

import { ShoppingCart, Search, CreditCard, Banknote, Trash2, CheckCircle2, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/src/lib/supabaseClient";

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

export default function TransactionsPage() {
  // STATE DATA & UI
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "qris">("cash");
  const [moneyPaid, setMoneyPaid] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. FETCH DATA PRODUK DARI SUPABASE
  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("name", { ascending: true });

    if (!error) setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    const loadProducts = async () => {
      await fetchProducts();
    };
  loadProducts();
  }, []);

  // 2. LOGIKA KERANJANG (CART)
  const addToCart = (product: Product) => {
    if (product.stock <= 0) return alert("Stok produk ini sudah habis!");

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.product.id === product.id);

      if (existingIndex > -1) {
        if (prevCart[existingIndex].quantity >= product.stock) {
          alert("Jumlah di keranjang sudah mencapai batas stok!");
          return prevCart;
        }

        const updatedCart = [...prevCart];
        const item = updatedCart[existingIndex];
        const newQty = item.quantity + 1;

        updatedCart[existingIndex] = {
          ...item,
          quantity: newQty,
          subtotal: newQty * product.price,
        };

        return updatedCart;
      } else {
        return [
          ...prevCart,
          { product, quantity: 1, subtotal: product.price },
        ];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => setCart([]);

  // KALKULASI TOTAL & KEMBALIAN
  const totalAmount = cart.reduce((acc, item) => acc + item.subtotal, 0);
  const numMoneyPaid = Number(moneyPaid) || 0;
  const moneyChange = paymentMethod === "cash" && numMoneyPaid > totalAmount ? numMoneyPaid - totalAmount : 0;

  // FILTER PENCARIAN PRODUK
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 3. LOGIKA CHECKOUT / SIMPAN TRANSAKSI
  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Pilih minimal 1 produk terlebih dahulu!");
    if (paymentMethod === "cash" && numMoneyPaid < totalAmount) {
      return alert("Uang yang diterima masih kurang dari total pembayaran!");
    }

    setIsSubmitting(true);

    try {
      // a. Insert ke tabel transactions
      const { data: transData, error: transError } = await supabase
        .from("transactions")
        .insert([
          {
            total_amount: totalAmount,
            payment_method: paymentMethod,
            money_paid: paymentMethod === "cash" ? numMoneyPaid : totalAmount,
            money_change: moneyChange,
          },
        ])
        .select()
        .single();

      if (transError) throw transError;

      // b. Insert item ke tabel transaction_items
      const itemsToInsert = cart.map((item) => ({
        transaction_id: transData.id,
        product_id: item.product.id,
        product_name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        subtotal: item.subtotal,
      }));

      const { error: itemsError } = await supabase
        .from("transaction_items")
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      // c. Update / Potong stok di tabel products
      for (const item of cart) {
        const newStock = item.product.stock - item.quantity;
        await supabase
          .from("products")
          .update({ stock: newStock })
          .eq("id", item.product.id);
      }

      alert("Transaksi berhasil dicatat dan stok telah ter-update!");
      setCart([]);
      setMoneyPaid("");
      fetchProducts(); // Refresh list produk
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      alert("Gagal memproses transaksi: " + errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-100">Kasir / POS</h1>
        <p className="text-neutral-400 text-sm mt-1">
          Pilih produk untuk mencatat transaksi penjualan harian UMKM secara langsung.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* KATALOG PRODUK (KIRI) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-neutral-500" />
            <input
              type="text"
              placeholder="Cari nama produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-neutral-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {loading ? (
            <div className="p-8 text-center text-neutral-500 flex justify-center items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> Memuat data produk...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-8 text-center text-neutral-500 bg-neutral-900/50 rounded-2xl border border-neutral-800">
              Produk tidak ditemukan atau belum ada di database.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredProducts.map((product) => {
                const isOutOfStock = product.stock <= 0;
                return (
                  <button
                    key={product.id}
                    type="button"
                    disabled={isOutOfStock}
                    onClick={() => addToCart(product)}
                    className={`p-4 rounded-2xl text-left transition-all border ${
                      isOutOfStock
                        ? "bg-neutral-900/40 border-neutral-800/50 opacity-50 cursor-not-allowed"
                        : "bg-neutral-900 border-neutral-800 hover:border-emerald-500/50 cursor-pointer group"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-400">
                        {product.category || "Umum"}
                      </span>
                      <span
                        className={`text-xs font-medium ${
                          isOutOfStock
                            ? "text-red-400"
                            : product.stock <= 5
                            ? "text-amber-400"
                            : "text-emerald-400"
                        }`}
                      >
                        {isOutOfStock ? "Habis" : `Stok: ${product.stock}`}
                      </span>
                    </div>
                    <h3 className="font-semibold text-neutral-200 text-sm group-hover:text-emerald-400 transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-emerald-400 font-bold text-sm mt-1">
                      Rp {product.price.toLocaleString("id-ID")}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* KERANJANG BELANJA (KANAN) */}
        <div className="lg:col-span-5 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-neutral-100">
              <ShoppingCart className="w-5 h-5 text-emerald-400" /> Detail Pesanan
            </h2>
            {cart.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="text-xs text-neutral-500 hover:text-red-400 transition-colors"
              >
                Bersihkan
              </button>
            )}
          </div>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {cart.length === 0 ? (
              <p className="text-xs text-neutral-500 text-center py-6">
                Belum ada produk yang dipilih. Klik produk di sebelah kiri.
              </p>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center justify-between bg-neutral-950 p-3 rounded-xl border border-neutral-800/60 text-sm"
                >
                  <div className="space-y-0.5">
                    <p className="font-medium text-neutral-200">{item.product.name}</p>
                    <p className="text-xs text-neutral-400">
                      Rp {item.product.price.toLocaleString("id-ID")} x {item.quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-emerald-400">
                      Rp {item.subtotal.toLocaleString("id-ID")}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-neutral-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="space-y-2 pt-2 border-t border-neutral-800">
            <label className="text-xs text-neutral-400">Metode Pembayaran</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("cash")}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                  paymentMethod === "cash"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    : "bg-neutral-950 text-neutral-400 border border-neutral-800"
                }`}
              >
                <Banknote className="w-4 h-4" /> Tunai / Cash
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("qris")}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                  paymentMethod === "qris"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    : "bg-neutral-950 text-neutral-400 border border-neutral-800"
                }`}
              >
                <CreditCard className="w-4 h-4" /> QRIS / Transfer
              </button>
            </div>
          </div>

          {paymentMethod === "cash" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-neutral-400">Uang Diterima (Rp)</label>
                <input
                  type="text"
                  placeholder="0"
                  value={moneyPaid}
                  onChange={(e) => setMoneyPaid(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs text-neutral-400">Kembalian</label>
                <div className="mt-1 px-3 py-2 bg-neutral-950 border border-neutral-800/80 rounded-xl text-sm font-semibold text-amber-400">
                  Rp {moneyChange.toLocaleString("id-ID")}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3 pt-4 border-t border-neutral-800">
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-400">Total Pembayaran</span>
              <span className="text-2xl font-bold text-emerald-400">
                Rp {totalAmount.toLocaleString("id-ID")}
              </span>
            </div>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleCheckout}
              className="w-full py-3 bg-emerald-500 text-neutral-950 font-bold rounded-xl text-sm hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" /> Selesaikan Transaksi
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}