"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

type RouteMotionProps = {
  routeKey: string;
  children: React.ReactNode;
};

function routeFamily(path: string) {
  const segment = path.split("/").filter(Boolean).at(-1) ?? "dashboard";
  if (["login", "register"].includes(segment)) return "auth";
  if (["products", "finance"].includes(segment)) return "ledger";
  if (["analytics", "insights", "ideas"].includes(segment)) return "signal";
  if (segment === "settings") return "settings";
  return "overview";
}

export default function RouteMotion({ routeKey, children }: RouteMotionProps) {
  const reducedMotion = useReducedMotion();
  const family = routeFamily(routeKey);
  const isDemo = routeKey === "/demo" || routeKey.startsWith("/demo/");
  const offset = {
    overview: { x: 0, y: 8 },
    ledger: { x: 8, y: 0 },
    signal: { x: -8, y: 0 },
    settings: { x: 0, y: -6 },
    auth: { x: 0, y: 0 },
  }[family];

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={routeKey}
        className={`route-motion route-${family}${isDemo ? " route-demo" : " route-workspace"}`}
        initial={reducedMotion ? false : { opacity: 0, ...offset }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        exit={reducedMotion ? { opacity: 1 } : { opacity: 0, x: offset.x * -0.45, y: offset.y * -0.45 }}
        transition={{
          duration: reducedMotion ? 0 : family === "auth" ? 0.24 : 0.28,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
