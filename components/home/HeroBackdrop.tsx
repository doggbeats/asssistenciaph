"use client";

import { useEffect, useRef } from "react";
import DotGridBackground from "@/components/home/DotGridBackground";

/**
 * Fundo interativo do hero.
 *
 * A grade ampla faz um parallax sutil com o ponteiro, a grade de pontos do
 * Framer (adaptada em DotGridBackground) orbita ao redor do cursor e um
 * brilho ambiente flutua devagar. Em telas sem mouse ou com movimento
 * reduzido, o fundo fica estático.
 */
export default function HeroBackdrop() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const section = root?.parentElement;
    if (!root || !section) return;

    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!canHover.matches || reduceMotion.matches) return;

    const target = { x: 0.5, y: 0.5 };
    const current = { x: 0.5, y: 0.5 };
    let frame = 0;

    const render = () => {
      frame = 0;

      const rect = section.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      current.x += (target.x - current.x) * 0.12;
      current.y += (target.y - current.y) * 0.12;

      root.style.setProperty("--hero-x", (current.x * 2 - 1).toFixed(4));
      root.style.setProperty("--hero-y", (current.y * 2 - 1).toFixed(4));

      const settled =
        Math.abs(target.x - current.x) < 0.0005 &&
        Math.abs(target.y - current.y) < 0.0005;

      if (!settled) frame = requestAnimationFrame(render);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType && event.pointerType !== "mouse") return;

      const rect = section.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      target.x = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
      target.y = Math.min(Math.max((event.clientY - rect.top) / rect.height, 0), 1);

      if (!frame) frame = requestAnimationFrame(render);
    };

    section.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      section.removeEventListener("pointermove", onPointerMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="hero-backdrop pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="hero-ambient" />
      <div className="hero-grid-far" />
      <DotGridBackground
        className="hero-dots"
        dotColor="#39ff14"
        dotSize={2.4}
        dotSpacing={26}
        orbitSpeed={1.2}
        impactRadius={150}
        scaleOnHover={2}
        baseOpacity={0.22}
      />
      <div className="hero-vignette" />
    </div>
  );
}
