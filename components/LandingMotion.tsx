"use client";

import {
  motion,
  MotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { ReactNode, useRef } from "react";
import { ArrowDownRight, Boxes, CircleDollarSign, TrendingUp } from "lucide-react";

const featureItems = [
  {
    icon: Boxes,
    title: "Produk lebih teratur",
    text: "Pantau katalog, stok, dan harga dalam satu tempat yang mudah dibaca.",
  },
  {
    icon: CircleDollarSign,
    title: "Arus kas lebih jelas",
    text: "Catat pemasukan dan pengeluaran, lalu lihat kondisi usaha hari ini.",
  },
  {
    icon: TrendingUp,
    title: "Langkah berikutnya",
    text: "Ubah data usaha menjadi saran promo dan prediksi yang bisa ditindaklanjuti.",
  },
];
export function HeroHeadline() {
  const reducedMotion = useReducedMotion();
  const lineVariants = {
    hidden: { clipPath: "inset(0 100% 0 0)" },
    visible: { clipPath: "inset(0 0% 0 0)" },
  };

  return (
    <motion.h1 initial={reducedMotion ? false : "hidden"} animate="visible">
      <motion.span
        className="hero-title-line"
        variants={lineVariants}
        transition={{ duration: reducedMotion ? 0 : 0.72, ease: [0.22, 1, 0.36, 1] }}
      >
        Usaha kecil.
      </motion.span>
      <motion.span
        className="hero-title-line"
        variants={lineVariants}
        transition={{ duration: reducedMotion ? 0 : 0.72, delay: reducedMotion ? 0 : 0.16, ease: [0.22, 1, 0.36, 1] }}
      >
        Pikiran <em>besar.</em>
      </motion.span>
    </motion.h1>
  );
}

export function HeroScrollVisual({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const progress = useSpring(scrollYProgress, { stiffness: 65, damping: 22, restDelta: 0.001 });
  const y = useTransform(progress, [0, 1], [16, -34]);
  const rotateX = useTransform(progress, [0, 1], [1.2, -2.5]);
  const scale = useTransform(progress, [0, 1], [0.985, 1.015]);

  return (
    <motion.div
      ref={ref}
      className="hero-art"
      style={{ y: reducedMotion ? 0 : y, rotateX: reducedMotion ? 0 : rotateX, scale: reducedMotion ? 1 : scale }}
    >
      {children}
    </motion.div>
  );
}

export function ScrollColorHeading() {
  const ref = useRef<HTMLHeadingElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const color = useTransform(scrollYProgress, [0, 0.35, 0.78, 1], ["#242a26", "#174a3a", "#174a3a", "#927023"]);

  return (
    <h2 ref={ref}>
      Usaha tumbuh,<br />urusan ikut <motion.em style={{ color: reducedMotion ? "#174a3a" : color }}>menumpuk.</motion.em>
    </h2>
  );
}


export function FeatureStoryList() {
  const reducedMotion = useReducedMotion();

  return (
    <div className="feature-list">
      {featureItems.map(({ icon: Icon, title, text }, index) => {
        const fromLeft = index % 2 === 0;

        return (
          <motion.article
            className="feature-item"
            key={title}
            initial={
              reducedMotion
                ? false
                : {
                    opacity: 0,
                    x: fromLeft ? -35 : 35,
                  }
            }
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{
              once: true,
              amount: 0.15,
            }}
            transition={{
              duration: reducedMotion ? 0 : 0.65,
              delay: reducedMotion ? 0 : index * 0.12,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <span className="feature-number">
              0{index + 1}
            </span>

            <span className="feature-icon">
              <Icon size={22} strokeWidth={1.7} />
            </span>

            <div>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>

            <ArrowDownRight
              className="feature-arrow"
              size={20}
            />
          </motion.article>
        );
      })}
    </div>
  );
}


function ScrollStep({ index, progress, children }: { index: number; progress: MotionValue<number>; children: ReactNode }) {
  const reducedMotion = useReducedMotion();
  const start = 0.18 + index * 0.2;
  const end = start + 0.22;
  const activeColor = useTransform(progress, [start, end], ["#9a9d93", "#174a3a"]);
  const x = useTransform(progress, [Math.max(0, start - 0.2), start + 0.04], [index % 2 === 0 ? -12 : 12, 0]);

  return (
    <motion.article style={{ x: reducedMotion ? 0 : x }}>
      <motion.span className="step-mark" style={{ color: reducedMotion ? "#174a3a" : activeColor }}>0{index + 1}</motion.span>
      {children}
    </motion.article>
  );
}

export function StepStoryList() {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const progress = useSpring(scrollYProgress, { stiffness: 80, damping: 25, restDelta: 0.001 });
  const lineScale = useTransform(progress, [0.12, 0.85], [0, 1]);

  return (
    <div className="steps-list" ref={ref}>
      <motion.span className="steps-progress-line" style={{ scaleY: reducedMotion ? 1 : lineScale }} aria-hidden="true" />
      <ScrollStep index={0} progress={progress}><div><h3>Catat yang sudah berjalan</h3><p>Tambahkan produk, stok, dan transaksi sesuai ritme usaha Anda.</p></div></ScrollStep>
      <ScrollStep index={1} progress={progress}><div><h3>Lihat gambaran utuh</h3><p>Temukan ringkasan penjualan, arus kas, dan produk yang perlu perhatian.</p></div></ScrollStep>
      <ScrollStep index={2} progress={progress}><div><h3>Pilih langkah berikutnya</h3><p>Gunakan saran AI sebagai bahan pertimbangan, lalu tentukan sendiri.</p></div></ScrollStep>
    </div>
  );
}

export function DashboardScrollFrame({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [18, -14]);
  const rotateX = useTransform(scrollYProgress, [0, 1], [2.5, -1.6]);

  return (
    <motion.div
      ref={ref}
      className="preview-frame"
      style={{ y: reducedMotion ? 0 : y, rotateX: reducedMotion ? 0 : rotateX }}
    >
      {children}
    </motion.div>
  );
}
