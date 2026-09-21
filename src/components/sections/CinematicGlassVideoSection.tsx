"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { HardHat } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";

interface Props {
  locale: Locale;
  videoUrl?: string;
}

/**
 * Cinematic Glass Installation Video Showcase
 * Renders an HTML5 video loop of workers installing structural glass facades.
 * Falls back seamlessly to an animated architectural canvas camera motion if video is loading or missing.
 */
export function CinematicGlassVideoSection({ locale, videoUrl = "/videos/defaults/glass-installation-cinematic.mp4" }: Props) {
  const isRtl = locale === "ar";
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasVideoError, setHasVideoError] = useState(false);

  // Canvas Cinematic Animation Fallback (Crane & Glass Facade Camera Motion)
  useEffect(() => {
    if (!hasVideoError && videoUrl) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrameId: number;
    let time = 0;

    const resizeCanvas = () => {
      if (!canvas) return;
      canvas.width = canvas.parentElement?.clientWidth || 1200;
      canvas.height = canvas.parentElement?.clientHeight || 600;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const render = () => {
      time += 0.008;
      const w = canvas.width;
      const h = canvas.height;

      // Dark Sky Gradient
      const bgGradient = ctx.createLinearGradient(0, 0, w, h);
      bgGradient.addColorStop(0, "#080e1e");
      bgGradient.addColorStop(0.5, "#0b172e");
      bgGradient.addColorStop(1, "#030712");
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, w, h);

      // Camera Pan Motion effect
      const camX = Math.sin(time * 0.5) * 40;
      const camY = Math.cos(time * 0.3) * 20;

      ctx.save();
      ctx.translate(camX, camY);

      // Glass Tower Facade Grid
      const cols = 8;
      const rows = 5;
      const panelW = w / (cols - 1);
      const panelH = h / (rows - 1);

      ctx.lineWidth = 1.5;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * panelW;
          const y = r * panelH;

          // Glass Panel Gradient
          const glassGlow = ctx.createLinearGradient(x, y, x + panelW, y + panelH);
          const phase = Math.sin(time + c * 0.4 + r * 0.3);
          if (phase > 0.4) {
            glassGlow.addColorStop(0, "rgba(212, 175, 55, 0.25)");
            glassGlow.addColorStop(0.5, "rgba(59, 130, 246, 0.2)");
            glassGlow.addColorStop(1, "rgba(10, 29, 55, 0.6)");
          } else {
            glassGlow.addColorStop(0, "rgba(59, 130, 246, 0.15)");
            glassGlow.addColorStop(1, "rgba(2, 6, 23, 0.8)");
          }

          ctx.fillStyle = glassGlow;
          ctx.beginPath();
          ctx.roundRect(x + 10, y + 10, panelW - 20, panelH - 20, 8);
          ctx.fill();

          // Reflective Beam Motion
          ctx.strokeStyle = "rgba(212, 175, 55, 0.4)";
          ctx.stroke();
        }
      }

      // Suction Crane Line Lifting Glass Panel
      const craneX = w * 0.5 + Math.sin(time * 0.8) * 60;
      const craneY = h * 0.35 + Math.cos(time * 0.8) * 25;

      // Crane Line
      ctx.beginPath();
      ctx.moveTo(craneX, -50);
      ctx.lineTo(craneX, craneY);
      ctx.strokeStyle = "rgba(245, 158, 11, 0.8)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Suction Lifter Frame
      ctx.fillStyle = "rgba(245, 158, 11, 0.9)";
      ctx.fillRect(craneX - 35, craneY - 8, 70, 16);

      // Lifted Glass Panel
      const glassReflect = ctx.createLinearGradient(craneX - 90, craneY, craneX + 90, craneY + 120);
      glassReflect.addColorStop(0, "rgba(59, 130, 246, 0.7)");
      glassReflect.addColorStop(0.5, "rgba(255, 255, 255, 0.9)");
      glassReflect.addColorStop(1, "rgba(212, 175, 55, 0.6)");

      ctx.fillStyle = glassReflect;
      ctx.beginPath();
      ctx.roundRect(craneX - 90, craneY + 10, 180, 110, 12);
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Technical Engineering Nodes (Structural Attachment Points)
      ctx.fillStyle = "rgba(245, 158, 11, 0.9)";
      ctx.beginPath();
      ctx.arc(craneX - 90, craneY + 10, 5, 0, Math.PI * 2);
      ctx.arc(craneX + 90, craneY + 10, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      animFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animFrameId);
    };
  }, [hasVideoError, videoUrl]);

  return (
    <section className="relative py-8 sm:py-20 bg-slate-50 dark:bg-[#040814] text-slate-900 dark:text-white overflow-hidden border-y border-slate-200/80 dark:border-white/5 transition-colors duration-300">
      {/* Subtle Ambient Backlight */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[38rem] h-[20rem] bg-gradient-to-r from-amber-500/10 via-blue-600/5 to-amber-400/5 rounded-full blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(212,175,55,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.2) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/80 via-transparent to-slate-50 dark:from-[#040814]/80 dark:via-transparent dark:to-[#040814] transition-colors duration-300" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 dark:bg-white/5 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs sm:text-sm font-semibold shadow-xs backdrop-blur-xl"
          >
            <HardHat className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="text-xs sm:text-sm font-semibold">
              {isRtl ? "التنفيذ الهندسي الميداني" : "On-Site Engineering Execution"}
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-snug sm:leading-tight"
          >
            {isRtl ? (
              <>
                دقة التنفيذ والتركيب الميداني{" "}
                <span className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 dark:from-amber-400 dark:via-yellow-300 dark:to-amber-200 bg-clip-text text-transparent">
                  للواجهات المعمارية
                </span>
              </>
            ) : (
              <>
                Precision Field Installation &{" "}
                <span className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 dark:from-amber-400 dark:via-yellow-300 dark:to-amber-200 bg-clip-text text-transparent">
                  Structural Assembly
                </span>
              </>
            )}
          </motion.h2>

        </div>

        {/* Video Screen Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative rounded-3xl overflow-hidden border border-slate-200/90 dark:border-white/20 shadow-2xl bg-black aspect-video max-w-5xl mx-auto group ring-1 ring-slate-900/5 dark:ring-white/10"
        >
          {/* Real Video or Canvas Fallback */}
          {!hasVideoError && videoUrl ? (
            <video
              ref={videoRef}
              src={videoUrl}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              onError={() => setHasVideoError(true)}
              className="w-full h-full object-cover"
            />
          ) : null}

          {(hasVideoError || !videoUrl) && (
            <canvas ref={canvasRef} className="w-full h-full object-cover block" />
          )}

          {/* Vignette Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />



        </motion.div>
      </div>
    </section>
  );
}
