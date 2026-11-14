"use client";

import { useEffect, useRef } from "react";

interface Dot {
  bx: number;
  by: number;
  inclination: number;
  ascension: number;
  phase: number;
  speedMult: number;
}

interface DotGridBackgroundProps {
  dotColor?: string;
  dotSize?: number;
  dotSpacing?: number;
  orbitSpeed?: number;
  impactRadius?: number;
  scaleOnHover?: number;
  baseOpacity?: number;
  enableRevolve?: boolean;
  className?: string;
}

interface Rgb {
  r: number;
  g: number;
  b: number;
}

function smoothstep(t: number) {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
}

function resolveVar(raw: string, el: Element): string {
  const value = raw.trim();
  if (!value.startsWith("var(")) return value;

  const inner = value.slice(4, -1).trim();
  const commaIndex = inner.indexOf(",");
  const varName = (commaIndex !== -1 ? inner.slice(0, commaIndex) : inner).trim();
  const fallback = commaIndex !== -1 ? inner.slice(commaIndex + 1).trim() : "";

  try {
    const resolved = getComputedStyle(el).getPropertyValue(varName).trim();
    if (resolved) return resolved;
  } catch {
    // segue para o fallback
  }

  return fallback ? resolveVar(fallback, el) : "#888888";
}

function parseColor(raw: string, el: Element): Rgb {
  const color = resolveVar(raw, el);

  if (color.startsWith("rgb")) {
    const match = color.match(/[\d.]+/g) ?? [];
    return {
      r: Number(match[0]) || 0,
      g: Number(match[1]) || 0,
      b: Number(match[2]) || 0,
    };
  }

  let hex = color.replace("#", "");
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  }

  const int = parseInt(hex.slice(0, 6), 16);
  if (Number.isNaN(int)) return { r: 136, g: 136, b: 136 };

  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
}

/**
 * Grade de pontos em canvas com órbitas ao redor do cursor.
 * Adaptada do componente "Dot Grid BG" do Framer para rodar direto no projeto,
 * sem a dependência `framer` e com correções de performance e acessibilidade.
 */
export default function DotGridBackground({
  dotColor = "#39ff14",
  dotSize = 2.4,
  dotSpacing = 26,
  orbitSpeed = 1.2,
  impactRadius = 150,
  scaleOnHover = 2,
  baseOpacity = 0.22,
  enableRevolve = true,
  className,
}: DotGridBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const target: HTMLElement =
      canvas.closest<HTMLElement>("section, [data-dot-grid-scope]") ??
      canvas.parentElement ??
      canvas;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let width = 0;
    let height = 0;
    let color = parseColor(dotColor, canvas);
    let dots: Dot[] = [];

    let frame = 0;
    let visible = true;
    let hovering = false;
    let mouseX = -9999;
    let mouseY = -9999;
    let leaveTime = Number.NEGATIVE_INFINITY;
    let previousTime = 0;
    let angle = 0;

    const buildDots = () => {
      const spacing = Math.max(12, dotSpacing);
      const columns = Math.ceil(width / spacing) + 2;
      const rows = Math.ceil(height / spacing) + 2;

      dots = [];
      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
          dots.push({
            bx: column * spacing,
            by: row * spacing,
            inclination: Math.random() * Math.PI,
            ascension: Math.random() * Math.PI * 2,
            phase: Math.random() * Math.PI * 2,
            speedMult: 0.7 + Math.random() * 0.6,
          });
        }
      }
    };

    const paintRest = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${baseOpacity})`;

      const radius = dotSize / 2;
      for (const dot of dots) {
        ctx.beginPath();
        ctx.arc(dot.bx, dot.by, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;

      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      color = parseColor(dotColor, canvas);
      buildDots();
      paintRest();
    };

    const draw = (time: number) => {
      frame = 0;
      if (!visible) return;

      const delta = previousTime ? Math.min((time - previousTime) / 1000, 0.05) : 0;
      previousTime = time;
      angle += orbitSpeed * delta;

      const sinceLeave = hovering ? 0 : Math.max(0, time - leaveTime) / 1000;
      const decay = hovering ? 1 : smoothstep(Math.max(0, 1 - sinceLeave * 1.5));

      // Sem interação as posições de repouso já estão pintadas: encerra o loop.
      if (!hovering && decay === 0) {
        paintRest();
        return;
      }

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;

      for (const dot of dots) {
        const dx = dot.bx - mouseX;
        const dy = dot.by - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        let x = dot.bx;
        let y = dot.by;
        let scale = 1;
        let alpha = baseOpacity;

        if (distance < impactRadius && distance > 0) {
          const t = distance / impactRadius;
          const influence = smoothstep(1 - t) * decay;

          if (enableRevolve) {
            const orbitRadius = (1 - t) * dotSpacing * 0.7 * influence;
            const theta = angle * dot.speedMult + dot.phase;

            const cosAscension = Math.cos(dot.ascension);
            const sinAscension = Math.sin(dot.ascension);
            const cosInclination = Math.cos(dot.inclination);
            const sinInclination = Math.sin(dot.inclination);

            const localX = Math.cos(theta);
            const localY = Math.sin(theta) * cosInclination;
            const localZ = Math.sin(theta) * sinInclination;

            const offsetX = (localX * cosAscension - localY * sinAscension) * orbitRadius;
            const offsetY = (localX * sinAscension + localY * cosAscension) * orbitRadius;

            x = dot.bx + offsetX;
            y = dot.by + offsetY;

            const depthScale = 0.75 + 0.25 * ((localZ + 1) / 2);
            scale = (1 + (scaleOnHover - 1) * influence) * depthScale;
            alpha = (baseOpacity + (1 - baseOpacity) * influence) * depthScale;
          } else {
            scale = 1 + (scaleOnHover - 1) * influence;
            alpha = baseOpacity + (1 - baseOpacity) * influence;
          }
        }

        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(x, y, (dotSize / 2) * scale, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      frame = requestAnimationFrame(draw);
    };

    const start = () => {
      if (frame || !visible || reduceMotion.matches) return;
      previousTime = 0;
      frame = requestAnimationFrame(draw);
    };

    if (reduceMotion.matches) {
      const observer = new ResizeObserver(resize);
      observer.observe(canvas);
      resize();
      return () => observer.disconnect();
    }

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType && event.pointerType !== "mouse") return;

      const rect = canvas.getBoundingClientRect();
      mouseX = event.clientX - rect.left;
      mouseY = event.clientY - rect.top;
      hovering = true;
      start();
    };

    const onPointerLeave = () => {
      hovering = false;
      leaveTime = performance.now();
      start();
    };

    const intersection = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;

        if (!visible) {
          if (frame) cancelAnimationFrame(frame);
          frame = 0;
          paintRest();
        } else if (hovering) {
          start();
        }
      },
      { threshold: 0 },
    );

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    intersection.observe(canvas);

    resize();

    target.addEventListener("pointermove", onPointerMove, { passive: true });
    target.addEventListener("pointerleave", onPointerLeave);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersection.disconnect();
      target.removeEventListener("pointermove", onPointerMove);
      target.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [
    baseOpacity,
    dotColor,
    dotSize,
    dotSpacing,
    enableRevolve,
    impactRadius,
    orbitSpeed,
    scaleOnHover,
  ]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{ display: "block", width: "100%", height: "100%" }}
    />
  );
}
