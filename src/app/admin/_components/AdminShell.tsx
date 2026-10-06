"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import CommandPalette from "./CommandPalette";
import ShortcutsModal from "./ShortcutsModal";
import { navItems } from "./nav";

const COLLAPSE_KEY = "admin:sidebar-collapsed";

function isTypingTarget(el: EventTarget | null) {
  if (!(el instanceof HTMLElement)) return false;
  return el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName);
}

export default function AdminShell({ email, children }: { email: string; children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const gPressedAt = useRef(0);

  // Restore sidebar preference after mount (avoids hydration mismatch).
  useEffect(() => {
    setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "1");
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((c) => {
      localStorage.setItem(COLLAPSE_KEY, c ? "0" : "1");
      return !c;
    });
  }, []);

  // Close the mobile drawer on navigation.
  useEffect(() => setMobileOpen(false), [pathname]);

  // Global keyboard shortcuts.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "\\") {
        e.preventDefault();
        toggleCollapsed();
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey || isTypingTarget(e.target)) return;

      if (e.key === "?") {
        e.preventDefault();
        setShortcutsOpen((o) => !o);
        return;
      }

      const key = e.key.toUpperCase();
      // "G then X" navigation
      if (Date.now() - gPressedAt.current < 900) {
        const target = navItems.find((n) => n.shortcut === key);
        gPressedAt.current = 0;
        if (target) {
          e.preventDefault();
          router.push(target.path);
        }
        return;
      }
      if (key === "G") gPressedAt.current = Date.now();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router, toggleCollapsed]);

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 76 : 260 }}
        transition={{ type: "spring", stiffness: 380, damping: 38 }}
        className="sticky top-0 hidden h-screen shrink-0 overflow-hidden border-r border-[var(--a-border)] bg-[var(--a-bg-elevated)] lg:block"
      >
        <Sidebar collapsed={collapsed} onToggle={toggleCollapsed} />
      </motion.aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-[280px] border-r border-[var(--a-border)] bg-[var(--a-bg-elevated)] lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 420, damping: 40 }}
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="a-focus absolute right-3 top-3.5 z-10 flex h-9 w-9 items-center justify-center rounded-lg text-[var(--a-text-muted)] hover:bg-white/5"
                aria-label="Close navigation"
              >
                <X className="h-5 w-5" />
              </button>
              <Sidebar collapsed={false} mobile onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main column */}
      <div className="relative flex min-w-0 flex-1 flex-col">
        <div className="a-grid-bg pointer-events-none absolute inset-x-0 top-0 h-[420px]" aria-hidden />
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[300px] w-[700px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[120px]"
          aria-hidden
        />
        <Topbar email={email} onOpenMobileNav={() => setMobileOpen(true)} onOpenPalette={() => setPaletteOpen(true)} />
        <main className="relative flex-1 px-4 py-8 sm:px-8 lg:px-10">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto w-full max-w-6xl"
          >
            {children}
          </motion.div>
        </main>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <ShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </div>
  );
}
