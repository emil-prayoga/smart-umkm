import type { ProductRecord, TransactionRecord } from "./types";

export const DEMO_STORE = {
  name: "Kedai Rasa",
  category: "Makanan & Minuman",
  location: "Bandung",
};

export const DEMO_PRODUCTS: ProductRecord[] = [
  { id: "demo-p-1", name: "Kopi Susu Aren", category: "Minuman", price: 18000, cost_price: 8500, stock: 7, created_at: "2026-11-08T08:00:00.000Z" },
  { id: "demo-p-2", name: "Es Kopi Pandan", category: "Minuman", price: 20000, cost_price: 9200, stock: 24, created_at: "2026-11-07T08:00:00.000Z" },
  { id: "demo-p-3", name: "Roti Bakar Cokelat", category: "Makanan", price: 22000, cost_price: 12000, stock: 16, created_at: "2026-11-06T08:00:00.000Z" },
  { id: "demo-p-4", name: "Teh Lemon Madu", category: "Minuman", price: 16000, cost_price: 7000, stock: 4, created_at: "2026-11-05T08:00:00.000Z" },
  { id: "demo-p-5", name: "Pisang Goreng Keju", category: "Makanan", price: 19000, cost_price: 10500, stock: 12, created_at: "2026-11-04T08:00:00.000Z" },
  { id: "demo-p-6", name: "Kopi Americano", category: "Minuman", price: 15000, cost_price: 6000, stock: 31, created_at: "2026-11-03T08:00:00.000Z" },
];

export const DEMO_TRANSACTIONS: TransactionRecord[] = [
  { id: "demo-t-1", created_at: "2026-11-08T09:30:00.000Z", type: "income", amount: 486000, category: "Penjualan", description: "Penjualan pagi" },
  { id: "demo-t-2", created_at: "2026-11-08T07:10:00.000Z", type: "expense", amount: 185000, category: "Bahan Baku", description: "Susu dan biji kopi" },
  { id: "demo-t-3", created_at: "2026-11-07T13:45:00.000Z", type: "income", amount: 735000, category: "Penjualan", description: "Penjualan harian" },
  { id: "demo-t-4", created_at: "2026-11-07T08:15:00.000Z", type: "expense", amount: 220000, category: "Bahan Baku", description: "Persediaan bahan" },
  { id: "demo-t-5", created_at: "2026-11-06T14:20:00.000Z", type: "income", amount: 628000, category: "Penjualan", description: "Penjualan harian" },
  { id: "demo-t-6", created_at: "2026-11-06T10:00:00.000Z", type: "expense", amount: 90000, category: "Operasional", description: "Gas dan air" },
  { id: "demo-t-7", created_at: "2026-11-05T16:30:00.000Z", type: "income", amount: 552000, category: "Penjualan", description: "Pesanan kantor" },
  { id: "demo-t-8", created_at: "2026-11-05T08:20:00.000Z", type: "expense", amount: 175000, category: "Bahan Baku", description: "Roti dan topping" },
  { id: "demo-t-9", created_at: "2026-11-04T15:10:00.000Z", type: "income", amount: 694000, category: "Penjualan", description: "Penjualan harian" },
  { id: "demo-t-10", created_at: "2026-11-03T11:25:00.000Z", type: "income", amount: 438000, category: "Penjualan", description: "Penjualan siang" },
];

export const DEMO_INSIGHTS = {
  bundling: {
    title: "Paket Teman Ngopi",
    description: "Padukan Kopi Susu Aren dengan Roti Bakar Cokelat untuk menaikkan nilai pesanan.",
    suggestedPrice: "Rp 36.000",
  },
  promo: {
    title: "Sore Hemat",
    strategy: "Tawarkan potongan ringan untuk pembelian minuman dan camilan setelah pukul 15.00.",
    targetDays: "Senin–Jumat, pukul 15.00–17.00",
  },
  pricing: {
    title: "Jaga Margin Minuman",
    advice: "Tinjau biaya bahan Teh Lemon Madu dan pertahankan margin sebelum menambah diskon.",
  },
};

export const DEMO_ANALYTICS_TEXT = `• Produk dengan margin per unit tertinggi saat ini adalah Es Kopi Pandan. Pertimbangkan menonjolkannya pada menu.
• Teh Lemon Madu memiliki stok rendah. Periksa kebutuhan bahan sebelum jam ramai.
• Uji paket minuman dan camilan pada sore hari, lalu bandingkan hasil penjualan minggu berikutnya.

Catatan: Ini contoh insight demonstrasi yang dihitung dari data contoh, bukan prediksi AI langsung.`;

export const DEMO_IDEAS = [
  { title: "Paket Sarapan Praktis", description: "Kopi dan roti untuk pelanggan yang membutuhkan sarapan cepat.", estimatedCapital: "Rp 1.500.000", potentialProfit: "Margin contoh 35%", competitorAnalysis: "Bedakan paket melalui pilihan rasa dan layanan pesan-ambil." },
  { title: "Minuman Musiman", description: "Menu teh buah dengan bahan yang mudah disesuaikan per musim.", estimatedCapital: "Rp 2.000.000", potentialProfit: "Margin contoh 40%", competitorAnalysis: "Uji rasa dalam batch kecil dan bandingkan dengan menu minuman sekitar." },
  { title: "Snack Teman Kerja", description: "Paket camilan untuk pesanan rapat atau kebutuhan kantor sekitar.", estimatedCapital: "Rp 2.500.000", potentialProfit: "Margin contoh 32%", competitorAnalysis: "Tawarkan ukuran paket yang jelas dan jadwal pemesanan yang praktis." },
];

export function getDemoProducts(): ProductRecord[] {
  return DEMO_PRODUCTS.map((product) => ({ ...product }));
}

export function getDemoTransactions(): TransactionRecord[] {
  return DEMO_TRANSACTIONS.map((transaction) => ({ ...transaction }));
}
