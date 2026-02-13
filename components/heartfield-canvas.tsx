"use client";

import { useEffect, useRef } from "react";

type Dot = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  hue: number;
  phase: number;
};

function mulberry32(seed: number) {
  return function rng() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.2);
  ctx.bezierCurveTo(x, y - size * 0.6, x - size, y - size * 0.2, x, y + size);
  ctx.bezierCurveTo(x + size, y - size * 0.2, x, y - size * 0.6, x, y + size * 0.2);
  ctx.closePath();
}

export function HeartfieldCanvas({ seed = 20260214 }: { seed?: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const rng = mulberry32(seed);
    const particles: Dot[] = [];
    const particleCount = 48;
    let raf = 0;

    const setSize = () => {
      const { innerWidth, innerHeight, devicePixelRatio } = window;
      const ratio = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.floor(innerWidth * ratio);
      canvas.height = Math.floor(innerHeight * ratio);
      canvas.style.width = `${innerWidth}px`;
      canvas.style.height = `${innerHeight}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const spawn = () => {
      particles.length = 0;
      for (let i = 0; i < particleCount; i += 1) {
        particles.push({
          x: rng() * window.innerWidth,
          y: rng() * window.innerHeight,
          vx: (rng() - 0.5) * 0.22,
          vy: (rng() - 0.5) * 0.22,
          size: 4 + rng() * 8,
          hue: 335 + rng() * 30,
          phase: rng() * Math.PI * 2
        });
      }
    };

    const frame = (time: number) => {
      const t = time * 0.0012;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (const dot of particles) {
        dot.x += dot.vx;
        dot.y += dot.vy;
        dot.phase += 0.012;

        if (dot.x < -20) dot.x = window.innerWidth + 20;
        if (dot.x > window.innerWidth + 20) dot.x = -20;
        if (dot.y < -20) dot.y = window.innerHeight + 20;
        if (dot.y > window.innerHeight + 20) dot.y = -20;

        const pulse = 0.75 + Math.sin(dot.phase + t) * 0.25;
        const size = dot.size * pulse;
        ctx.fillStyle = `hsla(${dot.hue}, 85%, 74%, 0.18)`;
        drawHeart(ctx, dot.x, dot.y, size);
        ctx.fill();
      }
      raf = window.requestAnimationFrame(frame);
    };

    setSize();
    spawn();
    raf = window.requestAnimationFrame(frame);

    const onResize = () => {
      setSize();
      spawn();
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.cancelAnimationFrame(raf);
    };
  }, [seed]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: -1
      }}
    />
  );
}
