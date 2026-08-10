"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X } from "lucide-react";

interface Props {
  locale: string;
}

export function DevNoticeModal({ locale }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const isRtl = locale === "ar";

  useEffect(() => {
    // Check local storage to see if notice has already been dismissed
    const hasSeen = localStorage.getItem("hasSeenDevNotice");
    if (!hasSeen) {
      // Small delay to make it pop up elegantly after load
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("hasSeenDevNotice", "true");
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/75 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl bg-[#0d1527] border border-amber-500/30 p-6 sm:p-8 shadow-2xl text-center select-none"
          >
            {/* Top Glow Ornament */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-500/70 to-transparent" />

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 end-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Gold Icon */}
            <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6">
              <Sparkles className="w-7 h-7 text-amber-400 animate-pulse" />
            </div>

            {/* Title */}
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 leading-tight">
              {isRtl ? "الموقع قيد التطوير والتهيئة" : "Platform Under Development"}
            </h3>

            {/* Divider */}
            <div className="flex items-center justify-center gap-2 mb-5">
              <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-amber-500/50" />
              <div className="w-1.5 h-1.5 bg-amber-500 rotate-45 shrink-0" />
              <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-amber-500/50" />
            </div>

            {/* Message Body */}
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-8">
              {isRtl ? (
                <>
                  عملينا العزيز، نحن حالياً نقوم بتهيئة وتحديث الموقع الإلكتروني الخاص بـ
                  <span className="text-amber-400 font-bold block mt-1.5">
                    مؤسسة القوة العاشرة للزجاج والألمنيوم والمقاولات
                  </span>
                  لنقدم لك تجربة رقمية استثنائية تليق بتطلعاتك وبأعلى معايير الجودة والاحترافية المعمارية. نشكر لك تفهمك ودعمك المستمر.
                </>
              ) : (
                <>
                  Dear customer, we are currently styling and updating the official platform of
                  <span className="text-amber-400 font-bold block mt-1.5">
                    Tenth Power Glass & Aluminum Contracting
                  </span>
                  to deliver an outstanding digital experience that matches your expectations and architectural standards. Thank you for your support.
                </>
              )}
            </p>

            {/* Continue Button */}
            <button
              onClick={handleClose}
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold text-sm sm:text-base shadow-lg shadow-amber-500/10 hover:scale-[1.02] active:scale-95 transition-all duration-300 cursor-pointer"
            >
              {isRtl ? "متابعة تصفح الموقع" : "Continue to Website"}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
