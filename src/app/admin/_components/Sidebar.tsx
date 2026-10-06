"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ExternalLink, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "../_ui";
import { isActive, navItems } from "./nav";

export default function Sidebar({
  collapsed,
  onToggle,
  onNavigate,
  mobile = false,
}: {
  collapsed: boolean;
  onToggle?: () => void;
  onNavigate?: () => void;
  mobile?: boolean;
}) {
  const pathname = usePathname();
  const compact = collapsed && !mobile;

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className={cn("flex h-16 items-center gap-3 px-4", compact && "justify-center px-0")}>
        <Link
          href="/admin"
          onClick={onNavigate}
          className="a-focus flex items-center gap-3 rounded-xl"
          aria-label="Admin home"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--a-gradient)] shadow-[0_8px_20px_-8px_rgba(139,92,246,0.9)]">
            <span className="text-sm font-bold text-white">Z</span>
          </span>
          {!compact && (
            <span className="leading-tight">
              <span className="block text-sm font-semibold">Portfolio Studio</span>
              <span className="block text-[11px] text-[var(--a-text-subtle)]">Admin console</span>
            </span>
          )}
        </Link>
      </div>

      {/* Nav */}
      <nav className="mt-2 flex-1 space-y-1 px-3" aria-label="Admin">
        {!compact && (
          <p className="px-3 pb-2 pt-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--a-text-subtle)]">
            Manage
          </p>
        )}
        {navItems.map((item) => {
          const active = isActive(pathname, item.path);
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              id={`nav-${item.name.toLowerCase()}`}
              href={item.path}
              onClick={onNavigate}
              title={compact ? item.name : undefined}
              aria-current={active ? "page" : undefined}
              className={cn(
                "a-focus group relative flex h-10 items-center gap-3 rounded-xl px-3 text-sm transition-colors",
                compact && "justify-center px-0",
                active ? "text-white" : "text-[var(--a-text-muted)] hover:text-[var(--a-text)]"
              )}
            >
              {active && (
                <motion.span
                  layoutId={mobile ? "nav-pill-mobile" : "nav-pill"}
                  className="absolute inset-0 rounded-xl border border-white/10 bg-white/[0.07] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                  transition={{ type: "spring", stiffness: 400, damping: 34 }}
                />
              )}
              {!active && (
                <span className="absolute inset-0 rounded-xl bg-white/0 transition-colors group-hover:bg-white/[0.035]" />
              )}
              {active && (
                <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[var(--a-gradient)]" />
              )}
              <Icon
                className={cn(
                  "relative h-[18px] w-[18px] shrink-0 transition-colors",
                  active ? "text-violet-300" : "text-[var(--a-text-subtle)] group-hover:text-[var(--a-text-muted)]"
                )}
              />
              {!compact && <span className="relative">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="space-y-1 border-t border-[var(--a-border)] p-3">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          title={compact ? "View live site" : undefined}
          className={cn(
            "a-focus flex h-10 items-center gap-3 rounded-xl px-3 text-sm text-[var(--a-text-muted)] transition-colors hover:bg-white/[0.035] hover:text-[var(--a-text)]",
            compact && "justify-center px-0"
          )}
        >
          <ExternalLink className="h-[18px] w-[18px] shrink-0 text-[var(--a-text-subtle)]" />
          {!compact && "View live site"}
        </a>
        {onToggle && (
          <button
            id="sidebar-toggle"
            onClick={onToggle}
            title={compact ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "a-focus flex h-10 w-full items-center gap-3 rounded-xl px-3 text-sm text-[var(--a-text-muted)] transition-colors hover:bg-white/[0.035] hover:text-[var(--a-text)]",
              compact && "justify-center px-0"
            )}
          >
            {compact ? (
              <PanelLeftOpen className="h-[18px] w-[18px] text-[var(--a-text-subtle)]" />
            ) : (
              <PanelLeftClose className="h-[18px] w-[18px] text-[var(--a-text-subtle)]" />
            )}
            {!compact && "Collapse"}
          </button>
        )}
      </div>
    </div>
  );
}
