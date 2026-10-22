"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { X } from "lucide-react";
import CompanionMascot, { CompanionAction } from "./CompanionMascot";
import CompanionSpeechBubble from "./CompanionSpeechBubble";
import { COMPANION_QUOTES, CompanionQuote } from "./companion-quotes";

interface RoamingCompanionProps {
  onOpenChat: () => void;
  isChatOpen?: boolean;
  onDismissStateChange?: (dismissed: boolean) => void;
}

export default function RoamingCompanion({
  onOpenChat,
  isChatOpen = false,
  onDismissStateChange,
}: RoamingCompanionProps) {
  // Dismissal state
  const [isDismissed, setIsDismissed] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);

  // 2D Screen Position (pixels from top-left viewport)
  const [positionX, setPositionX] = useState<number>(180);
  const [positionY, setPositionY] = useState<number>(680);
  const [facing, setFacing] = useState<"left" | "right">("right");
  const [action, setAction] = useState<CompanionAction>("idle");
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
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

  // 1. Initial Mount: Check sessionStorage & setup responsive coordinates
  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedDismissed = sessionStorage.getItem("zakaria_companion_dismissed");
    const dismissed = savedDismissed === "true";
    setIsDismissed(dismissed);
    if (onDismissStateChange) {
      onDismissStateChange(dismissed);
    }

    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      if (mobile) {
        setPositionX(window.innerWidth - 96);
        setPositionY(window.innerHeight - 170);
      } else {
        // Safe spawn area on desktop
        const spawnX = Math.floor(120 + Math.random() * (window.innerWidth - 320));
        const spawnY = Math.floor(window.innerHeight - 160);
        setPositionX(spawnX);
        setPositionY(spawnY);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    // Listen for re-summon event (from floating chat launcher or dialog)
    const handleSummon = () => {
      sessionStorage.removeItem("zakaria_companion_dismissed");
      setIsDismissed(false);
      setIsDismissing(false);
      if (onDismissStateChange) {
        onDismissStateChange(false);
      }
      setAction("hover");
      setTimeout(() => setAction("idle"), 1600);
    };

    window.addEventListener("summon-companion", handleSummon);

    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("summon-companion", handleSummon);
    };
  }, [onDismissStateChange]);

  // 2. Listen to Scroll: Pause movement during scroll (Zero GPU competition with ScrollyCanvas)
  useEffect(() => {
    const handleScroll = () => {
      isScrollingRef.current = true;
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, 200);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  // 3. Mouse Movement Tracking for Living Digital Visor Eyes
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

  // 4. Autonomous 2D Roaming Finite State Machine (Moves all around the screen!)
  useEffect(() => {
    if (isDismissed || isMobile || isChatOpen || isDragging) return;

    const triggerNextAction = () => {
      // Don't roam if user is dragging, hovering, scrolling, or tab hidden
      if (
        isHovered ||
        isDragging ||
        isScrollingRef.current ||
        (typeof document !== "undefined" && document.hidden)
      ) {
        loopTimeoutRef.current = setTimeout(triggerNextAction, 2000);
        return;
      }

      // Safe viewport boundary margins
      const minX = 60;
      const maxX = Math.max(260, window.innerWidth - 120);
      const minY = 90; // below top navbar
      const maxY = Math.max(200, window.innerHeight - 130);

      const roll = Math.random();

      if (roll < 0.4) {
        // === MODE A: HORIZONTAL STROLL / WADDLE ===
        const deltaX = (Math.random() > 0.5 ? 1 : -1) * (120 + Math.random() * 160);
        let targetX = positionX + deltaX;

        if (targetX < minX) targetX = minX + 50;
        if (targetX > maxX) targetX = maxX - 50;

        setFacing(targetX > positionX ? "right" : "left");
        setAction("walk");

        const distance = Math.abs(targetX - positionX);
        const duration = Math.max(1.6, distance / 55);

        setPositionX(targetX);

        loopTimeoutRef.current = setTimeout(() => {
          setAction("idle");

          // 40% chance of popping a speech bubble
          if (Math.random() < 0.45 && !currentQuote) {
            popSpeechBubble();
          }

          loopTimeoutRef.current = setTimeout(triggerNextAction, 3000 + Math.random() * 2500);
        }, duration * 1000);
      } else if (roll < 0.72) {
        // === MODE B: JETPACK 2D HOVER / FLY (Anywhere across screen!) ===
        const targetX = minX + Math.random() * (maxX - minX);
        const targetY = minY + Math.random() * (maxY - minY);

        setFacing(targetX > positionX ? "right" : "left");
        setAction("hover");

        const distance = Math.hypot(targetX - positionX, targetY - positionY);
        const duration = Math.max(2.0, distance / 90);

        setPositionX(targetX);
        setPositionY(targetY);

        loopTimeoutRef.current = setTimeout(() => {
          setAction("idle");

          if (Math.random() < 0.5 && !currentQuote) {
            popSpeechBubble();
          }

          loopTimeoutRef.current = setTimeout(triggerNextAction, 3200 + Math.random() * 2500);
        }, duration * 1000);
      } else {
        // === MODE C: CHARMING SILLY ANTIC IN PLACE ===
        const anticRoll = Math.random();
        let chosenAntic: CompanionAction = "wave";

        if (anticRoll < 0.45) {
          chosenAntic = "wave"; // Realistic friendly wave
        } else if (anticRoll < 0.75) {
          chosenAntic = "heartPulse"; // Heart pulse from love letter
        } else {
          chosenAntic = "sleep"; // Quick nap with zZ
        }

        setAction(chosenAntic);

        const anticDuration =
          chosenAntic === "wave"
            ? 2200
            : chosenAntic === "heartPulse"
            ? 1600
            : 3200;

        loopTimeoutRef.current = setTimeout(() => {
          setAction("idle");

          if (Math.random() < 0.4 && !currentQuote) {
            popSpeechBubble();
          }

          loopTimeoutRef.current = setTimeout(triggerNextAction, 2500 + Math.random() * 2500);
        }, anticDuration);
      }
    };

    const popSpeechBubble = () => {
      const nextQuote = COMPANION_QUOTES[quoteIndexRef.current % COMPANION_QUOTES.length];
      quoteIndexRef.current += 1;
      setCurrentQuote(nextQuote);

      if (bubbleTimeoutRef.current) clearTimeout(bubbleTimeoutRef.current);
      bubbleTimeoutRef.current = setTimeout(() => {
        setCurrentQuote(null);
      }, 4800);
    };

    loopTimeoutRef.current = setTimeout(triggerNextAction, 2800);

    return () => {
      if (loopTimeoutRef.current) clearTimeout(loopTimeoutRef.current);
    };
  }, [positionX, positionY, isDismissed, isMobile, isChatOpen, isHovered, isDragging, currentQuote]);

  // 5. Periodic Speech Bubble Timer (Runs consistently across entire session)
  useEffect(() => {
    if (isDismissed || isChatOpen) return;

    const bubbleInterval = setInterval(() => {
      if (!isDragging && !currentQuote) {
        const nextQuote = COMPANION_QUOTES[quoteIndexRef.current % COMPANION_QUOTES.length];
        quoteIndexRef.current += 1;
        setCurrentQuote(nextQuote);

        if (bubbleTimeoutRef.current) clearTimeout(bubbleTimeoutRef.current);
        bubbleTimeoutRef.current = setTimeout(() => {
          setCurrentQuote(null);
        }, 4800);
      }
    }, 14000);

    return () => clearInterval(bubbleInterval);
  }, [isDismissed, isChatOpen, isDragging, currentQuote]);

  // 6. Drag & Drop Handlers (Grabbable with mouse or touch!)
  const handleDragStart = () => {
    setIsDragging(true);
    setCurrentQuote(null);
    setAction("drag");
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);

    // If movement was negligible (< 6px), treat as a click to open chat
    const movedDistance = Math.hypot(info.offset.x, info.offset.y);
    if (movedDistance < 6) {
      onOpenChat();
      return;
    }

    // Otherwise, it was a drag! Place Zaki at the new dropped coordinate
    const safeX = Math.max(50, Math.min(window.innerWidth - 110, positionX + info.offset.x));
    const safeY = Math.max(80, Math.min(window.innerHeight - 130, positionY + info.offset.y));

    setPositionX(safeX);
    setPositionY(safeY);
    setAction("hover");

    // Land softly and resume idle state
    setTimeout(() => {
      setAction("idle");
    }, 800);
  };

  // 7. Handle User Dismissal ('(x)' click)
  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissing(true);
    setAction("wave");

    setTimeout(() => {
      sessionStorage.setItem("zakaria_companion_dismissed", "true");
      setIsDismissed(true);
      setIsDismissing(false);
      setCurrentQuote(null);
      if (onDismissStateChange) {
        onDismissStateChange(true);
      }
    }, 600);
  };

  // If dismissed or chat is currently open, hide completely
  if (isDismissed || isChatOpen) {
    return null;
  }

  // Determine if speech bubble should flip below when close to top navbar
  const bubbleFlipped = positionY < 130;

  return (
    <AnimatePresence>
      {!isDismissed && !isChatOpen && (
        <motion.div
          ref={botRef}
          drag
          dragMomentum={false}
          dragElastic={0.08}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          initial={{ opacity: 0, scale: 0.3, x: positionX, y: positionY }}
          animate={
            isDismissing
              ? { opacity: 0, scale: 0 }
              : {
                  opacity: 1,
                  scale: isDragging ? 1.08 : 1,
                  x: positionX,
                  y: positionY,
                }
          }
          exit={{ opacity: 0, scale: 0 }}
          transition={{
            x: {
              type: "tween",
              ease: "easeInOut",
              duration: action === "walk" ? 1.8 : action === "hover" ? 2.2 : 0.3,
            },
            y: {
              type: "tween",
              ease: "easeInOut",
              duration: action === "hover" ? 2.2 : 0.3,
            },
            opacity: { duration: 0.2 },
            scale: { duration: 0.25 },
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`fixed top-0 left-0 z-40 select-none ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
          style={{ willChange: "transform" }}
          aria-label="Zaki - Zakaria's AI Companion Robot"
        >
          {/* 1. SINGLE-LINE SPEECH BUBBLE */}
          <AnimatePresence>
            {currentQuote && !isDragging && (
              <div className={bubbleFlipped ? "absolute top-full mt-2 left-1/2 -translate-x-1/2" : ""}>
                <CompanionSpeechBubble
                  quote={currentQuote}
                  onClick={onOpenChat}
                  onClose={() => setCurrentQuote(null)}
                />
              </div>
            )}
          </AnimatePresence>

          {/* 2. CLOSE / DISMISS BUTTON '(x)' (Revealed on hover) */}
          <AnimatePresence>
            {isHovered && !isDragging && (
              <motion.button
                initial={{ opacity: 0, scale: 0.6, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.6, y: -4 }}
                transition={{ duration: 0.15 }}
                type="button"
                onClick={handleDismiss}
                className="absolute -top-3 -right-2 z-50 p-1 rounded-full bg-[#0c0e17]/95 hover:bg-rose-950/90 border border-white/20 hover:border-rose-500/60 text-zinc-400 hover:text-rose-400 shadow-xl transition-colors group/btn pointer-events-auto"
                title="Dismiss Zaki (chat button will appear in bottom-right corner)"
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
            size={isMobile ? 64 : 74}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
