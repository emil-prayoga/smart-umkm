"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowUpRight, Sparkles } from "lucide-react";

const salesLine = "M 18 137 C 55 126, 67 141, 103 111 S 151 119, 183 94 S 231 104, 266 71 S 311 80, 350 42";

export default function DataGrowthStory() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ["start end", "end start"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 75, damping: 24, restDelta: 0.001 });

  const firstDataX = useTransform(progress, [0, 0.27, 0.53], [-42, -18, 0]);
  const firstDataY = useTransform(progress, [0, 0.27, 0.53], [-20, -8, 0]);
  const secondDataX = useTransform(progress, [0, 0.27, 0.53], [38, 17, 0]);
  const secondDataY = useTransform(progress, [0, 0.27, 0.53], [2, 5, 0]);
  const thirdDataX = useTransform(progress, [0, 0.27, 0.53], [-18, -8, 0]);
  const thirdDataY = useTransform(progress, [0, 0.27, 0.53], [26, 11, 0]);
  const dataOpacity = useTransform(progress, [0, 0.34, 0.58], [1, 1, 0]);
  const lineProgress = useTransform(progress, [0.22, 0.58, 0.82], [0, 1, 1]);
  const insightOpacity = useTransform(progress, [0.49, 0.68, 0.84], [0, 1, 1]);
  const insightY = useTransform(progress, [0.49, 0.78], [22, 0]);
  const recommendationOpacity = useTransform(progress, [0.68, 0.88, 1], [0, 1, 1]);
  const recommendationY = useTransform(progress, [0.68, 0.9], [18, 0]);

  return (
    <div className="growth-scene" ref={sceneRef} aria-label="Alur data penjualan menjadi insight dan rekomendasi">
      <div className="growth-scene-topline">
        <span>Ruang usaha</span>
        <span className="growth-live"><i /> Contoh analisis</span>
      </div>

      <div className="growth-stage growth-stage-data" aria-label="Data penjualan harian">
        <motion.div className="growth-data-slip growth-data-one" style={{ x: reducedMotion ? 0 : firstDataX, y: reducedMotion ? 0 : firstDataY, opacity: reducedMotion ? 1 : dataOpacity }}>
          <span>Kopi susu</span><b>12 terjual</b>
        </motion.div>
        <motion.div className="growth-data-slip growth-data-two" style={{ x: reducedMotion ? 0 : secondDataX, y: reducedMotion ? 0 : secondDataY, opacity: reducedMotion ? 1 : dataOpacity }}>
          <span>Roti sobek</span><b>8 terjual</b>
        </motion.div>
        <motion.div className="growth-data-slip growth-data-three" style={{ x: reducedMotion ? 0 : thirdDataX, y: reducedMotion ? 0 : thirdDataY, opacity: reducedMotion ? 1 : dataOpacity }}>
          <span>Es teh lemon</span><b>16 terjual</b>
        </motion.div>
      </div>

      <div className="growth-chart" aria-label="Grafik penjualan meningkat">
        <span className="growth-chart-label">Penjualan · 7 hari</span>
        <svg viewBox="0 0 370 170" role="img" aria-hidden="true">
          <path className="growth-chart-grid" d="M 0 42 H 370 M 0 88 H 370 M 0 134 H 370" />
          <motion.path
            className="growth-chart-line"
            d={salesLine}
            pathLength={1}
            style={{ pathLength: reducedMotion ? 1 : lineProgress }}
          />
          <circle className="growth-chart-point" cx="350" cy="42" r="5" />
        </svg>
      </div>

      <motion.div
        className="growth-insight"
        style={{ opacity: reducedMotion ? 1 : insightOpacity, y: reducedMotion ? 0 : insightY }}
      >
        <span className="growth-insight-mark"><Sparkles size={15} /></span>
        <span className="growth-insight-copy"><small>Pola yang terlihat</small><b>Minuman dingin paling laris menjelang siang.</b></span>
      </motion.div>

      <motion.div
        className="growth-recommendation"
        style={{ opacity: reducedMotion ? 1 : recommendationOpacity, y: reducedMotion ? 0 : recommendationY }}
      >
        <span><small>Langkah berikutnya</small><b>Siapkan stok lebih awal.</b></span>
        <ArrowUpRight size={16} aria-hidden="true" />
      </motion.div>

      <div className="growth-sequence" aria-hidden="true"><span>Transaksi</span><i /><span>Pola</span><i /><span>Keputusan</span></div>
    </div>
  );
}
