"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface AnimatedCanvasBannerProps {
  className?: string;
  aspectRatio?: "square" | "video" | "wide" | "tall" | "auto" | string;
  showDetailedGrid?: boolean;
  title?: string;
  subtitle?: string;
  badge?: string;
  icon?: React.ReactNode;
}

/**
 * AnimatedCanvasBanner Component
 * 
 * A high-end architectural glass structure canvas placeholder with:
 * - Royal Navy to Deep Black gradient background (#0B192C -> #020617)
 * - 8x4 architectural aluminum blueprint grid
 * - Intersecting luxury gold structural brace beams (#D4AF37)
 * - Overlapping geometric securit glass panels
 * - Top-right warm solar radial glow (#FFA500 / #F59E0B)
 * - Smooth infinite light reflection shimmer sweep
 * - Corner blueprint crosshair & dimension accents
 */
export function AnimatedCanvasBanner({
  className,
  aspectRatio = "video",
  showDetailedGrid = true,
  title,
  subtitle,
  badge,
  icon,
}: AnimatedCanvasBannerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let startTime: number | null = null;

    // Handle high-DPI crisp rendering
    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // Animation Loop using requestAnimationFrame
    const render = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = (timestamp - startTime) / 1000; // in seconds

      const width = canvas.width;
      const height = canvas.height;
      if (width === 0 || height === 0) {
        animFrameIdRef.current = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // ── 1. Background Gradient (Royal Navy #0B192C to Deep Black #020617) ──
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, "#0F172A");
      bgGrad.addColorStop(0.4, "#0B192C");
      bgGrad.addColorStop(1, "#020617");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // ── 2. Top-Right Solar Radial Glow (#FFA500 / #D4AF37) ───────────────
      const glowX = width * 0.85;
      const glowY = height * 0.15;
      const glowRadius = Math.max(width, height) * 0.45;
      const solarGlow = ctx.createRadialGradient(
        glowX,
        glowY,
        0,
        glowX,
        glowY,
        glowRadius
      );
      solarGlow.addColorStop(0, "rgba(255, 165, 0, 0.28)");
      solarGlow.addColorStop(0.3, "rgba(212, 175, 55, 0.18)");
      solarGlow.addColorStop(0.7, "rgba(245, 158, 11, 0.06)");
      solarGlow.addColorStop(1, "rgba(2, 6, 23, 0)");

      ctx.fillStyle = solarGlow;
      ctx.fillRect(0, 0, width, height);

      // ── 3. Architectural Blueprint Grid (8 cols x 4 rows) ────────────────
      if (showDetailedGrid) {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.13)";
        ctx.lineWidth = 1;

        const cols = 8;
        const rows = 4;
        const colWidth = width / cols;
        const rowHeight = height / rows;

        // Vertical Mullion Lines
        for (let c = 1; c < cols; c++) {
          const x = Math.floor(c * colWidth);
          ctx.beginPath();
          ctx.setLineDash([6, 4]);
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }

        // Horizontal Transom Lines
        for (let r = 1; r < rows; r++) {
          const y = Math.floor(r * rowHeight);
          ctx.beginPath();
          ctx.setLineDash([6, 4]);
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        ctx.setLineDash([]); // Reset dash
      }

      // ── 4. Intersecting Structural Brace Beams (Gold #D4AF37) ────────────
      ctx.strokeStyle = "rgba(212, 175, 55, 0.22)";
      ctx.lineWidth = Math.max(2, Math.floor(width * 0.003));

      // Primary Corner Diagonal
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(width, height);
      ctx.stroke();

      // Secondary Corner Diagonal
      ctx.beginPath();
      ctx.moveTo(width, 0);
      ctx.lineTo(0, height);
      ctx.stroke();

      // Structural Support Arc / Inner Diamond Frame
      ctx.strokeStyle = "rgba(212, 175, 55, 0.14)";
      ctx.beginPath();
      ctx.moveTo(width * 0.5, height * 0.1);
      ctx.lineTo(width * 0.9, height * 0.5);
      ctx.lineTo(width * 0.5, height * 0.9);
      ctx.lineTo(width * 0.1, height * 0.5);
      ctx.closePath();
      ctx.stroke();

      // ── 5. Geometric Glass Polygons (Securit Facade Layers) ──────────────
      const glassPanels = [
        {
          points: [
            [0.15, 0.1],
            [0.45, 0.05],
            [0.35, 0.6],
            [0.08, 0.45],
          ],
          color: "rgba(255, 255, 255, 0.04)",
          stroke: "rgba(255, 255, 255, 0.2)",
        },
        {
          points: [
            [0.45, 0.05],
            [0.85, 0.15],
            [0.75, 0.7],
            [0.35, 0.6],
          ],
          color: "rgba(212, 175, 55, 0.05)",
          stroke: "rgba(212, 175, 55, 0.3)",
        },
        {
          points: [
            [0.35, 0.6],
            [0.75, 0.7],
            [0.6, 0.92],
            [0.2, 0.85],
          ],
          color: "rgba(255, 255, 255, 0.03)",
          stroke: "rgba(255, 255, 255, 0.15)",
        },
      ];

      glassPanels.forEach((panel) => {
        ctx.beginPath();
        panel.points.forEach(([px, py], i) => {
          const x = px * width;
          const y = py * height;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.closePath();

        ctx.fillStyle = panel.color;
        ctx.fill();

        ctx.strokeStyle = panel.stroke;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      // ── 6. Continuous Light Reflection Shimmer Sweep ────────────────────
      // Sweep moves from -50% width to 150% width in a 4-second loop
      const shimmerCycle = (elapsed % 4) / 4; // 0.0 to 1.0
      const shimmerX = (shimmerCycle * 2.2 - 0.6) * width;
      const shimmerWidth = width * 0.35;

      const shimmerGrad = ctx.createLinearGradient(
        shimmerX,
        0,
        shimmerX + shimmerWidth,
        height
      );
      shimmerGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
      shimmerGrad.addColorStop(0.4, "rgba(255, 255, 255, 0.05)");
      shimmerGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.22)");
      shimmerGrad.addColorStop(0.6, "rgba(212, 175, 55, 0.12)");
      shimmerGrad.addColorStop(1, "rgba(255, 255, 255, 0)");

      ctx.fillStyle = shimmerGrad;
      ctx.fillRect(0, 0, width, height);

      // ── 7. Architectural Blueprint Corner Accents & Markers ─────────────
      const accentSize = Math.max(12, Math.floor(width * 0.025));
      const margin = 16;
      ctx.strokeStyle = "#D4AF37";
      ctx.fillStyle = "#D4AF37";
      ctx.lineWidth = 2;

      // Top-Left Corner Accent
      ctx.beginPath();
      ctx.moveTo(margin, margin + accentSize);
      ctx.lineTo(margin, margin);
      ctx.lineTo(margin + accentSize, margin);
      ctx.stroke();

      // Top-Right Corner Accent
      ctx.beginPath();
      ctx.moveTo(width - margin - accentSize, margin);
      ctx.lineTo(width - margin, margin);
      ctx.lineTo(width - margin, margin + accentSize);
      ctx.stroke();

      // Bottom-Left Corner Accent
      ctx.beginPath();
      ctx.moveTo(margin, height - margin - accentSize);
      ctx.lineTo(margin, height - margin);
      ctx.lineTo(margin + accentSize, height - margin);
      ctx.stroke();

      // Bottom-Right Corner Box & Crosshair Blueprint Stamp
      ctx.beginPath();
      ctx.moveTo(width - margin - accentSize, height - margin);
      ctx.lineTo(width - margin, height - margin);
      ctx.lineTo(width - margin, height - margin - accentSize);
      ctx.stroke();

      ctx.fillRect(
        width - margin - accentSize + 3,
        height - margin - accentSize + 3,
        6,
        6
      );

      // Continue Animation
      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [showDetailedGrid]);

  const aspectClass =
    aspectRatio === "square"
      ? "aspect-square"
      : aspectRatio === "video"
      ? "aspect-video"
      : aspectRatio === "wide"
      ? "aspect-[21/9]"
      : aspectRatio === "tall"
      ? "aspect-[3/4]"
      : aspectRatio === "auto"
      ? "h-full w-full"
      : aspectRatio;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl bg-[#020617] group select-none",
        aspectClass,
        className
      )}
    >
      {/* HTML5 Canvas Background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover block"
      />

      {/* Optional Overlay Content (Icon, Title, Badge, Subtitle) */}
      {(title || subtitle || badge || icon) && (
        <div className="absolute inset-0 z-10 flex flex-col justify-between p-6 sm:p-8 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
          {/* Top Badge */}
          <div className="flex justify-between items-start">
            {badge ? (
              <span className="royal-badge-gold shadow-md uppercase tracking-wider">
                {badge}
              </span>
            ) : <div />}
            
            {icon && (
              <div className="w-10 h-10 rounded-xl bg-black/40 backdrop-blur-md border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg">
                {icon}
              </div>
            )}
          </div>

          {/* Bottom Title & Subtitle */}
          <div>
            {title && (
              <h3 
                className="text-xl sm:text-2xl font-extrabold !text-white tracking-tight leading-snug drop-shadow-lg"
                style={{ color: "#ffffff" }}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p 
                className="text-xs sm:text-sm !text-slate-200 mt-1 max-w-md line-clamp-2 drop-shadow-md font-medium"
                style={{ color: "rgba(255, 255, 255, 0.9)" }}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
