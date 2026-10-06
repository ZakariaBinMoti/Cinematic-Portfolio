"use client";

import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Command } from "cmdk";
import { AnimatePresence, motion } from "framer-motion";
import {
  CornerDownLeft,
  ExternalLink,
  LogOut,
  Plus,
  Search,
  Sparkles,
  FileText,
  Trophy,
  GraduationCap,
  Mail,
} from "lucide-react";
import { Kbd } from "../_ui";
import { navItems } from "./nav";

export default function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();

  const run = (fn: () => void) => {
    onClose();
    fn();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ type: "spring", stiffness: 500, damping: 36 }}
            className="a-gradient-border relative w-full max-w-xl overflow-hidden rounded-2xl bg-[rgba(14,14,20,0.97)] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)]"
          >
            <Command
              label="Command palette"
              loop
              onKeyDown={(e) => {
                if (e.key === "Escape") onClose();
              }}
            >
              <div className="flex items-center gap-3 border-b border-[var(--a-border)] px-4 py-3.5">
                <Search className="h-[18px] w-[18px] text-[var(--a-text-subtle)]" />
                <Command.Input id="command-palette-input" autoFocus placeholder="Search pages and actions…" />
                <Kbd>Esc</Kbd>
              </div>

              <Command.List className="max-h-[360px] overflow-y-auto p-2">
                <Command.Empty>No results found.</Command.Empty>

                <Command.Group heading="Navigate">
                  {navItems.map((item) => (
                    <Command.Item
                      key={item.path}
                      value={`${item.name} ${item.description}`}
                      onSelect={() => run(() => router.push(item.path))}
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.04]">
                        <item.icon className="h-4 w-4" />
                      </span>
                      <span className="flex-1">
                        <span className="block text-[var(--a-text)]">{item.name}</span>
                        <span className="block text-xs text-[var(--a-text-subtle)]">{item.description}</span>
                      </span>
                      <span className="flex gap-1">
                        <Kbd>G</Kbd>
                        <Kbd>{item.shortcut}</Kbd>
                      </span>
                    </Command.Item>
                  ))}
                </Command.Group>

                <Command.Group heading="Content Studio Sections">
                  <Command.Item value="Content Studio Hero showcase intro headline" onSelect={() => run(() => router.push("/admin/content?tab=hero"))}>
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-300">
                      <Sparkles className="h-4 w-4" />
                    </span>
                    <span className="flex-1 text-[var(--a-text)]">Hero Showcase Copy</span>
                  </Command.Item>
                  <Command.Item value="Content Studio About bio narrative paragraphs" onSelect={() => run(() => router.push("/admin/content?tab=about"))}>
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/15 text-blue-300">
                      <FileText className="h-4 w-4" />
                    </span>
                    <span className="flex-1 text-[var(--a-text)]">About Narrative Bio</span>
                  </Command.Item>
                  <Command.Item value="Content Studio Key Metrics achievements numbers" onSelect={() => run(() => router.push("/admin/content?tab=achievements"))}>
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/15 text-violet-300">
                      <Trophy className="h-4 w-4" />
                    </span>
                    <span className="flex-1 text-[var(--a-text)]">Key Metrics & Achievements</span>
                  </Command.Item>
                  <Command.Item value="Content Studio Education academic degrees milestones" onSelect={() => run(() => router.push("/admin/content?tab=education"))}>
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-300">
                      <GraduationCap className="h-4 w-4" />
                    </span>
                    <span className="flex-1 text-[var(--a-text)]">Academic & Education</span>
                  </Command.Item>
                  <Command.Item value="Content Studio Contact social links profiles email" onSelect={() => run(() => router.push("/admin/content?tab=contact"))}>
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-500/15 text-pink-300">
                      <Mail className="h-4 w-4" />
                    </span>
                    <span className="flex-1 text-[var(--a-text)]">Contact & Social Profiles</span>
                  </Command.Item>
                </Command.Group>

                <Command.Group heading="Actions">
                  <Command.Item value="Add new project create" onSelect={() => run(() => router.push("/admin/projects?new=1"))}>
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/15 text-violet-300">
                      <Plus className="h-4 w-4" />
                    </span>
                    <span className="flex-1 text-[var(--a-text)]">Add new project</span>
                  </Command.Item>
                  <Command.Item value="Add experience role create" onSelect={() => run(() => router.push("/admin/experience?new=1"))}>
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-300">
                      <Plus className="h-4 w-4" />
                    </span>
                    <span className="flex-1 text-[var(--a-text)]">Add experience</span>
                  </Command.Item>
                  <Command.Item value="View live site portfolio open" onSelect={() => run(() => window.open("/", "_blank"))}>
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-300">
                      <ExternalLink className="h-4 w-4" />
                    </span>
                    <span className="flex-1 text-[var(--a-text)]">View live site</span>
                  </Command.Item>
                  <Command.Item value="Sign out logout" onSelect={() => run(() => signOut({ callbackUrl: "/admin/login" }))}>
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/15 text-red-300">
                      <LogOut className="h-4 w-4" />
                    </span>
                    <span className="flex-1 text-[var(--a-text)]">Sign out</span>
                  </Command.Item>
                </Command.Group>
              </Command.List>

              <div className="flex items-center justify-between border-t border-[var(--a-border)] px-4 py-2.5 text-[11px] text-[var(--a-text-subtle)]">
                <span className="flex items-center gap-1.5">
                  <Kbd>↑</Kbd>
                  <Kbd>↓</Kbd> navigate
                </span>
                <span className="flex items-center gap-1.5">
                  <Kbd>
                    <CornerDownLeft className="h-3 w-3" />
                  </Kbd>
                  select
                </span>
              </div>
            </Command>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
