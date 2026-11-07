"use client";

import { useEffect, useRef } from "react";

const categories = ["Warung & toko", "Usaha kuliner", "Brand rumahan", "Jasa lokal"];

export default function TrustMarquee() {
  const trackRef = useRef<HTMLDivElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const surface = surfaceRef.current;
    if (!track || !surface) return;

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let lastTime = 0;
    let offset = 0;
    let loopWidth = 0;

const updateLoopWidth = () => {
  loopWidth = track.scrollWidth / 3;
};

   const observer = new ResizeObserver(() => {
  updateLoopWidth();
  if (loopWidth > 0) offset %= loopWidth;
});

observer.observe(track);

updateLoopWidth();

    const animate = (now: number) => {
      if (!lastTime) lastTime = now;
      const delta = Math.min(now - lastTime, 40);
      lastTime = now;
      loopWidth = loopWidth || track.scrollWidth / 3;

      if (loopWidth > 0) {
        offset = (offset + delta * 0.026) % loopWidth;
        track.style.transform = `translate3d(${-offset}px, 0, 0)`;
      }

      const phase = now / 1900;
      const depth = Math.sin(phase);
      surface.style.transform = `translate3d(0, ${depth * 1.25}px, ${8 + depth * 3}px) rotateX(${-3.5 + depth * 1.1}deg) rotateY(${Math.sin(phase * 0.72) * 0.45}deg)`;
      frame = window.requestAnimationFrame(animate);
    };

    const syncMotionPreference = () => {
      window.cancelAnimationFrame(frame);
      lastTime = 0;
      if (motionPreference.matches) {
        track.style.transform = "none";
        surface.style.transform = "none";
      } else {
        frame = window.requestAnimationFrame(animate);
      }
    };

    syncMotionPreference();
    motionPreference.addEventListener("change", syncMotionPreference);

    return () => {
      window.cancelAnimationFrame(frame);
      motionPreference.removeEventListener("change", syncMotionPreference);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="trust-marquee" aria-label="Kategori usaha">
      <div className="trust-marquee-surface" ref={surfaceRef}>
        <div className="trust-marquee-track" ref={trackRef}>
  {[...categories, ...categories, ...categories].map(
    (category, index) => (
      <span
        className="trust-category"
        key={`${category}-${index}`}
        aria-hidden={index >= categories.length}
      >
        {category}
      </span>
    )
  )}
</div>
      </div>
    </div>
  );
}
