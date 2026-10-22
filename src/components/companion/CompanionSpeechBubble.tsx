"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { CompanionQuote } from "./companion-quotes";

interface CompanionSpeechBubbleProps {
  quote: CompanionQuote;
  onClick: () => void;
  onClose?: () => void;
}

export default function CompanionSpeechBubble({
  quote,
  onClick,
  onClose,
}: CompanionSpeechBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85, y: 6 }}
      transition={{ type: "spring", damping: 22, stiffness: 320 }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 cursor-pointer select-none group z-50 pointer-events-auto"
      style={{
        filter: "drop-shadow(0 14px 28px rgba(0,0,0,0.75))",
      }}
    >
      <motion.div
        whileHover={{ scale: 1.04, y: -2 }}
        whileTap={{ scale: 0.96 }}
        className="relative w-max max-w-[340px] px-3.5 py-2 rounded-2xl bg-[#0c0e17]/95 backdrop-blur-xl border border-white/15 shadow-[0_12px_32px_rgba(0,0,0,0.92),0_0_22px_rgba(246,96,45,0.28)] group-hover:border-[#fe743d]/60 group-hover:shadow-[0_14px_38px_rgba(0,0,0,0.95),0_0_28px_rgba(246,96,45,0.45)] transition-all duration-200 flex items-center gap-2 whitespace-nowrap"
      >
        {/* Top Gradient Highlight Rim */}
        <div className="absolute inset-x-3 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#ff9e6c] to-transparent opacity-80" />

        {/* Emoji */}
        <span className="text-sm select-none shrink-0">{quote.emoji}</span>

        {/* Short Text - Strictly Single Line */}
        <p className="text-xs font-medium text-white tracking-tight whitespace-nowrap leading-none">
          {quote.text}
        </p>

        {/* Action Badge */}
        {quote.actionHint && (
          <span className="inline-flex items-center gap-0.5 text-[10px] text-[#ff9e6c] font-semibold shrink-0 bg-white/[0.06] group-hover:bg-[#f6602d]/20 px-2 py-0.5 rounded-full border border-white/10 group-hover:border-[#fe743d]/40 transition-colors">
            <span>{quote.actionHint}</span>
            <ArrowRight className="w-2.5 h-2.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        )}

        {/* Downward Pointer Tail */}
        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#0c0e17] border-b border-r border-white/15 rotate-45 group-hover:border-[#fe743d]/60 transition-colors" />
      </motion.div>
    </motion.div>
  );
}
