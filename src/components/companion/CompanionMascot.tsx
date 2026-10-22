"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";

export type CompanionAction =
  | "idle"
  | "walk"
  | "hover"
  | "wave"
  | "sleep"
  | "heartPulse"
  | "dizzy"
  | "drag";

interface CompanionMascotProps {
  action?: CompanionAction;
  facing?: "left" | "right";
  isHovered?: boolean;
  mousePos?: { x: number; y: number } | null;
  botRect?: DOMRect | null;
  size?: number; // width in px, height scales proportionally
}

export default function CompanionMascot({
  action = "idle",
  facing = "right",
  isHovered = false,
  mousePos = null,
  botRect = null,
  size = 76,
}: CompanionMascotProps) {
  // Eye blink state
  const [isBlinking, setIsBlinking] = useState(false);

  // Periodic eye blink
  useEffect(() => {
    const interval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 180);
    }, 4200);
    return () => clearInterval(interval);
  }, []);

  // Calculate eye pupil offset based on mouse position
  let eyeOffsetX = 0;
  let eyeOffsetY = 0;

  if (mousePos && botRect) {
    const botCenterX = botRect.left + botRect.width / 2;
    const botCenterY = botRect.top + botRect.height / 2;
    const dx = mousePos.x - botCenterX;
    const dy = mousePos.y - botCenterY;
    const distance = Math.hypot(dx, dy);

    if (distance > 10 && distance < 600) {
      eyeOffsetX = Math.max(-2.5, Math.min(2.5, (dx / distance) * 2.5));
      eyeOffsetY = Math.max(-1.8, Math.min(1.8, (dy / distance) * 1.8));
      // Adjust for facing direction
      if (facing === "left") {
        eyeOffsetX = -eyeOffsetX;
      }
    }
  }

  // Animation variants for the whole character container
  const containerVariants: Variants = {
    idle: {
      y: [0, -3.5, 0],
      rotate: [0, 1, 0, -1, 0],
      transition: {
        duration: 2.8,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
    walk: {
      y: [0, -4, 0, -4, 0],
      rotate: [-3, 3, -3],
      transition: {
        duration: 0.5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
    hover: {
      y: [-6, -18, -6],
      rotate: [0, 360],
      transition: {
        y: { duration: 1.8, repeat: Infinity, ease: "easeInOut" },
        rotate: { duration: 1.8, ease: "easeInOut" },
      },
    },
    drag: {
      y: [-8, -14, -8],
      rotate: [-4, 4, -4],
      scale: 1.05,
      transition: {
        duration: 0.5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
    wave: {
      y: [0, -3.5, 0],
      rotate: [0, 4, 0],
      transition: {
        duration: 0.8,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
    sleep: {
      y: [2, 4, 2],
      rotate: [2, 0, 2],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
    heartPulse: {
      y: [0, -5, 0],
      scale: [1, 1.06, 1],
      transition: {
        duration: 0.8,
        repeat: 2,
        ease: "easeInOut",
      },
    },
    dizzy: {
      y: [0, -2, 0],
      rotate: [-7, 7, -7],
      transition: {
        duration: 0.2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  // Shadow scale variant corresponding to body elevation
  const shadowScale =
    action === "hover" || action === "drag" ? 0.5 : action === "walk" ? 0.88 : 1;
  const shadowOpacity = action === "hover" || action === "drag" ? 0.25 : 0.7;

  return (
    <div
      className="relative flex flex-col items-center select-none"
      style={{ width: size }}
    >
      {/* 1. SNOOZE ZZZ PARTICLES (When in sleep mode) */}
      <AnimatePresence>
        {action === "sleep" && (
          <motion.div
            initial={{ opacity: 0, y: 0, scale: 0.6 }}
            animate={{
              opacity: [0, 1, 0],
              y: -24,
              x: [0, 8, 14],
              scale: [0.6, 1, 0.8],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
            className="absolute -top-3 right-0 font-bold text-[#22d3ee] text-xs pointer-events-none drop-shadow-[0_0_6px_rgba(34,211,238,0.8)]"
          >
            zZ
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. FLOATING HEART PARTICLES (When tapping heart) */}
      <AnimatePresence>
        {action === "heartPulse" && (
          <motion.div
            initial={{ opacity: 0, y: 0, scale: 0.5 }}
            animate={{ opacity: [0, 1, 0], y: -28, scale: [0.5, 1.2, 0.9] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 text-rose-500 text-sm pointer-events-none drop-shadow-[0_0_8px_rgba(244,63,94,0.9)]"
          >
            ❤️
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2.5 FLOATING DIZZY STARS */}
      <AnimatePresence>
        {action === "dizzy" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: [0.6, 1, 0.6],
              rotate: [0, 360],
              scale: [0.9, 1.15, 0.9],
            }}
            exit={{ opacity: 0 }}
            transition={{
              rotate: { duration: 1.4, repeat: Infinity, ease: "linear" },
              opacity: { duration: 0.8, repeat: Infinity, ease: "easeInOut" },
              scale: { duration: 0.8, repeat: Infinity, ease: "easeInOut" },
            }}
            className="absolute -top-3 inset-x-0 flex justify-center items-center pointer-events-none z-20"
          >
            <span className="text-amber-300 text-xs drop-shadow-[0_0_6px_rgba(252,211,77,0.9)]">
              💫
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. MAIN CHARACTER BODY */}
      <motion.div
        variants={containerVariants}
        animate={action}
        style={{
          transformOrigin: "bottom center",
          scaleX: facing === "left" ? -1 : 1,
        }}
        className="relative z-10 w-full"
      >
        <svg
          viewBox="0 0 110 135"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto drop-shadow-[0_10px_20px_rgba(0,0,0,0.45)]"
        >
          <defs>
            {/* White Gloss Helmet Gradient */}
            <radialGradient
              id="helmetGrad"
              cx="45%"
              cy="35%"
              r="60%"
              fx="40%"
              fy="30%"
            >
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="55%" stopColor="#f3f4f8" />
              <stop offset="85%" stopColor="#d5d8e2" />
              <stop offset="100%" stopColor="#a9afbf" />
            </radialGradient>

            {/* Helmet Specular Highlight */}
            <linearGradient id="specularGlint" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>

            {/* Brand Orange Earcups Gradient */}
            <linearGradient id="brandEarGrad" x1="0.2" y1="0" x2="0.8" y2="1">
              <stop offset="0%" stopColor="#ff9a6c" />
              <stop offset="45%" stopColor="#f6602d" />
              <stop offset="100%" stopColor="#9e2603" />
            </linearGradient>

            {/* Brand Orange Collar Gradient */}
            <linearGradient id="brandCollarGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ff8552" />
              <stop offset="50%" stopColor="#f6602d" />
              <stop offset="100%" stopColor="#871e02" />
            </linearGradient>

            {/* Dark Curved Visor Gradient */}
            <radialGradient
              id="visorGrad"
              cx="50%"
              cy="40%"
              r="65%"
              fx="50%"
              fy="30%"
            >
              <stop offset="0%" stopColor="#1e2738" />
              <stop offset="65%" stopColor="#0b101c" />
              <stop offset="100%" stopColor="#05070d" />
            </radialGradient>

            {/* Cyan Digital Glow Filter */}
            <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow
                dx="0"
                dy="0"
                stdDeviation="1.8"
                floodColor="#00f2fe"
                floodOpacity="0.95"
              />
            </filter>

            {/* Body Pear Shape Gradient */}
            <radialGradient
              id="bodyGrad"
              cx="45%"
              cy="35%"
              r="65%"
              fx="40%"
              fy="30%"
            >
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="60%" stopColor="#eef1f6" />
              <stop offset="90%" stopColor="#cbd0dc" />
              <stop offset="100%" stopColor="#a2a9b9" />
            </radialGradient>

            {/* Heart Gradient */}
            <linearGradient id="heartGrad" x1="0.2" y1="0" x2="0.8" y2="1">
              <stop offset="0%" stopColor="#ff4255" />
              <stop offset="50%" stopColor="#e8112d" />
              <stop offset="100%" stopColor="#960517" />
            </linearGradient>
          </defs>

          {/* === 1. BRAND ORANGE AUDIO EARCUPS (Behind helmet) === */}
          {/* Left Earcup */}
          <rect
            x="14"
            y="35"
            width="12"
            height="24"
            rx="6"
            fill="url(#brandEarGrad)"
          />
          <rect
            x="16"
            y="37"
            width="4"
            height="18"
            rx="2"
            fill="#ffffff"
            fillOpacity="0.35"
          />

          {/* Right Earcup */}
          <rect
            x="84"
            y="35"
            width="12"
            height="24"
            rx="6"
            fill="url(#brandEarGrad)"
          />
          <rect
            x="86"
            y="37"
            width="4"
            height="18"
            rx="2"
            fill="#ffffff"
            fillOpacity="0.35"
          />

          {/* === 2. LEGS & STUBBY FEET === */}
          {/* Left Leg */}
          <motion.g
            animate={
              action === "walk"
                ? { y: [0, -3, 0], rotate: [-6, 6, -6] }
                : action === "drag"
                ? { y: [0, 2, 0], rotate: [-14, 10, -14] }
                : undefined
            }
            transition={{
              duration: action === "drag" ? 0.4 : 0.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{ originX: "42px", originY: "105px" }}
          >
            <rect
              x="36"
              y="104"
              width="14"
              height="20"
              rx="7"
              fill="url(#bodyGrad)"
            />
          </motion.g>

          {/* Right Leg */}
          <motion.g
            animate={
              action === "walk"
                ? { y: [-3, 0, -3], rotate: [6, -6, 6] }
                : action === "drag"
                ? { y: [2, 0, 2], rotate: [10, -14, 10] }
                : undefined
            }
            transition={{
              duration: action === "drag" ? 0.4 : 0.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{ originX: "68px", originY: "105px" }}
          >
            <rect
              x="60"
              y="104"
              width="14"
              height="20"
              rx="7"
              fill="url(#bodyGrad)"
            />
          </motion.g>

          {/* === 3. PEAR-SHAPED BODY === */}
          <ellipse
            cx="55"
            cy="90"
            rx="26"
            ry="24"
            fill="url(#bodyGrad)"
          />

          {/* === 4. WHITE LOVE-LETTER ENVELOPE === */}
          <g transform="translate(37, 74)">
            {/* Envelope Base */}
            <rect
              x="0"
              y="0"
              width="36"
              height="25"
              rx="3"
              fill="#ffffff"
              stroke="#e2e5eb"
              strokeWidth="1"
            />
            {/* Envelope Flap Fold Lines */}
            <path
              d="M 1 1 L 18 14 L 35 1"
              stroke="#d5d8e0"
              strokeWidth="1.2"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M 1 24 L 14 12"
              stroke="#e2e5eb"
              strokeWidth="1"
              fill="none"
            />
            <path
              d="M 35 24 L 22 12"
              stroke="#e2e5eb"
              strokeWidth="1"
              fill="none"
            />

            {/* 3D Red Heart Seal */}
            <motion.path
              animate={
                action === "heartPulse" || isHovered
                  ? { scale: [1, 1.25, 1] }
                  : { scale: [1, 1.08, 1] }
              }
              transition={{
                duration: action === "heartPulse" ? 0.4 : 1.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{ originX: "18px", originY: "13px" }}
              d="M 18 17 C 18 17, 11 12.5, 11 8.5 C 11 6.5, 12.5 5, 14.5 5 C 16 5, 17.2 6, 18 7 C 18.8 6, 20 5, 21.5 5 C 23.5 5, 25 6.5, 25 8.5 C 25 12.5, 18 17, 18 17 Z"
              fill="url(#heartGrad)"
              filter="drop-shadow(0 2px 4px rgba(229,38,29,0.5))"
            />
          </g>

          {/* === 5. CUTE CHUBBY ARMS === */}
          {/* Left Arm */}
          <path
            d="M 32 78 C 26 80, 24 90, 32 94 C 36 96, 39 91, 39 88 C 39 82, 36 78, 32 78 Z"
            fill="url(#bodyGrad)"
          />

          {/* Right Arm: Natural Fluid Wave when 'wave', Dangle when 'drag', Resting when default */}
          {action === "wave" ? (
            <motion.g
              animate={{ rotate: [-18, 26, -18] }}
              transition={{
                duration: 0.42,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{ originX: "78px", originY: "72px" }}
            >
              {/* Arm raised up alongside head */}
              <path
                d="M 76 72 C 82 66, 92 56, 95 44 C 97 38, 91 36, 86 40 C 82 44, 76 60, 76 72 Z"
                fill="url(#bodyGrad)"
              />
              {/* Cute waving palm */}
              <circle cx="91" cy="41" r="5" fill="url(#bodyGrad)" />
            </motion.g>
          ) : action === "drag" ? (
            <motion.path
              animate={{ rotate: [-18, -4, -18] }}
              transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
              style={{ originX: "78px", originY: "78px" }}
              d="M 78 78 C 86 82, 92 88, 86 96 C 82 98, 76 92, 74 88 C 74 82, 76 78, 78 78 Z"
              fill="url(#bodyGrad)"
            />
          ) : (
            <path
              d="M 78 78 C 84 80, 86 90, 78 94 C 74 96, 71 91, 71 88 C 71 82, 74 78, 78 78 Z"
              fill="url(#bodyGrad)"
            />
          )}

          {/* === 6. BRAND ORANGE COLLAR / NECK RING === */}
          <ellipse
            cx="55"
            cy="68"
            rx="18"
            ry="5.5"
            fill="url(#brandCollarGrad)"
          />

          {/* === 7. GLOSSY WHITE ASTRONAUT HELMET === */}
          <ellipse
            cx="55"
            cy="44"
            rx="34"
            ry="31"
            fill="url(#helmetGrad)"
          />

          {/* Helmet Top Specular Reflection Highlight */}
          <path
            d="M 32 24 C 40 18, 70 18, 78 24 C 68 21, 42 21, 32 24 Z"
            fill="url(#specularGlint)"
          />

          {/* === 8. DARK CURVED VISOR SCREEN === */}
          <rect
            x="29"
            y="25"
            width="52"
            height="36"
            rx="16"
            fill="url(#visorGrad)"
            stroke="#1b2434"
            strokeWidth="1.5"
          />

          {/* Visor Diagonal Glass Sheen Highlight Strip */}
          <path
            d="M 64 27 L 76 27 C 78 30, 78 33, 76 38 L 60 48 C 62 44, 62 40, 64 35 Z"
            fill="#ffffff"
            fillOpacity="0.08"
          />

          {/* === 9. DIGITAL NEON CYAN GLOWING FACE === */}
          <g
            filter="url(#cyanGlow)"
            transform={`translate(${eyeOffsetX}, ${eyeOffsetY})`}
          >
            {action === "dizzy" ? (
              <>
                {/* Spiral Left Eye */}
                <path
                  d="M 39 41 A 4 4 0 1 0 47 41 A 2.6 2.6 0 1 0 42 41 A 1.2 1.2 0 1 0 44.5 41"
                  stroke="#00f2fe"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* Spiral Right Eye */}
                <path
                  d="M 63 41 A 4 4 0 1 0 71 41 A 2.6 2.6 0 1 0 66 41 A 1.2 1.2 0 1 0 68.5 41"
                  stroke="#00f2fe"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* Wobbly Dizzy Mouth */}
                <path
                  d="M 49 48 Q 52 45, 55 48 T 61 48"
                  stroke="#00f2fe"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                />
              </>
            ) : (
              <>
                {/* Winking Left Eye */}
                <path
                  d="M 40 41 C 41.5 39, 45.5 39, 47 41"
                  stroke="#00f2fe"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  fill="none"
                />

                {/* Right Eye: Either blinking dash, happy squint (wave), or glowing pill */}
                {isBlinking || action === "sleep" ? (
                  <path
                    d="M 63 41 C 64.5 39, 68.5 39, 70 41"
                    stroke="#00f2fe"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    fill="none"
                  />
                ) : action === "wave" ? (
                  <path
                    d="M 63 41 C 64.5 38, 68.5 38, 70 41"
                    stroke="#00f2fe"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    fill="none"
                  />
                ) : (
                  <rect
                    x="63.5"
                    y="37.5"
                    width="6.5"
                    height="8.5"
                    rx="3.2"
                    fill="#00f2fe"
                  />
                )}

                {/* Cute Smile Mouth */}
                <path
                  d="M 51 47.5 C 53 50.5, 57 50.5, 59 47.5"
                  stroke="#00f2fe"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                />
              </>
            )}
          </g>
        </svg>

        {/* 10. JETPACK HOVER / DRAG SPARKS */}
        {(action === "hover" || action === "drag") && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-4 pointer-events-none">
            <span className="w-2.5 h-3.5 bg-gradient-to-t from-transparent via-[#00f2fe] to-white rounded-full blur-[1px] animate-pulse" />
            <span className="w-2.5 h-3.5 bg-gradient-to-t from-transparent via-[#00f2fe] to-white rounded-full blur-[1px] animate-pulse [animation-delay:100ms]" />
          </div>
        )}
      </motion.div>

      {/* 11. GROUND AMBIENT SHADOW (Squashes & stretches with movement) */}
      <motion.div
        animate={{
          scale: shadowScale,
          opacity: shadowOpacity,
        }}
        transition={{ duration: 0.3 }}
        className="w-12 h-2.5 rounded-full bg-black/60 blur-[3px] -mt-1 pointer-events-none"
      />
    </div>
  );
}
