"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Sparkles,
  X,
  MessageSquare,
  RotateCcw,
  Square,
  ArrowUp,
  Radio,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
}

export default function VoiceAssistant() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Hi! I am Zakaria's AI Assistant, directly connected to his live portfolio data. You can ask or talk to me about his 250+ delivered Shopify stores, case studies, technical stack, or how to hire him!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [speechSupported, setSpeechSupported] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition & Synthesis capability check
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        setSpeechSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          let currentTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setInput(currentTranscript);
        };

        recognition.onerror = (event: any) => {
          console.warn("Speech recognition error:", event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  // Scroll to bottom of message list when messages change
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Clean voice utterance helper
  const speakText = (text: string) => {
    if (!voiceEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Stop any active speech

      // Remove markdown links, brackets, and bullet symbols for natural spoken speech
      const cleanText = text
        .replace(/https?:\/\/[^\s]+/g, "")
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
        .replace(/[*#_~`•]/g, "")
        .replace(/\n+/g, ". ")
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanText);

      // Select optimal natural English voice if present
      const voices = window.speechSynthesis.getVoices();
      const naturalVoice = voices.find(
        (v) =>
          v.lang.startsWith("en") &&
          (v.name.includes("Natural") ||
            v.name.includes("Google") ||
            v.name.includes("Samantha") ||
            v.name.includes("Daniel") ||
            v.name.includes("Premium") ||
            v.name.includes("Enhanced"))
      );

      if (naturalVoice) utterance.voice = naturalVoice;
      utterance.rate = 1.05;
      utterance.pitch = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis error:", e);
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleToggleListening = () => {
    if (!speechSupported || !recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please type your message.");
      return;
    }

    stopSpeaking();

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      if (input.trim()) {
        handleSendMessage(input.trim());
      }
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn("Could not start recognition:", err);
      }
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    stopSpeaking();
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      text: query,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
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
        throw new Error("Failed to receive response");
      }

      const data = await res.json();
      const replyText = data.reply || "I am here to help you learn all about Zakaria's work and experience.";

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: replyText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      speakText(replyText);
    } catch (err) {
      console.error("Chat error:", err);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: "I encountered a momentary connection hiccup. You can reach Zakaria directly at zakaria.binmoti@gmail.com!",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    stopSpeaking();
    setMessages([
      {
        id: "welcome-reset",
        role: "assistant",
        text: "Conversation refreshed. Ask or talk about Zakaria's Shopify architecture, live projects, or hiring availability!",
        timestamp: new Date(),
      },
    ]);
  };

  // Do not render inside the Admin dashboard
  if (isAdmin) return null;

  const quickPrompts = [
    "Top Shopify projects? 🚀",
    "Tell me about Josh Coppins 🏍️",
    "Tech stack & skills ⚡",
    "How to hire Zakaria ✉️",
  ];

  return (
    <>
      {/* 1. Floating Spatial Orb Trigger */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 pointer-events-auto">
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(true)}
              className="relative flex items-center gap-3 px-5 py-3.5 rounded-full bg-[#0a0d14]/90 hover:bg-[#121622] border border-white/15 backdrop-blur-2xl shadow-[0_15px_35px_rgba(0,0,0,0.7)] group transition-all"
              aria-label="Open AI Voice & Chat Assistant"
            >
              {/* Outer Pulse Glow */}
              <div
                aria-hidden="true"
                className="absolute inset-0 rounded-full bg-gradient-to-r from-[#3594bd]/30 via-transparent to-[#60a5fa]/30 blur-md group-hover:opacity-100 opacity-60 transition-opacity"
              />

              {/* Glowing Pulsing Icon Orb */}
              <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-[#3594bd] to-[#60a5fa] text-white shadow-[0_0_15px_rgba(53,148,189,0.5)]">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0a0d14] animate-ping" />
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0a0d14]" />
              </div>

              <div className="relative flex flex-col text-left">
                <span className="text-xs font-semibold text-white tracking-wide flex items-center gap-1.5">
                  <span>Ask Zakaria&apos;s AI</span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-white/10 text-cyan-300">
                    Voice
                  </span>
                </span>
                <span className="text-[11px] text-gray-400 font-light">
                  Live portfolio knowledge
                </span>
              </div>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* 2. Interactive Voice & Chat Dialog */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.94 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed bottom-6 right-4 sm:right-6 z-50 w-[380px] sm:w-[420px] max-w-[94vw] h-[580px] max-h-[85vh] flex flex-col rounded-3xl bg-[#090c13]/95 border border-white/15 backdrop-blur-3xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] overflow-hidden"
          >
            {/* Top Spatial Ambient Highlight */}
            <div
              aria-hidden="true"
              className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-[#60a5fa]/60 to-transparent"
            />

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="relative w-9 h-9 rounded-full overflow-hidden border border-white/20 shrink-0">
                  <Image
                    src="/favicon.png"
                    alt="Zakaria AI Twin"
                    width={36}
                    height={36}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-[#090c13]" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-semibold text-white tracking-tight">
                      Zakaria&apos;s AI Twin
                    </h3>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-[#3594bd]/20 text-[#38bdf8] border border-[#3594bd]/30">
                      Live
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Always synced with live projects &amp; stack
                  </p>
                </div>
              </div>

              {/* Header Action Controls */}
              <div className="flex items-center gap-1.5 text-gray-400">
                {/* Voice Narration Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    if (isSpeaking) stopSpeaking();
                    setVoiceEnabled(!voiceEnabled);
                  }}
                  className={`p-2 rounded-full transition-colors ${
                    voiceEnabled
                      ? "text-[#38bdf8] hover:bg-white/10"
                      : "text-gray-500 hover:bg-white/5"
                  }`}
                  title={voiceEnabled ? "Mute voice narration" : "Enable voice narration"}
                  aria-label="Toggle voice output"
                >
                  {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>

                {/* Reset History */}
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                  title="Clear conversation"
                  aria-label="Clear chat"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => {
                    stopSpeaking();
                    setIsOpen(false);
                  }}
                  className="p-2 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                  aria-label="Close Assistant"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Speaking / Audio Visualizer Bar */}
            <AnimatePresence>
              {isSpeaking && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-5 py-2 bg-[#3594bd]/10 border-b border-[#3594bd]/20 flex items-center justify-between text-xs text-[#38bdf8]"
                >
                  <div className="flex items-center gap-2">
                    <Radio className="w-3.5 h-3.5 animate-pulse" />
                    <span>Speaking response...</span>
                    <div className="flex items-center gap-0.5 ml-2">
                      <span className="w-1 h-3 bg-[#38bdf8] rounded-full animate-bounce" />
                      <span className="w-1 h-4 bg-[#38bdf8] rounded-full animate-bounce [animation-delay:0.15s]" />
                      <span className="w-1 h-2 bg-[#38bdf8] rounded-full animate-bounce [animation-delay:0.3s]" />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={stopSpeaking}
                    className="flex items-center gap-1 text-[11px] underline hover:text-white transition-colors"
                  >
                    <Square className="w-2.5 h-2.5 fill-current" />
                    <span>Stop</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-sm">
              {messages.map((msg) => {
                const isUser = msg.role === "user";
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 leading-relaxed text-sm ${
                        isUser
                          ? "bg-gradient-to-r from-[#3594bd] to-[#2563eb] text-white rounded-br-none shadow-lg"
                          : "bg-white/[0.06] border border-white/10 text-gray-200 rounded-bl-none shadow-md backdrop-blur-md"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>

                    {!isUser && voiceEnabled && (
                      <button
                        type="button"
                        onClick={() => speakText(msg.text)}
                        className="mt-1 flex items-center gap-1 text-[11px] text-gray-500 hover:text-[#38bdf8] transition-colors ml-1"
                        title="Replay voice audio"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>Replay audio</span>
                      </button>
                    )}
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex items-center gap-2 text-gray-400 text-xs py-2 px-3 rounded-2xl bg-white/[0.04] w-fit border border-white/5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] animate-ping" />
                  <span>Consulting live database...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Starter Prompts */}
            {messages.length <= 2 && (
              <div className="px-4 py-2 flex flex-wrap gap-1.5 border-t border-white/5 bg-white/[0.01]">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(prompt)}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all text-left"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Live Listening Overlay Indicator */}
            {isListening && (
              <div className="px-4 py-2 bg-rose-500/10 border-t border-rose-500/20 text-xs text-rose-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <span>Listening... Speak now</span>
                </div>
                <button
                  type="button"
                  onClick={handleToggleListening}
                  className="font-medium underline hover:text-white"
                >
                  Send speech
                </button>
              </div>
            )}

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 border-t border-white/10 bg-[#090c13] flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? "Listening to your voice..." : "Ask or speak about anything..."}
                disabled={isLoading}
                className="flex-1 bg-white/[0.05] border border-white/10 focus:border-[#38bdf8]/50 rounded-full px-4 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none transition-colors"
              />

              {/* Voice Input Microphone Button */}
              <button
                type="button"
                onClick={handleToggleListening}
                className={`p-2.5 rounded-full transition-all shrink-0 ${
                  isListening
                    ? "bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.6)] animate-pulse"
                    : speechSupported
                    ? "bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white"
                    : "bg-white/5 text-gray-600 cursor-not-allowed"
                }`}
                title={speechSupported ? (isListening ? "Stop listening & send" : "Speak via microphone") : "Speech recognition not supported in this browser"}
                aria-label="Microphone Voice Input"
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Text Send Button */}
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2.5 rounded-full bg-gradient-to-r from-[#3594bd] to-[#2563eb] text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shrink-0"
                aria-label="Send Message"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
