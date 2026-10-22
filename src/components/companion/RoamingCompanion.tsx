"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import CompanionMascot, { CompanionAction } from "./CompanionMascot";
import CompanionSpeechBubble from "./CompanionSpeechBubble";
import { COMPANION_QUOTES, CompanionQuote } from "./companion-quotes";

interface RoamingCompanionProps {
  onOpenChat: () => void;
  isChatOpen?: boolean;
}

export default function RoamingCompanion({
  onOpenChat,
  isChatOpen = false,
}: RoamingCompanionProps) {
  // Dismissal state (stored in sessionStorage)
  const [isDismissed, setIsDismissed] = useState(true); // default true until client mounts
  const [isDismissing, setIsDismissing] = useState(false);

  // Position & movement state
  const [positionX, setPositionX] = useState<number>(140);
  const [positionY, setPositionY] = useState<number>(24);
  const [facing, setFacing] = useState<"left" | "right">("right");
  const [action, setAction] = useState<CompanionAction>("idle");
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Speech bubble state
  const [currentQuote, setCurrentQuote] = useState<CompanionQuote | null>(null);
  const quoteIndexRef = useRef(0);

  // Mouse tracking for reactive eyes
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const botRef = useRef<HTMLDivElement>(null);
  const [botRect, setBotRect] = useState<DOMRect | null>(null);

  // Scroll throttling refs
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loopTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const bubbleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Initial Mount: Check sessionStorage & responsive width
  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedDismissed = sessionStorage.getItem("zakaria_companion_dismissed");
    if (savedDismissed !== "true") {
      setIsDismissed(false);
    }

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // Initialize random safe position on desktop
      if (window.innerWidth >= 768) {
        const safeMin = 100;
        const safeMax = Math.max(300, window.innerWidth - 300);
        setPositionX(Math.floor(safeMin + Math.random() * (safeMax - safeMin)));
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    // Listen for re-summon event (if user wants to bring companion back from chat launcher)
    const handleSummon = () => {
      sessionStorage.removeItem("zakaria_companion_dismissed");
      setIsDismissed(false);
      setIsDismissing(false);
      setAction("hover");
      setTimeout(() => setAction("idle"), 1800);
    };

    window.addEventListener("summon-companion", handleSummon);

    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("summon-companion", handleSummon);
    };
  }, []);

  // 2. Listen to Scroll to Pause Movement (Zero GPU competition with ScrollyCanvas!)
  useEffect(() => {
    const handleScroll = () => {
      isScrollingRef.current = true;
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, 250);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  // 3. Mouse Movement Tracking for Reactive Visor Eyes
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      if (botRef.current) {
        setBotRect(botRef.current.getBoundingClientRect());
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // 4. Roaming Finite State Machine Loop (Runs only on Desktop when not hovering or chatting)
  useEffect(() => {
    if (isDismissed || isMobile || isChatOpen) return;

    const triggerNextAction = () => {
      // Don't move if hovering, scrolling, or tab hidden
      if (
        isHovered ||
        isScrollingRef.current ||
        typeof document !== "undefined" && document.hidden
      ) {
        loopTimeoutRef.current = setTimeout(triggerNextAction, 2000);
        return;
      }

      // Safe roam bounds on desktop (stay well away from bottom-right chat launcher!)
      const minX = 70;
      const maxX = Math.max(280, window.innerWidth - 240);

      // Random choice: Walk vs. Idle Antic
      const choice = Math.random();

      if (choice < 0.55) {
        // === ACTION A: WALK TO NEW DESTINATION ===
        // Pick new destination 120px to 320px away
        const delta = (Math.random() > 0.5 ? 1 : -1) * (140 + Math.random() * 180);
        let targetX = positionX + delta;

        // Clamp to safe bounds
        if (targetX < minX) targetX = minX + 60;
        if (targetX > maxX) targetX = maxX - 60;

        // Set direction facing
        setFacing(targetX > positionX ? "right" : "left");
        setAction("walk");

        // Travel time based on ~55px/s speed
        const distance = Math.abs(targetX - positionX);
        const walkDuration = Math.max(1.8, distance / 55);

        setPositionX(targetX);

        // After walk finishes:
        loopTimeoutRef.current = setTimeout(() => {
          setAction("idle");

          // 40% chance of popping a speech bubble after walking
          if (Math.random() < 0.45 && !currentQuote) {
            const nextQuote = COMPANION_QUOTES[quoteIndexRef.current % COMPANION_QUOTES.length];
            quoteIndexRef.current += 1;
            setCurrentQuote(nextQuote);

            if (bubbleTimeoutRef.current) clearTimeout(bubbleTimeoutRef.current);
            bubbleTimeoutRef.current = setTimeout(() => {
              setCurrentQuote(null);
            }, 4800);
          }

          // Idle pause before next decision (3 to 6 seconds)
          loopTimeoutRef.current = setTimeout(triggerNextAction, 3000 + Math.random() * 3000);
        }, walkDuration * 1000);
      } else {
        // === ACTION B: SILLY ANTIC IN PLACE ===
        const anticRoll = Math.random();
        let chosenAntic: CompanionAction = "hover";

        if (anticRoll < 0.35) {
          chosenAntic = "hover"; // Jetpack float + 360 spin
        } else if (anticRoll < 0.65) {
          chosenAntic = "wave"; // Arm waving
        } else if (anticRoll < 0.85) {
          chosenAntic = "heartPulse"; // Heart pulse from envelope
        } else {
          chosenAntic = "sleep"; // Quick snooze
        }

        setAction(chosenAntic);

        const anticDuration =
          chosenAntic === "hover"
            ? 2200
            : chosenAntic === "wave"
            ? 1800
            : chosenAntic === "heartPulse"
            ? 1600
            : 3200;

        loopTimeoutRef.current = setTimeout(() => {
          setAction("idle");

          // Speech bubble chance after antic
          if (Math.random() < 0.35 && !currentQuote) {
            const nextQuote = COMPANION_QUOTES[quoteIndexRef.current % COMPANION_QUOTES.length];
            quoteIndexRef.current += 1;
            setCurrentQuote(nextQuote);

            if (bubbleTimeoutRef.current) clearTimeout(bubbleTimeoutRef.current);
            bubbleTimeoutRef.current = setTimeout(() => {
              setCurrentQuote(null);
            }, 4800);
          }

          loopTimeoutRef.current = setTimeout(triggerNextAction, 2500 + Math.random() * 3000);
        }, anticDuration);
      }
    };

    // Start loop after 3s
    loopTimeoutRef.current = setTimeout(triggerNextAction, 3000);

    return () => {
      if (loopTimeoutRef.current) clearTimeout(loopTimeoutRef.current);
    };
  }, [positionX, isDismissed, isMobile, isChatOpen, isHovered, currentQuote]);

  // 5. Periodic Speech Bubble Trigger for Mobile (Docked Mode)
  useEffect(() => {
    if (isDismissed || !isMobile || isChatOpen) return;

    const mobileInterval = setInterval(() => {
      const nextQuote = COMPANION_QUOTES[quoteIndexRef.current % COMPANION_QUOTES.length];
      quoteIndexRef.current += 1;
      setCurrentQuote(nextQuote);

      setTimeout(() => setCurrentQuote(null), 4500);
    }, 18000);

    return () => clearInterval(mobileInterval);
  }, [isDismissed, isMobile, isChatOpen]);

  // 6. Handle User Dismissal
  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissing(true);
    setAction("wave");

    setTimeout(() => {
      sessionStorage.setItem("zakaria_companion_dismissed", "true");
      setIsDismissed(true);
      setIsDismissing(false);
      setCurrentQuote(null);
    }, 700);
  };

  // If dismissed, don't render DOM nodes
  if (isDismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      {!isDismissed && (
        <motion.div
          ref={botRef}
          initial={{ opacity: 0, scale: 0.4, y: 30 }}
          animate={
            isDismissing
              ? { opacity: 0, scale: 0, y: 20 }
              : isMobile
              ? {
                  opacity: isChatOpen ? 0 : 1,
                  scale: 0.9,
                  x: 0,
                  y: 0,
                  right: 24,
                  bottom: 92,
                }
              : {
                  opacity: isChatOpen ? 0.35 : 1,
                  scale: isChatOpen ? 0.8 : 1,
                  x: positionX,
                  bottom: positionY,
                }
          }
          exit={{ opacity: 0, scale: 0 }}
          transition={{
            x: {
              type: "tween",
              ease: "easeInOut",
              duration: action === "walk" ? Math.max(1.8, Math.abs(positionX) / 60) : 0.4,
            },
            opacity: { duration: 0.25 },
            scale: { duration: 0.3 },
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={onOpenChat}
          className={`fixed z-40 cursor-pointer pointer-events-auto select-none ${
            isMobile ? "right-6 bottom-24" : "left-0"
          }`}
          style={{ willChange: "transform" }}
          aria-label="Zakaria's AI Companion Robot"
        >
          {/* 1. SPEECH BUBBLE */}
          <AnimatePresence>
            {currentQuote && !isChatOpen && (
              <CompanionSpeechBubble
                quote={currentQuote}
                onClick={onOpenChat}
                onClose={() => setCurrentQuote(null)}
              />
            )}
          </AnimatePresence>

          {/* 2. CLOSE / DISMISS BUTTON '(x)' (Appears when hovering) */}
          <AnimatePresence>
            {isHovered && !isChatOpen && (
              <motion.button
                initial={{ opacity: 0, scale: 0.6, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.6, y: -4 }}
                transition={{ duration: 0.15 }}
                type="button"
                onClick={handleDismiss}
                className="absolute -top-3 -right-2 z-50 p-1 rounded-full bg-[#0c0e17]/95 hover:bg-rose-950/90 border border-white/20 hover:border-rose-500/60 text-zinc-400 hover:text-rose-400 shadow-lg transition-colors group/btn"
                title="Dismiss companion (leaves chat button in corner)"
                aria-label="Dismiss robot companion"
              >
                <X className="w-3 h-3 transition-transform group-hover/btn:rotate-90" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* 3. MASCOT CHARACTER */}
          <CompanionMascot
            action={action}
            facing={facing}
            isHovered={isHovered}
            mousePos={mousePos}
            botRect={botRect}
            size={isMobile ? 66 : 74}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
