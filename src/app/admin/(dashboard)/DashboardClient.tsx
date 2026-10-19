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
  Award,
  BookOpen,
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
  type: string;
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
    caseStudiesCount: number;
    blogsCount: number;
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
      title: "Case Studies",
      count: stats.caseStudiesCount,
      sub: "Client benchmarks & metrics",
      icon: Award,
      href: "/admin/case-studies",
      accent: "from-emerald-500/20 to-teal-500/5",
      glow: "rgba(16,185,129,0.15)",
    },
    {
      title: "Blog Articles",
      count: stats.blogsCount,
      sub: "Technical SEO guides",
      icon: BookOpen,
      href: "/admin/blog",
      accent: "from-cyan-500/20 to-blue-500/5",
      glow: "rgba(6,182,212,0.15)",
    },
    {
      title: "Experience",
      count: stats.experiencesCount,
      sub: "Career timeline milestones",
      icon: Briefcase,
      href: "/admin/experience",
      accent: "from-blue-500/20 to-indigo-500/5",
      glow: "rgba(59,130,246,0.15)",
    },
    {
      title: "Skills",
      count: stats.skillsCount,
      sub: `Across ${stats.skillsGroupCount} categories`,
      icon: Sparkles,
      href: "/admin/skills",
      accent: "from-amber-500/20 to-orange-500/5",
      glow: "rgba(245,158,11,0.15)",
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
        description="Monitor portfolio health, update live showcases, publish case studies, and manage SEO articles."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/admin/case-studies?new=1">
              <Button size="sm" variant="secondary" className="gap-1.5 text-xs text-emerald-300 hover:text-white">
                <Plus className="h-3.5 w-3.5" /> Case Study
              </Button>
            </Link>
            <Link href="/admin/blog?new=1">
              <Button size="sm" variant="secondary" className="gap-1.5 text-xs text-cyan-300 hover:text-white">
                <Plus className="h-3.5 w-3.5" /> Blog Article
              </Button>
            </Link>
            <Link href="/admin/projects?new=1">
              <Button size="sm" className="gap-1.5 text-xs shadow-lg">
                <Plus className="h-3.5 w-3.5" /> New Project
              </Button>
            </Link>
            <a href="/" target="_blank" rel="noreferrer">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <ExternalLink className="h-3.5 w-3.5" /> View Live
              </Button>
            </a>
          </div>
        }
      />

      {/* ── Stat Cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
            >
              <Link href={card.href} className="group block">
                <Card
                  className={`relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 bg-gradient-to-br ${card.accent}`}
                  style={{
                    boxShadow: `0 0 0 1px rgba(255, 255, 255, 0.05), 0 10px 30px -10px ${card.glow}`,
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-[var(--a-text-subtle)]">
                        {card.title}
                      </p>
                      <h3 className="mt-2 text-3xl font-bold tracking-tight text-white">
                        <AnimatedNumber value={card.count} />
                      </h3>
                      <p className="mt-1 text-xs text-[var(--a-text-muted)] group-hover:text-white/80 transition-colors">
                        {card.sub}
                      </p>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.08] text-white shadow-inner group-hover:scale-110 transition-transform">
                      <Icon className="h-5 w-5" />
                    </div>
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
                  <h2 className="text-lg font-semibold text-white">Content Health & SEO</h2>
                  <Badge tone={healthScore >= 80 ? "green" : healthScore >= 50 ? "amber" : "red"}>
                    {healthScore}% Ready
                  </Badge>
                </div>
                <p className="text-xs text-[var(--a-text-muted)] mt-1">
                  Readiness score calculated across all showcase, case study, and blog sections
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full sm:w-44">
                <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                  <motion.div
                    className="h-full bg-gradient-to-r from-violet-500 via-emerald-500 to-cyan-400 rounded-full"
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
              <Link href="/admin/case-studies" className="group">
                <div className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] hover:border-emerald-500/30 transition-all flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-300">
                      <Award className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-white group-hover:text-emerald-200">Case Studies</p>
                      <p className="text-xs text-[var(--a-text-subtle)]">Manage client architectures</p>
                    </div>
                  </div>
                  <Kbd>G K</Kbd>
                </div>
              </Link>

              <Link href="/admin/blog" className="group">
                <div className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] hover:border-cyan-500/30 transition-all flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="p-2 rounded-lg bg-cyan-500/10 text-cyan-300">
                      <BookOpen className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-white group-hover:text-cyan-200">SEO Blog Articles</p>
                      <p className="text-xs text-[var(--a-text-subtle)]">Edit technical guides</p>
                    </div>
                  </div>
                  <Kbd>G B</Kbd>
                </div>
              </Link>

              <Link href="/admin/projects" className="group">
                <div className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/15 transition-all flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="p-2 rounded-lg bg-violet-500/10 text-violet-300">
                      <FolderKanban className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-white group-hover:text-violet-200">Projects Showcase</p>
                      <p className="text-xs text-[var(--a-text-subtle)]">Reorder selected work</p>
                    </div>
                  </div>
                  <Kbd>G P</Kbd>
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
              Changes saved in the admin console are automatically compiled and reflected instantaneously across your live
              routes (/case-studies, /blog, /sitemap.xml).
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
