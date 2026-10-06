"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, ExternalLink, LogOut, Menu, Search } from "lucide-react";
import { Kbd } from "../_ui";
import { isActive, navItems } from "./nav";

export default function Topbar({
  email,
  onOpenMobileNav,
  onOpenPalette,
}: {
  email: string;
  onOpenMobileNav: () => void;
  onOpenPalette: () => void;
}) {
  const pathname = usePathname();
  const current = navItems.find((n) => n.path !== "/admin" && isActive(pathname, n.path));
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform));
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const initial = email.charAt(0).toUpperCase() || "A";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[var(--a-border)] bg-[rgba(7,7,11,0.72)] px-4 backdrop-blur-xl sm:px-6">
      <button
        id="mobile-nav-open"
        onClick={onOpenMobileNav}
        className="a-focus -ml-1 flex h-9 w-9 items-center justify-center rounded-lg text-[var(--a-text-muted)] hover:bg-white/5 hover:text-white lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-sm">
        <Link href="/admin" className="a-focus rounded text-[var(--a-text-subtle)] transition-colors hover:text-[var(--a-text)]">
          Studio
        </Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[var(--a-text-subtle)]" />
        <span className="truncate font-medium text-[var(--a-text)]">{current?.name ?? "Dashboard"}</span>
      </nav>

      <div className="ml-auto flex items-center gap-2">
        {/* Search / palette trigger */}
        <button
          id="command-palette-trigger"
          onClick={onOpenPalette}
          className="a-focus group hidden h-9 w-64 items-center gap-2.5 rounded-xl border border-[var(--a-border)] bg-white/[0.03] px-3 text-sm text-[var(--a-text-subtle)] transition-colors hover:border-[var(--a-border-strong)] hover:text-[var(--a-text-muted)] md:flex"
        >
          <Search className="h-4 w-4" />
          <span>Search or jump to…</span>
          <span className="ml-auto flex items-center gap-1">
            <Kbd>{isMac ? "⌘" : "Ctrl"}</Kbd>
            <Kbd>K</Kbd>
          </span>
        </button>
        <button
          onClick={onOpenPalette}
          className="a-focus flex h-9 w-9 items-center justify-center rounded-lg text-[var(--a-text-muted)] hover:bg-white/5 md:hidden"
          aria-label="Open command palette"
        >
          <Search className="h-[18px] w-[18px]" />
        </button>

        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="a-focus hidden h-9 items-center gap-2 rounded-xl px-3 text-sm text-[var(--a-text-muted)] transition-colors hover:bg-white/5 hover:text-[var(--a-text)] sm:flex"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          Live
          <ExternalLink className="h-3.5 w-3.5" />
        </a>

        {/* User menu */}
        <div className="relative" ref={menuRef}>
          <button
            id="user-menu-trigger"
            onClick={() => setMenuOpen((o) => !o)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="a-focus flex h-9 w-9 items-center justify-center rounded-full bg-[var(--a-gradient)] p-[1.5px]"
          >
            <span className="flex h-full w-full items-center justify-center rounded-full bg-[var(--a-bg-elevated)] text-sm font-semibold">
              {initial}
            </span>
          </button>
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                role="menu"
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 w-64 origin-top-right overflow-hidden rounded-2xl border border-[var(--a-border)] bg-[rgba(14,14,20,0.96)] p-1.5 shadow-[var(--a-shadow-lg)] backdrop-blur-xl"
              >
                <div className="px-3 py-2.5">
                  <p className="text-[11px] uppercase tracking-wider text-[var(--a-text-subtle)]">Signed in as</p>
                  <p className="mt-0.5 truncate text-sm font-medium">{email}</p>
                </div>
                <div className="my-1 h-px bg-[var(--a-border)]" />
                <button
                  id="sign-out"
                  role="menuitem"
                  onClick={() => signOut({ callbackUrl: "/admin/login" })}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-red-300 transition-colors hover:bg-red-500/10"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
