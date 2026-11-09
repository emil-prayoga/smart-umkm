"use client";

import { useEffect, useRef } from "react";
import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  loading?: boolean;
  duration?: number;
}

const numberFormat = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 });

export default function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  loading = false,
  duration = 0.85,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const count = useMotionValue(0);
  const reducedMotion = useReducedMotion();
  const formatted = useTransform(count, (current) => `${prefix}${numberFormat.format(Math.round(current))}${suffix}`);

  useEffect(() => {
    if (loading || !inView) return;
    if (reducedMotion) {
      count.set(value);
      return;
    }

    const controls = animate(count, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
    });
    return controls.stop;
  }, [count, duration, inView, loading, reducedMotion, value]);

  return (
    <motion.span ref={ref} aria-live="off">
      {loading ? "—" : formatted}
    </motion.span>
  );
}
