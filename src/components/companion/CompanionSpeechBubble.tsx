"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { CompanionQuote } from "./companion-quotes";

interface CompanionSpeechBubbleProps {
  quote: CompanionQuote;
  onClick: () => void;
  onClose?: () => void;
  position?: "top" | "top-left" | "top-right";
}

export default function CompanionSpeechBubble({
  quote,
  onClick,
  onClose,
  position = "top",
}: CompanionSpeechBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85, y: 8 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 cursor-pointer select-none group z-30"
      style={{
        filter: "drop-shadow(0 14px 28px rgba(0,0,0,0.7))",
      }}
    >
      <motion.div
        whileHover={{ scale: 1.04, y: -2 }}
        whileTap={{ scale: 0.97 }}
        className="relative max-w-[230px] sm:max-w-[260px] px-3.5 py-2.5 rounded-2xl bg-[#0b0e17]/95 backdrop-blur-xl border border-white/15 shadow-[0_12px_30px_rgba(0,0,0,0.9),0_0_20px_rgba(246,96,45,0.22)] group-hover:border-[#fe743d]/60 group-hover:shadow-[0_14px_36px_rgba(0,0,0,0.95),0_0_26px_rgba(246,96,45,0.4)] transition-all duration-200"
      >
        {/* Top Gradient Highlight Rim */}
        <div className="absolute inset-x-3 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#ff9e6c] to-transparent opacity-80" />

        <div className="flex items-start gap-2">
          <span className="text-base select-none shrink-0 mt-0.5">
            {quote.emoji}
          </span>
          <div className="min-w-0">
            <p className="text-xs font-medium text-white leading-snug tracking-tight">
              {quote.text}
            </p>
            {quote.actionHint && (
              <span className="inline-flex items-center gap-1 text-[10px] text-[#ff9e6c] font-semibold mt-1 group-hover:underline underline-offset-2">
                <span>{quote.actionHint}</span>
                <ArrowRight className="w-2.5 h-2.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            )}
          </div>
        </div>

        {/* Tail pointing to the bot */}
        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#0b0e17] border-b border-r border-white/15 rotate-45 group-hover:border-[#fe743d]/60 transition-colors" />
      </motion.div>
    </motion.div>
  );
}
