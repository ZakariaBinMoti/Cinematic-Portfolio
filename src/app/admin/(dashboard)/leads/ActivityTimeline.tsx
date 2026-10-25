"use client";

import { useMemo } from "react";
import {
  Sparkles,
  PhoneCall,
  Calendar,
  Mail,
  FileText,
  Clock,
  ArrowRight,
  Edit3,
  CheckCircle2,
  Bot,
  User,
  Activity as ActivityIcon,
} from "lucide-react";
import { SerializedActivity } from "./actions";

interface ActivityTimelineProps {
  activities: SerializedActivity[];
}

function formatTimelineDate(dateString: string) {
  try {
    const d = new Date(dateString);
    const now = new Date();
    const isToday =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      d.getDate() === yesterday.getDate() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getFullYear() === yesterday.getFullYear();

    if (isToday) return "Today";
    if (isYesterday) return "Yesterday";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "Earlier";
  }
}

function formatTimelineTime(dateString: string) {
  try {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "";
  }
}

function getActivityConfig(type: string) {
  switch (type) {
    case "created":
      return {
        icon: Sparkles,
        bg: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
        label: "Lead Created",
      };
    case "status_change":
      return {
        icon: ArrowRight,
        bg: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
        label: "Status Changed",
      };
    case "note_added":
      return {
        icon: FileText,
        bg: "bg-amber-500/10 text-amber-300 border-amber-500/20",
        label: "Note Logged",
      };
    case "call":
      return {
        icon: PhoneCall,
        bg: "bg-rose-500/10 text-rose-300 border-rose-500/20",
        label: "Call Logged",
      };
    case "meeting":
      return {
        icon: Calendar,
        bg: "bg-violet-500/10 text-violet-300 border-violet-500/20",
        label: "Meeting Held",
      };
    case "email_sent":
      return {
        icon: Mail,
        bg: "bg-blue-500/10 text-blue-300 border-blue-500/20",
        label: "Email Outreach",
      };
    case "follow_up_set":
      return {
        icon: Clock,
        bg: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
        label: "Follow-up Scheduled",
      };
    default:
      return {
        icon: ActivityIcon,
        bg: "bg-white/5 text-gray-300 border-white/10",
        label: "Activity",
      };
  }
}

export default function ActivityTimeline({ activities }: ActivityTimelineProps) {
  // Group activities by Date (Today, Yesterday, Date string)
  const grouped = useMemo(() => {
    const map = new Map<string, SerializedActivity[]>();
    for (const act of activities) {
      const dateKey = formatTimelineDate(act.createdAt);
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(act);
    }
    return Array.from(map.entries());
  }, [activities]);

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="h-10 w-10 rounded-xl bg-white/5 text-gray-400 flex items-center justify-center mb-2">
          <ActivityIcon className="h-5 w-5" />
        </div>
        <p className="text-xs text-[var(--a-text-subtle)]">No interaction history recorded yet.</p>
        <p className="text-[11px] text-[var(--a-text-subtle)] mt-0.5">
          Activities, calls, emails, and status changes will automatically appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="relative space-y-6">
      {grouped.map(([dateGroup, items]) => (
        <div key={dateGroup} className="relative">
          {/* Group header pill */}
          <div className="sticky top-0 z-10 mb-4 inline-block">
            <span className="rounded-full border border-white/10 bg-[var(--a-surface)] px-3 py-1 text-[11px] font-semibold text-[var(--a-text-muted)] shadow-md">
              {dateGroup}
            </span>
          </div>

          {/* Timeline items with connector line */}
          <div className="relative border-l border-white/10 ml-3.5 space-y-5 pb-2">
            {items.map((item) => {
              const config = getActivityConfig(item.type);
              const Icon = config.icon;

              return (
                <div key={item._id} className="relative pl-6 group">
                  {/* Timeline node icon */}
                  <div
                    className={`absolute -left-3.5 top-0.5 flex h-7 w-7 items-center justify-center rounded-lg border shadow-md transition-transform group-hover:scale-110 ${config.bg}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>

                  {/* Content Card */}
                  <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs hover:border-white/15 transition-all">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-semibold text-[var(--a-text)]">{config.label}</span>
                      <span className="font-mono text-[10px] text-[var(--a-text-subtle)]">
                        {formatTimelineTime(item.createdAt)}
                      </span>
                    </div>

                    <p className="text-zinc-300 leading-relaxed text-xs">{item.description}</p>

                    <div className="mt-2 flex items-center justify-between text-[10px] text-[var(--a-text-subtle)] border-t border-white/5 pt-1.5">
                      <span className="flex items-center gap-1">
                        {item.performedBy === "ai" ? (
                          <>
                            <Bot className="h-3 w-3 text-violet-400" />
                            <span>AI Companion</span>
                          </>
                        ) : (
                          <>
                            <User className="h-3 w-3 text-cyan-400" />
                            <span>{item.performedBy || "Zakaria"}</span>
                          </>
                        )}
                      </span>

                      {item.newValue && (
                        <span className="font-mono text-zinc-400">
                          {item.previousValue ? `${item.previousValue} → ` : ""}
                          <strong className="text-white">{item.newValue}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
