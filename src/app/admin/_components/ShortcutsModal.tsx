"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X, Keyboard } from "lucide-react";
import { Kbd } from "../_ui";

interface ShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

const SHORTCUT_GROUPS = [
  {
    title: "Global & Navigation",
    items: [
      { label: "Open Command Palette", keys: ["Ctrl", "K"] },
      { label: "Toggle Sidebar collapse", keys: ["Ctrl", "\\"] },
      { label: "Show keyboard shortcuts", keys: ["?"] },
      { label: "Close modal / drawer", keys: ["Esc"] },
    ],
  },
  {
    title: "Quick Page Jumps",
    items: [
      { label: "Go to Dashboard", keys: ["G", "D"] },
      { label: "Go to Projects Manager", keys: ["G", "P"] },
      { label: "Go to Experience Timeline", keys: ["G", "E"] },
      { label: "Go to Skills Arsenal", keys: ["G", "S"] },
      { label: "Go to Content Studio", keys: ["G", "C"] },
      { label: "Go to Settings", keys: ["G", ","] },
    ],
  },
  {
    title: "Editing & Forms",
    items: [
      { label: "Save active content", keys: ["Ctrl", "S"] },
      { label: "Submit drawer / form", keys: ["Ctrl", "Enter"] },
    ],
  },
];

export default function ShortcutsModal({ open, onClose }: ShortcutsModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            className="relative z-10 w-full max-w-lg rounded-2xl bg-[#0e0e14] border border-white/10 shadow-2xl overflow-hidden p-6 space-y-6"
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-violet-500/10 text-violet-300">
                  <Keyboard className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-base font-semibold text-white">Keyboard Shortcuts</h3>
                  <p className="text-xs text-[var(--a-text-muted)]">Accelerate your workflow with quick keybindings</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1">
              {SHORTCUT_GROUPS.map((group) => (
                <div key={group.title}>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--a-text-subtle)] mb-2.5">
                    {group.title}
                  </p>
                  <div className="space-y-1.5">
                    {group.items.map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-white/[0.02]"
                      >
                        <span className="text-xs text-gray-300">{item.label}</span>
                        <div className="flex items-center gap-1">
                          {item.keys.map((k) => (
                            <Kbd key={k}>{k}</Kbd>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-[var(--a-text-subtle)]">
              <span>Press <Kbd>?</Kbd> anywhere to toggle this guide</span>
              <Kbd>Esc to close</Kbd>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
