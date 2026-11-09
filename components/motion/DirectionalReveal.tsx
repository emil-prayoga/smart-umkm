"use client";

import { motion, useAnimationControls, useReducedMotion } from "framer-motion";
import type { FormHTMLAttributes, ReactNode } from "react";
import { useCallback, useMemo, useRef } from "react";

type Direction = "up" | "right" | "down" | "left";

interface DirectionalRevealProps {
  children: ReactNode;
  className?: string;
  direction?: Direction;
  delay?: number;
  as?: "div" | "form";
  formProps?: Pick<FormHTMLAttributes<HTMLFormElement>, "onSubmit">;
}

const offsets: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 10 },
  right: { x: 10, y: 0 },
  down: { x: 0, y: -8 },
  left: { x: -10, y: 0 },
};

export default function DirectionalReveal({
  children,
  className,
  direction = "up",
  delay = 0,
  as = "div",
  formProps,
}: DirectionalRevealProps) {
  const reducedMotion = useReducedMotion();
  const controls = useAnimationControls();
  const transition = useMemo(() => ({
    duration: reducedMotion ? 0 : 0.42,
    delay: reducedMotion ? 0 : Math.min(delay, 0.12),
    ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
  }), [delay, reducedMotion]);
  const elementRef = useRef<HTMLElement | null>(null);

  const bindElement = useCallback((node: HTMLElement | null) => {
    elementRef.current = node;
  }, []);

  const revealAtPosition = useCallback(() => {
    if (reducedMotion) return;
    const node = elementRef.current;
    if (!node) return;

    const bounds = node.getBoundingClientRect();
    const deltaX = bounds.left + bounds.width / 2 - window.innerWidth / 2;
    const deltaY = bounds.top + bounds.height / 2 - window.innerHeight / 2;
    const directionFromPosition = Math.abs(deltaX) > Math.abs(deltaY)
      ? deltaX < 0 ? "left" : "right"
      : deltaY < 0 ? "down" : "up";
    const offset = offsets[directionFromPosition] ?? offsets[direction];

    // Measure at entry so a viewport resize still gets the direction of the current layout.
    controls.set({ opacity: 0, x: offset.x, y: offset.y });
    void controls.start({ opacity: 1, x: 0, y: 0 }, transition);
  }, [controls, direction, reducedMotion, transition]);

  const revealProps = {
    className,
    ref: bindElement,
    initial: reducedMotion ? false : { opacity: 0, x: 0, y: 0 },
    animate: reducedMotion ? { opacity: 1, x: 0, y: 0 } : controls,
    onViewportEnter: revealAtPosition,
    viewport: { once: true, amount: 0.12 },
    transition,
  };

  return as === "form" ? (
    <motion.form {...revealProps} onSubmit={formProps?.onSubmit}>{children}</motion.form>
  ) : (
    <motion.div {...revealProps}>{children}</motion.div>
  );
}
