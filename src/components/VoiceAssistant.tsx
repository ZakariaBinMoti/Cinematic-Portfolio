"use client";

import { useState, useEffect, useRef, useCallback, ReactNode } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  X,
  RotateCcw,
  ArrowUp,
  Headphones,
  MessageSquare,
  Copy,
  Check,
  Square,
  PhoneOff,
  ArrowUpRight,
  Send,
} from "lucide-react";
import RoamingCompanion from "./companion/RoamingCompanion";
import CompanionMascot from "./companion/CompanionMascot";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
}

// Helper to format inline markdown (bold, links, emails) into clean JSX
function renderFormattedInline(text: string): ReactNode[] {
  const tokenRegex =
    /(\[[^\]]+\]\([^\)]+\)|\*\*[^*]+\*\*|https?:\/\/[^\s<]+|www\.[^\s<]+|(?:[a-zA-Z0-9-]+\.)+(?:com|org|io|dev|app|net|me|co)(?:\/[^\s*<]*)?|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;

  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const token = match[0];

    // Case 1: Markdown link [Label](url)
    if (token.startsWith("[") && token.includes("](") && token.endsWith(")")) {
      const linkMatch = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
      if (linkMatch) {
        const [, label, url] = linkMatch;
        const href = url.startsWith("http") || url.startsWith("mailto:") ? url : `https://${url}`;
        parts.push(
          <a
            key={match.index}
            href={href}
            target={href.startsWith("mailto:") ? undefined : "_blank"}
            rel={href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
            className="font-medium text-[#fe743d] hover:underline underline-offset-2 break-all"
          >
            {label}
          </a>
        );
      } else {
        parts.push(token);
      }
    }
    // Case 2: Bold text **bold**
    else if (token.startsWith("**") && token.endsWith("**") && token.length > 4) {
      const inner = token.slice(2, -2);
      if (inner.includes("@") && /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(inner)) {
        parts.push(
          <a
            key={match.index}
            href={`mailto:${inner}`}
            className="font-semibold text-[#fe743d] hover:underline underline-offset-2 break-all"
          >
            {inner}
          </a>
        );
      } else if (
        inner.startsWith("http") ||
        /^(?:[a-zA-Z0-9-]+\.)+(?:com|org|io|dev|app|net|me|co)/.test(inner)
      ) {
        const href = inner.startsWith("http") ? inner : `https://${inner}`;
        parts.push(
          <a
            key={match.index}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 font-semibold text-[#fe743d] hover:underline underline-offset-2 break-all"
          >
            <span>{inner}</span>
            <ArrowUpRight className="w-3 h-3 inline shrink-0 opacity-80" />
          </a>
        );
      } else {
        parts.push(
          <strong key={match.index} className="font-semibold text-white">
            {inner}
          </strong>
        );
      }
    }
    // Case 3: Email address
    else if (token.includes("@") && /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(token)) {
      parts.push(
        <a
          key={match.index}
          href={`mailto:${token}`}
          className="font-medium text-[#fe743d] hover:underline underline-offset-2 break-all"
        >
          {token}
        </a>
      );
    }
    // Case 4: Standalone URL
    else if (
      token.startsWith("http") ||
      token.startsWith("www.") ||
      /^(?:[a-zA-Z0-9-]+\.)+(?:com|org|io|dev|app|net|me|co)/.test(token)
    ) {
      const href = token.startsWith("http") ? token : `https://${token}`;
      parts.push(
        <a
          key={match.index}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 font-medium text-[#fe743d] hover:underline underline-offset-2 break-all"
        >
          <span>{token}</span>
          <ArrowUpRight className="w-3 h-3 inline shrink-0 opacity-80" />
        </a>
      );
    } else {
      parts.push(token);
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts;
}

// Clean Formatted Message Component with Paragraphs, Bullets, and Overflow Protection
function FormattedMessage({ text }: { text: string }) {
  const lines = text.split("\n");

  return (
    <div className="space-y-2.5 break-words [overflow-wrap:anywhere] overflow-hidden text-zinc-200">
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={lineIdx} className="h-1" />;

        const isBullet = /^[*\-•]\s+/.test(trimmed);
        const contentText = isBullet ? trimmed.replace(/^[*\-•]\s+/, "") : line;

        return (
          <div
            key={lineIdx}
            className={isBullet ? "flex items-start gap-2 pl-0.5" : ""}
          >
            {isBullet && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#f6602d] mt-1.5 shrink-0" />
            )}
            <div className="text-xs sm:text-sm leading-relaxed flex-1 break-words [overflow-wrap:anywhere]">
              {renderFormattedInline(contentText)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Aesthetic Ultra-Premium AI Bot Emblem with micro-animations & faceted 3D jewel astroid star
function AestheticBotEmblem({
  size = 26,
  animated = true,
  idPrefix = "bot",
  className = "",
}: {
  size?: number;
  animated?: boolean;
  idPrefix?: string;
  className?: string;
}) {
  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      {/* 1. Ambient Breathing Radial Core Glow */}
      {animated ? (
        <motion.div
          animate={{
            scale: [0.92, 1.25, 0.92],
            opacity: [0.4, 0.85, 0.4],
          }}
          transition={{
            duration: 3.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-[-4px] rounded-full bg-[#fe743d] blur-[9px] pointer-events-none"
        />
      ) : (
        <div className="absolute inset-[-2px] rounded-full bg-[#fe743d]/30 blur-xs pointer-events-none" />
      )}

      {/* 2. Micro Prismatic Cross Flare (Subtle rotating optical glint) */}
      {animated && (
        <motion.div
          animate={{
            rotate: [0, 180, 360],
            opacity: [0.25, 0.55, 0.25],
          }}
          transition={{
            rotate: { duration: 18, repeat: Infinity, ease: "linear" },
            opacity: { duration: 3.6, repeat: Infinity, ease: "easeInOut" },
          }}
          className="absolute inset-[-6px] pointer-events-none"
        >
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#ffb088] to-transparent -translate-y-1/2" />
          <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-[#ffb088] to-transparent -translate-x-1/2" />
        </motion.div>
      )}

      {/* 3. The Custom Sculpted SVG Emblem */}
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 drop-shadow-[0_0_10px_rgba(254,116,61,0.7)]"
        animate={
          animated
            ? {
                scale: [1, 1.06, 1],
              }
            : undefined
        }
        transition={{
          duration: 3.2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <defs>
          {/* Main 4-point Astroid Diamond Gradient */}
          <linearGradient
            id={`${idPrefix}-nova`}
            x1="2"
            y1="2"
            x2="26"
            y2="26"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="28%" stopColor="#ffb088" />
            <stop offset="58%" stopColor="#fe743d" />
            <stop offset="100%" stopColor="#cb3607" />
          </linearGradient>

          {/* Facet Specular Highlight (North-East quadrant) */}
          <linearGradient
            id={`${idPrefix}-light`}
            x1="14"
            y1="2"
            x2="26"
            y2="14"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#ffa070" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#fe743d" stopOpacity="0.15" />
          </linearGradient>

          {/* Facet Architectural Shadow (South-West quadrant) */}
          <linearGradient
            id={`${idPrefix}-dark`}
            x1="2"
            y1="14"
            x2="14"
            y2="26"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#7a1803" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#220500" stopOpacity="0.85" />
          </linearGradient>

          {/* Satellite Spark Gradient */}
          <linearGradient id={`${idPrefix}-spark`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#fe743d" />
          </linearGradient>
        </defs>

        {/* Outer Astroid Star (Main AI Diamond Crest) */}
        {/* Center: (14, 14), Tips at (14, 2), (26, 14), (14, 26), (2, 14) */}
        <path
          d="M 14 2 C 14 8.8, 19.2 14, 26 14 C 19.2 14, 14 19.2, 14 26 C 14 19.2, 8.8 14, 2 14 C 8.8 14, 14 8.8, 14 2 Z"
          fill={`url(#${idPrefix}-nova)`}
        />

        {/* Specular Facet Overlay - Genuine 3D jewel depth */}
        <path
          d="M 14 2 C 14 8.8, 19.2 14, 26 14 L 14 14 Z"
          fill={`url(#${idPrefix}-light)`}
        />
        <path
          d="M 2 14 C 8.8 14, 14 19.2, 14 26 L 14 14 Z"
          fill={`url(#${idPrefix}-dark)`}
        />

        {/* Razor-sharp central axis seam */}
        <line
          x1="14"
          y1="2"
          x2="14"
          y2="26"
          stroke="white"
          strokeWidth="0.4"
          strokeOpacity="0.35"
        />
        <line
          x1="2"
          y1="14"
          x2="26"
          y2="14"
          stroke="white"
          strokeWidth="0.4"
          strokeOpacity="0.35"
        />

        {/* Luminous Central Core Jewel */}
        <circle cx="14" cy="14" r="1.6" fill="#ffffff" />
        <circle cx="14" cy="14" r="2.8" fill="#ffffff" fillOpacity="0.3" />

        {/* Secondary Satellite Sparkle (Top-Right, center 22.5, 5.5) */}
        <motion.path
          d="M 22.5 2.5 C 22.5 4, 23.8 5.5, 25.5 5.5 C 23.8 5.5, 22.5 7, 22.5 8.5 C 22.5 7, 21.2 5.5, 19.5 5.5 C 21.2 5.5, 22.5 4, 22.5 2.5 Z"
          fill={`url(#${idPrefix}-spark)`}
          animate={
            animated
              ? {
                  opacity: [0.55, 1, 0.55],
                }
              : undefined
          }
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Tertiary Micro-Spark (Bottom-Left, center 5.5, 22.5) */}
        <motion.path
          d="M 5.5 20.5 C 5.5 21.5, 6.5 22.5, 7.5 22.5 C 6.5 22.5, 5.5 23.5, 5.5 24.5 C 5.5 23.5, 4.5 22.5, 3.5 22.5 C 4.5 22.5, 5.5 21.5, 5.5 20.5 Z"
          fill="#ffb088"
          animate={
            animated
              ? {
                  opacity: [1, 0.4, 1],
                }
              : undefined
          }
          transition={{
            duration: 2.6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.4,
          }}
        />
      </motion.svg>
    </div>
  );
}

export default function VoiceAssistant() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  // Dialog & Mode state
  const [isOpen, setIsOpen] = useState(false);
  const [isLiveCall, setIsLiveCall] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [companionDismissed, setCompanionDismissed] = useState(false);

  // Chat & Voice state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Hi! I am Zaki, Zakaria's AI Companion. Ask or speak to me about his 250+ Shopify stores, technical architecture, or hiring availability.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [audioVolume, setAudioVolume] = useState(0);

  // DOM Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Web Audio & Speech Recognition Refs
  const recognitionRef = useRef<any>(null);
  const silenceWatchdogRef = useRef<NodeJS.Timeout | null>(null);
  const fastPathTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Mutable State Refs for robust Voice Activity Detection
  const isListeningRef = useRef(false);
  const isLiveCallRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const isLoadingRef = useRef(false);
  const accumulatedSpeechRef = useRef("");
  const lastRecognizedTextRef = useRef("");
  const lastSpeechTimeRef = useRef(0);
  const messagesRef = useRef(messages);
  const voiceEnabledRef = useRef(voiceEnabled);
  const isSubmittingSpeechRef = useRef(false);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    isLiveCallRef.current = isLiveCall;
  }, [isLiveCall]);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    voiceEnabledRef.current = voiceEnabled;
  }, [voiceEnabled]);

  // Persistent Input Focus Helper
  const focusInput = useCallback(() => {
    if (typeof window !== "undefined" && !isLiveCallRef.current) {
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, []);

  useEffect(() => {
    if (isOpen && !isLiveCall) {
      focusInput();
    }
  }, [isOpen, isLiveCall, focusInput]);

  // Pre-load and cache browser SpeechSynthesis voices immediately
  const [cachedVoices, setCachedVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const hasSpeechRec =
      "SpeechRecognition" in window || "webkitSpeechRecognition" in window;
    const hasSpeechSynth = "speechSynthesis" in window;
    setSpeechSupported(Boolean(hasSpeechRec && hasSpeechSynth));

    if (hasSpeechSynth) {
      const loadVoices = () => {
        const list = window.speechSynthesis.getVoices();
        if (list && list.length > 0) {
          setCachedVoices(list);
        }
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;

      return () => {
        if ("speechSynthesis" in window) {
          window.speechSynthesis.onvoiceschanged = null;
        }
      };
    }
  }, []);

  // Soft, crisp, natural female voice selector (prioritizing neural & natural conversational female voices)
  const getFemaleVoice = useCallback((): SpeechSynthesisVoice | null => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;

    const list = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
    if (!list || list.length === 0) return null;

    const englishVoices = list.filter((v) => v.lang.startsWith("en"));
    const pool = englishVoices.length > 0 ? englishVoices : list;

    // Strict male keyword list to prevent harsh or robotic male voices
    const maleKeywords = [
      "male", "david", "mark", "george", "daniel", "guy", "james",
      "richard", "stefan", "oliver", "rishi", "paul", "tom", "alex", "fred"
    ];

    const femalePool = pool.filter((v) => {
      const nameLower = v.name.toLowerCase();
      return !maleKeywords.some((maleKey) => nameLower.includes(maleKey));
    });

    // 1. Google UK English Female (Soft, crisp, natural conversational British female voice in Chrome)
    const googleUKFemale = femalePool.find(
      (v) => v.name.includes("Google") && v.name.includes("UK English Female")
    );
    if (googleUKFemale) return googleUKFemale;

    // 2. Google US English (Crisp, warm female voice in Chrome)
    const googleUS = femalePool.find((v) => v.name === "Google US English");
    if (googleUS) return googleUS;

    // 3. Microsoft Natural / Neural female voices (Edge / Windows: Aria, Jenny, Sonia, Natasha)
    const edgeNeuralFemale = femalePool.find(
      (v) =>
        (v.name.includes("Aria") || v.name.includes("Jenny") || v.name.includes("Sonia") || v.name.includes("Natasha")) &&
        v.name.includes("Natural")
    );
    if (edgeNeuralFemale) return edgeNeuralFemale;

    // 4. Apple Safari / macOS / iOS female voices (Samantha, Victoria, Karen, Moira, Tessa, Serena, Siri)
    const appleFemale = femalePool.find((v) =>
      ["samantha", "victoria", "karen", "moira", "tessa", "serena", "siri"].some((name) =>
        v.name.toLowerCase().includes(name)
      )
    );
    if (appleFemale) return appleFemale;

    // 5. Any voice explicitly tagged with 'Female' or 'Woman'
    const explicitFemale = femalePool.find((v) => {
      const n = v.name.toLowerCase();
      return n.includes("female") || n.includes("woman");
    });
    if (explicitFemale) return explicitFemale;

    // 6. Microsoft Zira (Clean, clear Windows desktop female voice)
    const zira = femalePool.find((v) => v.name.toLowerCase().includes("zira"));
    if (zira) return zira;

    // 7. Any non-male candidate
    if (femalePool.length > 0) return femalePool[0];

    return pool[0] || null;
  }, [cachedVoices]);

  // Text-to-Speech Engine with Fail-Safe Timeout Protection & Female Natural Tuning
  const speakText = useCallback(
    (text: string, messageId?: string, onDone?: () => void) => {
      if (
        !voiceEnabledRef.current ||
        typeof window === "undefined" ||
        !("speechSynthesis" in window)
      ) {
        if (onDone) onDone();
        return;
      }

      try {
        window.speechSynthesis.cancel();

        const cleanText = text
          .replace(/https?:\/\/[^\s]+/g, "")
          .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
          .replace(/[*#_~`•\-+]/g, "")
          .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, "")
          .replace(/[\u2600-\u27BF]/g, "")
          .replace(/\s+/g, " ")
          .replace(/\n+/g, ". ")
          .trim();

        if (!cleanText) {
          if (onDone) onDone();
          return;
        }

        const utterance = new SpeechSynthesisUtterance(cleanText);
        const selectedVoice = getFemaleVoice();

        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }

        // Soft, medium speed, crisp and clean cadence
        utterance.rate = 0.98; // Medium conversational pace (removes robotic rushed sound)
        utterance.pitch = 1.0; // Soft natural tone
        utterance.volume = 1.0;

        let hasFinished = false;
        let safetyTimer: NodeJS.Timeout | null = null;

        const finishHandler = () => {
          if (hasFinished) return;
          hasFinished = true;
          if (safetyTimer) clearTimeout(safetyTimer);
          setIsSpeaking(false);
          isSpeakingRef.current = false;
          setSpeakingMessageId(null);
          if (onDone) onDone();
        };

        utterance.onstart = () => {
          setIsSpeaking(true);
          isSpeakingRef.current = true;
          if (messageId) setSpeakingMessageId(messageId);
        };

        utterance.onend = finishHandler;
        utterance.onerror = finishHandler;

        // Safety watchdog: In case Chrome's speech synthesis onend never fires!
        const wordCount = cleanText.split(/\s+/).length;
        const estimatedMs = Math.max(3000, (wordCount / 2.5) * 1000 + 2000);
        safetyTimer = setTimeout(() => {
          if (isSpeakingRef.current && !hasFinished) {
            console.log("Speech synthesis safety fallback triggered");
            finishHandler();
          }
        }, estimatedMs);

        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn("TTS warning:", e);
        setIsSpeaking(false);
        isSpeakingRef.current = false;
        setSpeakingMessageId(null);
        if (onDone) onDone();
      }
    },
    [getFemaleVoice]
  );

  const stopSpeaking = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      setSpeakingMessageId(null);
    }
  }, []);

  // Web Audio Volume Tracker
  const startVolumeTracking = useCallback((stream: MediaStream) => {
    try {
      if (audioContextRef.current && audioContextRef.current.state === "suspended") {
        audioContextRef.current.resume();
      }

      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      if (!audioContextRef.current && AudioContextClass) {
        audioContextRef.current = new AudioContextClass();
      }

      const ctx = audioContextRef.current;
      if (!ctx) return;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.5;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkVolume = () => {
        if (!isListeningRef.current || !analyserRef.current) {
          setAudioVolume(0);
          return;
        }

        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        const normalized = Math.min(100, Math.round((average / 128) * 100));
        setAudioVolume(normalized);

        animFrameRef.current = requestAnimationFrame(checkVolume);
      };

      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = requestAnimationFrame(checkVolume);
    } catch (err) {
      console.warn("Audio volume error:", err);
    }
  }, []);

  const stopVolumeTracking = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setAudioVolume(0);
  }, []);

  const requestMicStream = useCallback(async (): Promise<MediaStream | null> => {
    try {
      if (mediaStreamRef.current && mediaStreamRef.current.active) {
        return mediaStreamRef.current;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;
      return stream;
    } catch (err) {
      console.warn("Microphone stream error:", err);
      return null;
    }
  }, []);

  // Stop Listening Session
  const stopListening = useCallback(() => {
    if (silenceWatchdogRef.current) {
      clearInterval(silenceWatchdogRef.current);
      silenceWatchdogRef.current = null;
    }
    if (fastPathTimerRef.current) {
      clearTimeout(fastPathTimerRef.current);
      fastPathTimerRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }

    stopVolumeTracking();
    setIsListening(false);
    isListeningRef.current = false;
    lastSpeechTimeRef.current = 0;
  }, [stopVolumeTracking]);

  // Main Send Handler
  const handleSendMessage = useCallback(
    async (textToSend?: string) => {
      const query = (textToSend || input || accumulatedSpeechRef.current).trim();
      if (!query || isLoadingRef.current) {
        isSubmittingSpeechRef.current = false;
        return;
      }

      isSubmittingSpeechRef.current = true;
      stopSpeaking();
      stopListening();

      accumulatedSpeechRef.current = "";
      lastRecognizedTextRef.current = "";
      lastSpeechTimeRef.current = 0;
      setLiveTranscript("");
      setInput("");

      focusInput();

      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        text: query,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);
      isLoadingRef.current = true;

      try {
        const historyPayload = messagesRef.current.slice(-6).map((m) => ({
          role: m.role,
          text: m.text,
        }));

        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: query,
            history: historyPayload,
          }),
        });

        if (!res.ok) {
          throw new Error("Chat response failed");
        }

        const data = await res.json();
        const replyText =
          data.reply ||
          "I am here to help you learn all about Zakaria's work and Shopify experience.";

        const aiMsgId = (Date.now() + 1).toString();
        const aiMsg: Message = {
          id: aiMsgId,
          role: "assistant",
          text: replyText,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, aiMsg]);

        // Speak reply & automatically resume listening when finished in Live Call mode
        speakText(replyText, aiMsgId, () => {
          if (isLiveCallRef.current) {
            isSubmittingSpeechRef.current = false;
            accumulatedSpeechRef.current = "";
            lastRecognizedTextRef.current = "";
            lastSpeechTimeRef.current = 0;
            setLiveTranscript("");
            startListening();
          }
        });
      } catch (err) {
        console.error("Chat error:", err);
        const errorMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          text: "I encountered a brief connection delay. Please try again or reach Zakaria directly at zakaria.binmoti@gmail.com!",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMsg]);

        if (isLiveCallRef.current) {
          setTimeout(() => {
            isSubmittingSpeechRef.current = false;
            startListening();
          }, 800);
        }
      } finally {
        setIsLoading(false);
        isLoadingRef.current = false;
        isSubmittingSpeechRef.current = false;
        focusInput();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [input, speakText, stopSpeaking, focusInput]
  );

  // Unified Speech Submitter - Prevents race conditions and guarantees submission on silence/pause
  const submitSpeech = useCallback(
    (speechText?: string) => {
      const query = (speechText || accumulatedSpeechRef.current).trim();
      if (!query || query.length < 2 || isSubmittingSpeechRef.current || isLoadingRef.current) {
        return;
      }

      isSubmittingSpeechRef.current = true;

      // Immediately cancel all timers to avoid double submit
      if (silenceWatchdogRef.current) {
        clearInterval(silenceWatchdogRef.current);
        silenceWatchdogRef.current = null;
      }
      if (fastPathTimerRef.current) {
        clearTimeout(fastPathTimerRef.current);
        fastPathTimerRef.current = null;
      }

      stopListening();
      handleSendMessage(query);
    },
    [handleSendMessage, stopListening]
  );

  // Start Listening Session - Always Fresh Instance to Guarantee Chromium Stability
  const startListening = useCallback(async () => {
    if (typeof window === "undefined") return;
    if (isSpeakingRef.current || isLoadingRef.current) return;

    stopSpeaking();

    const stream = await requestMicStream();
    if (!stream) {
      alert("Please allow microphone access in your browser to talk with Zaki.");
      return;
    }

    startVolumeTracking(stream);

    // Clean up previous instance cleanly
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    // CREATE FRESH INSTANCE - Essential for Chromium stability
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    accumulatedSpeechRef.current = "";
    lastRecognizedTextRef.current = "";
    lastSpeechTimeRef.current = 0;
    isSubmittingSpeechRef.current = false;
    setLiveTranscript("");

    recognition.onstart = () => {
      setIsListening(true);
      isListeningRef.current = true;
    };

    // Watchdog Polling: Guaranteed submission after 800ms of user silence
    if (silenceWatchdogRef.current) clearInterval(silenceWatchdogRef.current);
    silenceWatchdogRef.current = setInterval(() => {
      if (
        isListeningRef.current &&
        !isLoadingRef.current &&
        !isSpeakingRef.current &&
        !isSubmittingSpeechRef.current &&
        lastSpeechTimeRef.current > 0
      ) {
        const textToSubmit = accumulatedSpeechRef.current.trim();
        if (textToSubmit.length >= 2) {
          const elapsed = Date.now() - lastSpeechTimeRef.current;
          if (elapsed >= 800) {
            submitSpeech(textToSubmit);
          }
        }
      }
    }, 100);

    recognition.onresult = (event: any) => {
      // Collect the full transcript across all chunks
      let fullTranscript = "";
      let isFinalSentence = false;

      for (let i = 0; i < event.results.length; i++) {
        fullTranscript += event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          isFinalSentence = true;
        }
      }

      const activeSpeech = fullTranscript.trim();

      if (activeSpeech) {
        if (activeSpeech !== lastRecognizedTextRef.current) {
          lastRecognizedTextRef.current = activeSpeech;
          lastSpeechTimeRef.current = Date.now();
        }

        accumulatedSpeechRef.current = activeSpeech;
        setLiveTranscript(activeSpeech);

        if (!isLiveCallRef.current) {
          setInput(activeSpeech);
        }

        // Fast-path: When Chrome flags isFinal for a sentence, submit after 600ms of pause
        if (isFinalSentence && activeSpeech.length >= 2) {
          if (fastPathTimerRef.current) clearTimeout(fastPathTimerRef.current);
          fastPathTimerRef.current = setTimeout(() => {
            if (
              isListeningRef.current &&
              !isLoadingRef.current &&
              !isSpeakingRef.current &&
              !isSubmittingSpeechRef.current
            ) {
              submitSpeech(accumulatedSpeechRef.current || activeSpeech);
            }
          }, 600);
        }
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === "no-speech") return;
      if (event.error === "not-allowed") {
        stopListening();
        return;
      }
      console.warn("Speech recognition warning:", event.error);
    };

    recognition.onend = () => {
      // 1. CRITICAL FIX: If user spoke something, SUBMIT IT IMMEDIATELY! Do NOT wipe or loop!
      const pendingSpeech = accumulatedSpeechRef.current.trim();
      if (pendingSpeech.length >= 2 && !isSubmittingSpeechRef.current && !isLoadingRef.current) {
        submitSpeech(pendingSpeech);
        return;
      }

      // 2. If no speech was spoken, and still in Live mode, cleanly restart listening
      if (
        isLiveCallRef.current &&
        !isSpeakingRef.current &&
        !isLoadingRef.current &&
        !isSubmittingSpeechRef.current
      ) {
        setTimeout(() => {
          if (
            isLiveCallRef.current &&
            !isSpeakingRef.current &&
            !isLoadingRef.current &&
            !isSubmittingSpeechRef.current
          ) {
            startListening();
          }
        }, 150);
      } else {
        setIsListening(false);
        isListeningRef.current = false;
        stopVolumeTracking();
      }
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
      isListeningRef.current = true;
    } catch (err: any) {
      console.warn("Recognition start error:", err);
    }
  }, [
    requestMicStream,
    startVolumeTracking,
    stopListening,
    stopSpeaking,
    stopVolumeTracking,
    handleSendMessage,
    submitSpeech,
  ]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (silenceWatchdogRef.current) clearInterval(silenceWatchdogRef.current);
      if (fastPathTimerRef.current) clearTimeout(fastPathTimerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onend = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.onresult = null;
          recognitionRef.current.stop();
        } catch {}
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        try {
          audioContextRef.current.close();
        } catch {}
      }
    };
  }, []);

  // Auto scroll
  useEffect(() => {
    if (isOpen && !isLiveCall) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isLiveCall]);

  const handleToggleListening = () => {
    if (isListening) {
      const textToSubmit = (accumulatedSpeechRef.current || input).trim();
      stopListening();
      if (textToSubmit) {
        handleSendMessage(textToSubmit);
      }
    } else {
      startListening();
    }
  };

  const handleToggleLiveCall = async () => {
    stopSpeaking();
    stopListening();

    if (isLiveCall) {
      setIsLiveCall(false);
      isLiveCallRef.current = false;
      focusInput();
    } else {
      setIsLiveCall(true);
      isLiveCallRef.current = true;
      setIsOpen(true);

      // Pre-warm microphone immediately on user click gesture so permissions are ready
      requestMicStream().catch(() => {});

      speakText(
        "Hello! I am Zaki. Ask me anything about Zakaria's Shopify work, projects, or hiring availability.",
        undefined,
        () => {
          if (isLiveCallRef.current) {
            isSubmittingSpeechRef.current = false;
            accumulatedSpeechRef.current = "";
            lastRecognizedTextRef.current = "";
            lastSpeechTimeRef.current = 0;
            setLiveTranscript("");
            startListening();
          }
        }
      );
    }
  };

  const handleCopyMessage = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  };

  const handleClearHistory = () => {
    stopSpeaking();
    stopListening();
    setMessages([
      {
        id: "welcome-reset",
        role: "assistant",
        text: "Conversation refreshed. Ask or talk about Zakaria's Shopify architecture, live projects, or hiring availability!",
        timestamp: new Date(),
      },
    ]);
    focusInput();
  };

  if (isAdmin) return null;

  const quickPrompts = [
    "Top Shopify projects? 🚀",
    "Tell me about Josh Coppins 🏍️",
    "Tech stack & skills ⚡",
    "How to hire Zakaria ✉️",
  ];

  return (
    <>
      {/* 0. INTERACTIVE ROAMING SCREEN COMPANION (Astro-Bot Mascot) */}
      <RoamingCompanion
        onOpenChat={() => {
          setIsOpen(true);
          focusInput();
        }}
        isChatOpen={isOpen}
        onDismissStateChange={setCompanionDismissed}
      />

      {/* 1. MINIMAL WORLD-CLASS FLOATING LAUNCHER (Appears ONLY when companion is dismissed!) */}
      <div className="fixed bottom-6 right-6 z-50 pointer-events-auto">
        <AnimatePresence>
          {!isOpen && companionDismissed && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="relative group"
            >
              <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="bg-[#0c0e17] text-white text-xs px-3 py-1.5 rounded-lg border border-white/10 shadow-xl whitespace-nowrap flex items-center gap-2 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f6602d]" />
                  <span>Ask Zakaria&apos;s AI</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCompanionDismissed(false);
                      if (typeof window !== "undefined") {
                        window.dispatchEvent(new CustomEvent("summon-companion"));
                      }
                    }}
                    className="pointer-events-auto ml-1 px-1.5 py-0.5 rounded bg-white/[0.08] hover:bg-[#f6602d]/20 text-zinc-300 hover:text-[#ff9e6c] text-[10px] flex items-center gap-1 transition-colors"
                    title="Bring Zaki back to screen"
                  >
                    <span>Summon Zaki 🤖</span>
                  </button>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => {
                  setIsOpen(true);
                  focusInput();
                }}
                className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-full p-[1.5px] flex items-center justify-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#fe743d] transition-transform duration-200"
                aria-label="Open AI Assistant"
              >
                {/* 1. KINETIC ROTATING CONIC AURA (Continuous ambient light beam circling around the edge) */}
                <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="w-full h-full rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,transparent_200deg,rgba(246,96,45,0.25)_260deg,rgba(255,160,118,0.95)_360deg)]"
                  />
                </div>

                {/* 2. INNER OBSIDIAN GLASS CHASSIS */}
                <div className="relative w-full h-full rounded-full bg-gradient-to-b from-[#141724] to-[#07090f] border border-white/[0.12] group-hover:border-[#fe743d]/60 flex items-center justify-center overflow-hidden shadow-[0_12px_36px_rgba(0,0,0,0.85),0_0_22px_rgba(246,96,45,0.22)] group-hover:shadow-[0_16px_45px_rgba(0,0,0,0.95),0_0_34px_rgba(246,96,45,0.45)] transition-all duration-300">
                  {/* Specular Upper Glass Glaze */}
                  <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/[0.12] to-transparent rounded-t-full pointer-events-none" />

                  {/* Inner Ambient Core Light */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(246,96,45,0.26)_0%,transparent_70%)] opacity-80 group-hover:opacity-100 transition-opacity" />

                  {/* Aesthetic Bespoke AI Emblem */}
                  <AestheticBotEmblem size={26} idPrefix="launcher" />
                </div>

                {/* 3. KINETIC ORBITING SATELLITE (Continuously glides around the outer perimeter) */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 6.5, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 pointer-events-none"
                >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <span className="relative flex h-2.5 w-2.5 items-center justify-center">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff915e] opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-gradient-to-r from-[#ffe4d6] via-[#fe743d] to-[#f6602d] shadow-[0_0_8px_#fe743d,0_0_2px_#ffffff]" />
                    </span>
                  </div>
                </motion.div>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. WORLD-CLASS MINIMALIST CHAT DIALOG */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="fixed bottom-6 right-4 sm:right-6 z-50 w-[380px] sm:w-[410px] max-w-[94vw] h-[580px] max-h-[86vh] flex flex-col rounded-2xl bg-[#090b11] border border-white/[0.09] shadow-[0_24px_70px_rgba(0,0,0,0.92)] overflow-hidden"
          >
            <div
              aria-hidden="true"
              className="absolute top-0 inset-x-6 h-[1px] bg-gradient-to-r from-transparent via-[#f6602d]/70 to-transparent"
            />

            {/* Clean Header - Spacious, No Clutter, Zero Overlapping */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08] bg-[#0c0e17]">
              {/* Left: Avatar & Identity */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative w-8 h-8 rounded-full border border-white/15 shrink-0 bg-[#0c0e17] flex items-center justify-center overflow-hidden shadow-inner">
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#f6602d]/25 to-transparent" />
                  <div className="scale-75 translate-y-0.5">
                    <CompanionMascot size={26} action="idle" />
                  </div>
                  <span className="absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full bg-[#f6602d] border border-[#090b11]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs sm:text-sm font-semibold text-white tracking-tight truncate">
                      Zaki
                    </h3>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#f6602d]/20 text-[#ff915e] font-mono border border-[#f6602d]/30 font-medium leading-none">
                      AI Companion
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 font-light truncate mt-0.5">
                    {isLiveCall ? "Live Voice Companion" : "Zakaria's AI Assistant"}
                  </p>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-1.5 shrink-0 text-zinc-400">
                <button
                  type="button"
                  onClick={handleToggleLiveCall}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                    isLiveCall
                      ? "bg-[#f6602d] text-white hover:bg-[#fe743d] shadow-[0_0_12px_rgba(246,96,45,0.4)]"
                      : "bg-white/[0.06] hover:bg-[#f6602d]/15 text-zinc-300 hover:text-[#ff915e] border border-white/10 hover:border-[#f6602d]/40"
                  }`}
                  title={isLiveCall ? "Switch to Text Chat" : "Switch to Live Voice Mode"}
                  aria-label="Toggle Live Voice Mode"
                >
                  {isLiveCall ? (
                    <>
                      <MessageSquare className="w-3 h-3" />
                      <span>Chat</span>
                    </>
                  ) : (
                    <>
                      <Headphones className="w-3 h-3 text-[#f6602d]" />
                      <span>Live</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (isSpeaking) stopSpeaking();
                    setVoiceEnabled(!voiceEnabled);
                  }}
                  className={`p-1.5 rounded-lg transition-colors ${
                    voiceEnabled
                      ? "text-zinc-300 hover:bg-white/[0.08]"
                      : "text-zinc-600 hover:bg-white/[0.04]"
                  }`}
                  title={voiceEnabled ? "Mute audio output" : "Enable audio output"}
                  aria-label="Toggle speech audio"
                >
                  {voiceEnabled ? (
                    <Volume2 className="w-3.5 h-3.5" />
                  ) : (
                    <VolumeX className="w-3.5 h-3.5" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="p-1.5 rounded-lg hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-colors"
                  title="Clear conversation"
                  aria-label="Clear chat"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    stopSpeaking();
                    stopListening();
                    setIsLiveCall(false);
                    isLiveCallRef.current = false;
                    setIsOpen(false);
                  }}
                  className="p-1.5 rounded-lg hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-colors ml-0.5"
                  aria-label="Close Assistant"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* VIEW A: MINIMALIST LIVE VOICE CALL MODE */}
            {isLiveCall ? (
              <div className="flex-1 flex flex-col items-center justify-between p-6 text-center bg-[#090b11]">
                {/* Status Indicator */}
                <div className="py-1 px-3.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] text-zinc-300 flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isSpeaking
                        ? "bg-[#fe743d] animate-ping"
                        : isLoading
                        ? "bg-amber-400 animate-pulse"
                        : isListening
                        ? liveTranscript
                          ? "bg-[#fe743d] animate-ping"
                          : "bg-[#f6602d] animate-ping"
                        : "bg-zinc-600"
                    }`}
                  />
                  <span>
                    {isSpeaking
                      ? "Zaki is speaking..."
                      : isLoading
                      ? "Thinking & analyzing..."
                      : isListening
                      ? liveTranscript
                        ? "Speech detected • Answering..."
                        : "Listening to your voice..."
                      : "Tap circle to talk"}
                  </span>
                </div>

                {/* Minimalist Terracotta Sound Orb */}
                <div className="relative my-auto flex items-center justify-center">
                  <motion.div
                    animate={{
                      scale: isSpeaking
                        ? [1, 1.25, 1]
                        : isListening
                        ? 1 + audioVolume / 180
                        : [1, 1.04, 1],
                      opacity: isSpeaking || isListening ? 0.35 : 0.15,
                    }}
                    transition={{
                      repeat: isSpeaking || !isListening ? Infinity : 0,
                      duration: isSpeaking ? 1.5 : 2.5,
                      ease: "easeInOut",
                    }}
                    className="absolute w-44 h-44 rounded-full bg-[#f6602d] blur-2xl pointer-events-none"
                  />

                  {isListening && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
                      transition={{ repeat: Infinity, duration: 1.8 }}
                      className="absolute w-36 h-36 rounded-full border border-[#f6602d]/40 pointer-events-none"
                    />
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      if (isSpeaking) {
                        stopSpeaking();
                        startListening();
                      } else if (isListening) {
                        const text = accumulatedSpeechRef.current.trim();
                        if (text) {
                          stopListening();
                          handleSendMessage(text);
                        } else {
                          stopListening();
                        }
                      } else {
                        startListening();
                      }
                    }}
                    className={`relative w-28 h-28 rounded-full flex flex-col items-center justify-center shadow-xl transition-all duration-200 cursor-pointer ${
                      isSpeaking
                        ? "bg-gradient-to-tr from-[#5a1f28] via-[#f6602d] to-[#fe743d] text-white shadow-[0_0_40px_rgba(246,96,45,0.5)] scale-105"
                        : isListening
                        ? "bg-gradient-to-tr from-[#5a1f28] to-[#f6602d] text-white shadow-[0_0_40px_rgba(246,96,45,0.45)] scale-105"
                        : "bg-white/[0.04] hover:bg-white/[0.08] border border-white/15 text-zinc-300 hover:scale-105"
                    }`}
                    title={
                      isSpeaking
                        ? "Tap to interrupt AI"
                        : isListening
                        ? "Tap to pause or submit"
                        : "Tap to speak"
                    }
                  >
                    {isSpeaking ? (
                      <div className="flex items-center gap-1">
                        <span className="w-1 h-6 bg-white rounded-full animate-bounce [animation-delay:0ms]" />
                        <span className="w-1 h-9 bg-white rounded-full animate-bounce [animation-delay:150ms]" />
                        <span className="w-1 h-5 bg-white rounded-full animate-bounce [animation-delay:300ms]" />
                        <span className="w-1 h-7 bg-white rounded-full animate-bounce [animation-delay:450ms]" />
                      </div>
                    ) : isListening ? (
                      <div className="flex flex-col items-center gap-1">
                        <Mic className="w-7 h-7 animate-pulse text-white" />
                        <span className="text-[9px] uppercase font-mono tracking-wider opacity-90">
                          {audioVolume > 15 ? "Speaking" : "Listening"}
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <Mic className="w-7 h-7 opacity-60" />
                        <span className="text-[9px] uppercase font-mono tracking-wider opacity-60">
                          Tap to talk
                        </span>
                      </div>
                    )}
                  </button>
                </div>

                {/* Subtitles Box */}
                <div className="w-full min-h-[75px] max-h-[110px] overflow-y-auto px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-zinc-200">
                  {liveTranscript ? (
                    <p className="text-[#fe743d] font-mono text-left break-words [overflow-wrap:anywhere]">
                      <span className="font-bold mr-1 text-[#f6602d]">You:</span>
                      &quot;{liveTranscript}&quot;
                    </p>
                  ) : isLoading ? (
                    <div className="flex items-center justify-center gap-2 text-zinc-300 py-3">
                      <span className="w-2 h-2 rounded-full bg-[#f6602d] animate-ping" />
                      <span className="italic font-medium">Zaki is thinking & preparing answer...</span>
                    </div>
                  ) : isSpeaking ? (
                    <p className="text-zinc-300 text-left leading-relaxed break-words [overflow-wrap:anywhere]">
                      <span className="font-semibold mr-1 text-[#fe743d]">
                        Zaki:
                      </span>
                      &quot;{messages[messages.length - 1]?.text}&quot;
                    </p>
                  ) : (
                    <p className="text-zinc-500 italic text-center py-2">
                      Speak freely. When you pause, Zaki will reply automatically.
                    </p>
                  )}
                </div>

                {/* Quick Submit Button When Speech Detected */}
                {isListening && liveTranscript && (
                  <button
                    type="button"
                    onClick={() => {
                      const text = accumulatedSpeechRef.current.trim();
                      if (text) {
                        stopListening();
                        handleSendMessage(text);
                      }
                    }}
                    className="mt-2 text-[11px] font-semibold text-[#fe743d] hover:text-white flex items-center gap-1 underline underline-offset-2 transition-colors cursor-pointer"
                  >
                    <span>Done Speaking &bull; Send Now &rarr;</span>
                  </button>
                )}

                {/* Call Action Bar */}
                <div className="flex items-center justify-center gap-2.5 mt-3 w-full">
                  <button
                    type="button"
                    onClick={() => {
                      if (isListening) {
                        const text = accumulatedSpeechRef.current.trim();
                        stopListening();
                        if (text) handleSendMessage(text);
                      } else {
                        startListening();
                      }
                    }}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                      isListening
                        ? "bg-[#f6602d]/20 text-[#fe743d] border border-[#f6602d]/40"
                        : "bg-white/[0.06] text-zinc-300 hover:text-white border border-white/[0.08]"
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>{isListening ? "Pause" : "Resume"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleLiveCall}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300 hover:text-white border border-white/[0.08] text-xs font-medium transition-all"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Text Chat</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      stopSpeaking();
                      stopListening();
                      setIsLiveCall(false);
                      isLiveCallRef.current = false;
                      setIsOpen(false);
                    }}
                    className="p-2 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 transition-all"
                    title="End Call"
                  >
                    <PhoneOff className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              /* VIEW B: MINIMALIST TEXT & VOICE CHAT */
              <>
                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs sm:text-sm">
                  {messages.map((msg) => {
                    const isUser = msg.role === "user";
                    const isThisSpeaking = speakingMessageId === msg.id && isSpeaking;

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${
                          isUser ? "items-end" : "items-start"
                        }`}
                      >
                        <div
                          className={`max-w-[88%] rounded-2xl px-4 py-2.5 leading-relaxed break-words [overflow-wrap:anywhere] overflow-hidden ${
                            isUser
                              ? "bg-[#f6602d] text-white rounded-br-xs shadow-sm font-normal"
                              : "bg-[#131622] border border-white/[0.07] text-zinc-200 rounded-bl-xs"
                          }`}
                        >
                          {isUser ? (
                            <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                              {msg.text}
                            </p>
                          ) : (
                            <FormattedMessage text={msg.text} />
                          )}
                        </div>

                        {/* Inline Actions (Listen / Stop Speaking / Copy) */}
                        {!isUser && (
                          <div className="flex items-center gap-3 mt-1.5 ml-1 text-[11px] text-zinc-500">
                            {voiceEnabled && (
                              <>
                                {isThisSpeaking ? (
                                  <button
                                    type="button"
                                    onClick={stopSpeaking}
                                    className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#f6602d]/15 text-[#fe743d] border border-[#f6602d]/35 text-[11px] font-medium hover:bg-[#f6602d]/25 transition-all"
                                    title="Stop voice narration"
                                  >
                                    <div className="flex items-center gap-0.5">
                                      <span className="w-0.5 h-2.5 bg-[#fe743d] rounded-full animate-bounce [animation-delay:0ms]" />
                                      <span className="w-0.5 h-3.5 bg-[#fe743d] rounded-full animate-bounce [animation-delay:150ms]" />
                                      <span className="w-0.5 h-2 bg-[#fe743d] rounded-full animate-bounce [animation-delay:300ms]" />
                                    </div>
                                    <span>Stop Speaking</span>
                                    <Square className="w-2.5 h-2.5 fill-current ml-0.5" />
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => speakText(msg.text, msg.id)}
                                    className="flex items-center gap-1 hover:text-[#fe743d] transition-colors"
                                    title="Listen to response"
                                  >
                                    <Volume2 className="w-3 h-3" />
                                    <span>Listen</span>
                                  </button>
                                )}
                              </>
                            )}

                            <button
                              type="button"
                              onClick={() => handleCopyMessage(msg.id, msg.text)}
                              className="flex items-center gap-1 hover:text-zinc-300 transition-colors"
                              title="Copy answer"
                            >
                              {copiedId === msg.id ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {isLoading && (
                    <div className="flex items-center gap-2 text-zinc-400 text-xs py-2 px-3 rounded-xl bg-white/[0.03] w-fit border border-white/[0.06]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#f6602d] animate-ping" />
                      <span>Thinking...</span>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Prompts */}
                {messages.length <= 2 && (
                  <div className="px-4 py-2 flex flex-wrap gap-1.5 border-t border-white/[0.05] bg-white/[0.01]">
                    {quickPrompts.map((prompt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          handleSendMessage(prompt);
                          focusInput();
                        }}
                        className="text-[11px] px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-[#f6602d]/10 border border-white/[0.08] hover:border-[#f6602d]/30 text-zinc-400 hover:text-[#ff915e] transition-all text-left"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                )}

                {/* Minimalist Speech Dictation Overlay */}
                {isListening && (
                  <div className="px-3.5 py-2 bg-[#f6602d]/10 border-t border-[#f6602d]/25 text-xs text-[#fe743d] flex items-center justify-between">
                    <div className="flex items-center gap-2 truncate pr-2">
                      <span className="w-2 h-2 rounded-full bg-[#f6602d] animate-ping shrink-0" />
                      <span className="truncate text-[11px]">
                        {liveTranscript
                          ? `"${liveTranscript}"`
                          : "Listening... speak now"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const text = (accumulatedSpeechRef.current || input).trim();
                        stopListening();
                        if (text) handleSendMessage(text);
                      }}
                      className="text-[11px] font-semibold underline hover:text-white shrink-0 ml-2"
                    >
                      Send
                    </button>
                  </div>
                )}

                {/* ChatGPT-Style Input Bar */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="p-2.5 border-t border-white/[0.08] bg-[#0c0e17] flex items-center gap-1.5"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={
                      isListening
                        ? "Listening... speak into your mic..."
                        : "Ask about projects, stack, hiring..."
                    }
                    className="flex-1 bg-white/[0.04] border border-white/[0.08] focus:border-[#f6602d]/60 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none transition-colors"
                  />

                  {/* 1. Voice Dictation Microphone Button */}
                  <button
                    type="button"
                    onClick={handleToggleListening}
                    className={`p-2 rounded-xl transition-all shrink-0 ${
                      isListening
                        ? "bg-[#f6602d] text-white shadow-[0_0_15px_rgba(246,96,45,0.6)] animate-pulse"
                        : speechSupported
                        ? "bg-white/[0.05] hover:bg-white/[0.1] text-zinc-400 hover:text-white border border-white/[0.08]"
                        : "bg-white/[0.02] text-zinc-700 cursor-not-allowed"
                    }`}
                    title={
                      speechSupported
                        ? isListening
                          ? "Stop voice dictation"
                          : "Voice dictation (speech-to-text)"
                        : "Speech recognition not supported"
                    }
                    aria-label="Voice dictation"
                  >
                    {isListening ? (
                      <MicOff className="w-4 h-4" />
                    ) : (
                      <Mic className="w-4 h-4" />
                    )}
                  </button>

                  {/* 2. ChatGPT-Style Live Voice Mode Button */}
                  <button
                    type="button"
                    onClick={handleToggleLiveCall}
                    className="p-2 rounded-xl bg-white/[0.05] hover:bg-[#f6602d]/15 text-zinc-400 hover:text-[#fe743d] border border-white/[0.08] hover:border-[#f6602d]/30 transition-all shrink-0"
                    title="Start Live Voice Mode"
                    aria-label="Start Live Voice Mode"
                  >
                    <Headphones className="w-4 h-4" />
                  </button>

                  {/* 3. Send Button */}
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="p-2 rounded-xl bg-[#f6602d] hover:bg-[#fe743d] text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm shrink-0"
                    title="Send message"
                    aria-label="Send message"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
