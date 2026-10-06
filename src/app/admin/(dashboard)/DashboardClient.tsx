"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FolderKanban,
  Briefcase,
  Sparkles,
  FileText,
  Plus,
  ExternalLink,
  ArrowUpRight,
  CircleCheck,
  CircleAlert,
  Clock,
  Activity,
  Zap,
  Layers,
} from "lucide-react";
import { Card, Badge, Button, Kbd, PageHeader } from "../_ui";

interface StatItem {
  title: string;
  count: number;
  sub: string;
  icon: any;
  href: string;
  accent: string;
  glow: string;
}

interface ActivityItem {
  id: string;
  type: "project" | "experience" | "skill" | "content";
  title: string;
  action: string;
  timeAgo: string;
}

interface HealthCheck {
  id: string;
  label: string;
  passed: boolean;
  hint: string;
  href: string;
}

interface DashboardClientProps {
  stats: {
    projectsCount: number;
    projectsWithImages: number;
    experiencesCount: number;
    skillsCount: number;
    skillsGroupCount: number;
    heroConfigured: boolean;
    aboutConfigured: boolean;
  };
  healthChecks: HealthCheck[];
  healthScore: number;
  recentActivity: ActivityItem[];
  userEmail: string;
}

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 800; // ms
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplay(Math.round(start + (value - start) * eased));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return <span>{display}</span>;
}

export default function DashboardClient({
  stats,
  healthChecks,
  healthScore,
  recentActivity,
  userEmail,
}: DashboardClientProps) {
  const statCards: StatItem[] = [
    {
      title: "Projects",
      count: stats.projectsCount,
      sub: `${stats.projectsWithImages} with cover media`,
      icon: FolderKanban,
      href: "/admin/projects",
      accent: "from-violet-500/20 to-purple-500/5",
      glow: "rgba(139,92,246,0.15)",
    },
    {
      title: "Experience",
      count: stats.experiencesCount,
      sub: "Career timeline milestones",
      icon: Briefcase,
      href: "/admin/experience",
      accent: "from-blue-500/20 to-cyan-500/5",
      glow: "rgba(59,130,246,0.15)",
    },
    {
      title: "Skills",
      count: stats.skillsCount,
      sub: `Across ${stats.skillsGroupCount} categories`,
      icon: Sparkles,
      href: "/admin/skills",
      accent: "from-cyan-500/20 to-emerald-500/5",
      glow: "rgba(6,182,212,0.15)",
    },
    {
      title: "Content Studio",
      count: 5,
      sub: "Hero, About, Metrics, Edu, Contact",
      icon: FileText,
      href: "/admin/content",
      accent: "from-pink-500/20 to-rose-500/5",
      glow: "rgba(244,114,182,0.15)",
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Mission Control"
        title="Portfolio Overview"
        description="Monitor portfolio health, update live showcases, and manage content in real time."
        actions={
          <div className="flex items-center gap-2.5">
            <Link href="/admin/projects?new=1">
              <Button size="sm" className="gap-1.5 shadow-lg">
                <Plus className="h-4 w-4" /> New Project
              </Button>
            </Link>
            <a href="/" target="_blank" rel="noreferrer">
              <Button variant="outline" size="sm" className="gap-1.5">
                <ExternalLink className="h-3.5 w-3.5" /> View Live
              </Button>
            </a>
          </div>
        }
      />

      {/* ── Stat Cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
            >
              <Link href={card.href} className="block group">
                <Card className="relative overflow-hidden p-5 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-white/20">
                  <div
                    className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full blur-2xl transition-opacity duration-300 opacity-40 group-hover:opacity-100"
                    style={{ background: card.glow }}
                  />
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white transition-colors group-hover:bg-white/[0.08]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-[var(--a-text-subtle)] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white" />
                  </div>
                  <div className="mt-4">
                    <p className="text-3xl font-bold tracking-tight text-white">
                      <AnimatedNumber value={card.count} />
                    </p>
                    <p className="mt-1 text-sm font-medium text-[var(--a-text)]">{card.title}</p>
                    <p className="text-xs text-[var(--a-text-muted)] mt-0.5">{card.sub}</p>
                  </div>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* ── Split Section: Health & Quick Actions / Recent Activity ── */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Content Health & Readiness (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-[var(--a-border)]">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-white">Content Health</h2>
                  <Badge tone={healthScore >= 80 ? "green" : healthScore >= 50 ? "amber" : "red"}>
                    {healthScore}% Ready
                  </Badge>
                </div>
                <p className="text-xs text-[var(--a-text-muted)] mt-1">
                  Readiness score calculated across all showcase sections
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full sm:w-44">
                <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                  <motion.div
                    className="h-full bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${healthScore}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>

            {/* Checklist items */}
            <div className="divide-y divide-white/[0.04] mt-3">
              {healthChecks.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {item.passed ? (
                      <CircleCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                    ) : (
                      <CircleAlert className="h-4 w-4 text-amber-400 shrink-0" />
                    )}
                    <div>
                      <p className={`text-sm font-medium ${item.passed ? "text-white" : "text-gray-300"}`}>
                        {item.label}
                      </p>
                      <p className="text-xs text-[var(--a-text-subtle)]">{item.hint}</p>
                    </div>
                  </div>
                  {!item.passed && (
                    <Link href={item.href}>
                      <Button variant="ghost" size="sm" className="text-xs gap-1 text-violet-300 hover:text-white">
                        Resolve <ArrowUpRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Shortcuts */}
          <Card className="p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--a-text-subtle)] mb-4">
              Quick Management Shortcuts
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <Link href="/admin/projects" className="group">
                <div className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/15 transition-all flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="p-2 rounded-lg bg-violet-500/10 text-violet-300">
                      <FolderKanban className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-white group-hover:text-violet-200">Reorder Projects</p>
                      <p className="text-xs text-[var(--a-text-subtle)]">Drag & drop selected work</p>
                    </div>
                  </div>
                  <Kbd>G P</Kbd>
                </div>
              </Link>

              <Link href="/admin/skills" className="group">
                <div className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/15 transition-all flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="p-2 rounded-lg bg-cyan-500/10 text-cyan-300">
                      <Sparkles className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-white group-hover:text-cyan-200">Organize Skills</p>
                      <p className="text-xs text-[var(--a-text-subtle)]">Manage technical arsenal</p>
                    </div>
                  </div>
                  <Kbd>G S</Kbd>
                </div>
              </Link>

              <Link href="/admin/experience" className="group">
                <div className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/15 transition-all flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="p-2 rounded-lg bg-blue-500/10 text-blue-300">
                      <Briefcase className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-white group-hover:text-blue-200">Update Experience</p>
                      <p className="text-xs text-[var(--a-text-subtle)]">Career milestones & roles</p>
                    </div>
                  </div>
                  <Kbd>G E</Kbd>
                </div>
              </Link>

              <Link href="/admin/content" className="group">
                <div className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/15 transition-all flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="p-2 rounded-lg bg-pink-500/10 text-pink-300">
                      <FileText className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-white group-hover:text-pink-200">Hero & About Copy</p>
                      <p className="text-xs text-[var(--a-text-subtle)]">Narrative text sections</p>
                    </div>
                  </div>
                  <Kbd>G C</Kbd>
                </div>
              </Link>
            </div>
          </Card>
        </div>

        {/* Right: Activity & Live Preview Status (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Live Preview Card */}
          <Card className="p-6 relative overflow-hidden bg-gradient-to-br from-white/[0.04] to-white/[0.01]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </span>
                <span className="text-sm font-semibold text-white">Live Portfolio Status</span>
              </div>
              <Badge tone="cyan">120 Frames Sync</Badge>
            </div>

            <p className="text-xs text-[var(--a-text-muted)] leading-relaxed mb-4">
              Changes saved in the admin console are automatically compiled and reflected instantaneously on your live
              domain.
            </p>

            <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between mb-4">
              <span className="text-xs text-gray-400 font-mono truncate max-w-[200px]">http://localhost:3000</span>
              <a href="/" target="_blank" rel="noreferrer">
                <Button size="sm" variant="secondary" className="text-xs h-7 gap-1">
                  Preview <ExternalLink className="h-3 w-3" />
                </Button>
              </a>
            </div>

            <div className="flex items-center gap-4 text-xs text-[var(--a-text-subtle)]">
              <span className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-300" /> Fast Caching
              </span>
              <span className="flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-violet-300" /> SSR Active
              </span>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-violet-400" />
                <h3 className="text-sm font-semibold text-white">Recent Updates</h3>
              </div>
              <span className="text-xs text-[var(--a-text-subtle)]">Database sync</span>
            </div>

            {recentActivity.length === 0 ? (
              <p className="text-xs text-[var(--a-text-muted)] py-4 text-center">No recent records modified.</p>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((item, idx) => (
                  <div key={item.id || idx} className="flex items-start gap-3 text-xs">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/5 border border-white/5 text-[var(--a-text-subtle)]">
                      <Clock className="h-3 w-3" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-200 truncate">{item.title}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[var(--a-text-subtle)]">
                        <span className="capitalize">{item.type}</span>
                        <span>•</span>
                        <span>{item.timeAgo}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
