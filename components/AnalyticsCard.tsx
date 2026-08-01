"use client";

import { Loader2, BarChart3, PieChart as PieIcon } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  cost_price: number;
  stock: number;
}

interface AnalyticsCardProps {
  products: Product[];
  loading: boolean;
}

const COLORS = ["#10b981", "#14b8a6", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899"];

export default function AnalyticsCard({ products, loading }: AnalyticsCardProps) {
  const chartData = products.map((item) => ({
    name: item.name,
    Modal: item.cost_price * item.stock,
    PotensiLaba: (item.price - item.cost_price) * item.stock,
  }));

  const stockPieData = products.map((item) => ({
    name: item.name,
    value: item.stock,
  }));

  if (loading) {
    return (
      <div className="p-12 text-center text-neutral-500 bg-neutral-900/50 border border-neutral-800 rounded-2xl animate-pulse flex items-center justify-center gap-2">
        <Loader2 className="animate-spin w-4 h-4" />
        <span>Memuat data & grafik dashboard...</span>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="p-12 text-center text-neutral-500 border border-neutral-800 rounded-2xl bg-neutral-900">
        Belum ada data produk untuk ditampilkan di grafik.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* GRAFIK 1: BAR CHART */}
      <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-4 shadow-sm">
        <div className="flex items-center gap-2 border-b border-neutral-800 pb-4">
          <BarChart3 className="w-5 h-5 text-emerald-400" />
          <h2 className="font-semibold text-neutral-200">
            Analisis Modal vs Potensi Laba per Produk
          </h2>
        </div>

        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={8} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis dataKey="name" stroke="#737373" fontSize={12} />
              <YAxis stroke="#737373" fontSize={12} />
              <Tooltip
                cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
                contentStyle={{
                  backgroundColor: "#171717",
                  borderColor: "#404040",
                  borderRadius: "8px",
                  color: "#f5f5f5",
                }}
                formatter={(value) => [`Rp ${Number(value).toLocaleString("id-ID")}`, ""]}
              />
              <Legend />

              <Bar
                dataKey="Modal"
                name="Modal"
                fill="rgba(13, 148, 136, 0.55)"
                stroke="#0d9488"
                strokeWidth={1}
                radius={[4, 4, 0, 0]}
                barSize={24}
              />

              <Bar
                dataKey="PotensiLaba"
                name="Potensi Laba"
                fill="rgba(16, 185, 129, 0.55)"
                stroke="#10b981"
                strokeWidth={1}
                radius={[4, 4, 0, 0]}
                barSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* GRAFIK 2: PIE CHART */}
      <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-4 shadow-sm">
        <div className="flex items-center gap-2 border-b border-neutral-800 pb-4">
          <PieIcon className="w-5 h-5 text-emerald-400" />
          <h2 className="font-semibold text-neutral-200">Komposisi Stok</h2>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={stockPieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
                stroke="#171717"
                strokeWidth={2}
              >
                {stockPieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`${COLORS[index % COLORS.length]}99`}
                    stroke={COLORS[index % COLORS.length]}
                    strokeWidth={1}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#171717",
                  borderColor: "#404040",
                  borderRadius: "8px",
                  color: "#f5f5f5",
                }}
                formatter={(value) => [`${value} Unit`, "Stok"]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}