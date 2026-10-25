"use client";

import Link from "next/link";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Building2,
  Globe,
  DollarSign,
  GripVertical,
  ArrowUpRight,
  Edit3,
  Bot,
  Flame,
  Phone,
  Mail,
  Trash2,
} from "lucide-react";
import { SerializedLead } from "./actions";

interface KanbanLeadCardProps {
  lead: SerializedLead;
  onEdit: (lead: SerializedLead) => void;
  onDelete?: (lead: SerializedLead) => void;
  isOverlay?: boolean;
}

const PRIORITY_DOTS: Record<string, string> = {
  urgent: "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.6)]",
  high: "bg-orange-400",
  medium: "bg-amber-400",
  low: "bg-emerald-400",
};

const CHANNEL_ICONS: Record<string, string> = {
  website: "🤖",
  linkedin: "🔗",
  google_maps: "🗺️",
  referral: "🤝",
  cold_outreach: "📧",
  direct: "📥",
  other: "🌐",
};

export default function KanbanLeadCard({ lead, onEdit, onDelete, isOverlay }: KanbanLeadCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: lead._id,
    disabled: isOverlay,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

  const priorityDot = PRIORITY_DOTS[lead.priority || "medium"] || PRIORITY_DOTS.medium;
  const channelIcon = CHANNEL_ICONS[lead.channel || lead.source] || "🌐";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-xl border border-white/10 bg-[var(--a-surface)] p-3.5 shadow-sm transition-all select-none hover:border-white/20 hover:bg-white/[0.04] ${
        isOverlay ? "rotate-2 scale-105 shadow-2xl border-violet-500/50 bg-gray-900/95 cursor-grabbing z-50" : ""
      }`}
    >
      {/* Top Header: Drag Handle + Priority + Lead Score + Actions */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-white p-0.5 rounded transition-colors"
            title="Drag to change pipeline stage"
          >
            <GripVertical className="h-3.5 w-3.5" />
          </div>

          {/* Priority Dot */}
          <span
            className={`h-2 w-2 rounded-full ${priorityDot}`}
            title={`Priority: ${lead.priority || "medium"}`}
          />

          {/* Channel Icon */}
          <span className="text-xs" title={`Acquisition Channel: ${lead.channel || "website"}`}>
            {channelIcon}
          </span>
        </div>

        {/* Lead Score & Actions */}
        <div className="flex items-center gap-1">
          {typeof lead.leadScore === "number" && lead.leadScore > 0 && (
            <span className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-semibold bg-violet-500/10 text-violet-300 border border-violet-500/20">
              <Flame className="h-2.5 w-2.5 text-violet-400" />
              {lead.leadScore}
            </span>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(lead);
            }}
            className="h-6 w-6 rounded flex items-center justify-center text-[var(--a-text-subtle)] hover:text-white hover:bg-white/10 transition-colors"
            title="Edit lead"
          >
            <Edit3 className="h-3 w-3" />
          </button>

          <Link
            href={`/admin/leads/${lead._id}`}
            onClick={(e) => e.stopPropagation()}
            className="h-6 w-6 rounded flex items-center justify-center text-[var(--a-text-subtle)] hover:text-white hover:bg-white/10 transition-colors"
            title="Open lead profile & timeline"
          >
            <ArrowUpRight className="h-3 w-3" />
          </Link>

          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(lead);
              }}
              className="h-6 w-6 rounded flex items-center justify-center text-rose-400/70 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Delete lead"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Main Info: Name & Company */}
      <Link
        href={`/admin/leads/${lead._id}`}
        className="block min-w-0"
      >
        <h4 className="text-sm font-semibold text-[var(--a-text)] truncate hover:text-violet-300 transition-colors">
          {lead.company || lead.name || lead.email}
        </h4>
        {lead.company && lead.name && (
          <p className="text-xs text-[var(--a-text-subtle)] truncate mt-0.5">
            {lead.name}
          </p>
        )}
      </Link>

      {/* Store / Website URL preview */}
      {lead.storeUrl && (
        <div className="mt-2 flex items-center gap-1 text-[11px] text-cyan-300/80 truncate font-mono">
          <Globe className="h-3 w-3 shrink-0" />
          <span className="truncate">{lead.storeUrl.replace(/^https?:\/\//, "")}</span>
        </div>
      )}

      {/* Financials & Platform Row */}
      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-1 border-t border-white/5 pt-2 text-xs">
        <span className="font-semibold text-emerald-400">
          {lead.estimatedValue ? `$${lead.estimatedValue.toLocaleString()}` : lead.projectBudget || "Budget TBD"}
        </span>

        {lead.currentPlatform && (
          <span className="text-[10px] text-zinc-400 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/5">
            {lead.currentPlatform}
          </span>
        )}
      </div>

      {/* Tags */}
      {Array.isArray(lead.tags) && lead.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {lead.tags.slice(0, 3).map((t) => (
            <span
              key={t}
              className="text-[10px] text-zinc-400 bg-white/[0.02] px-1.5 py-0.2 rounded border border-white/5"
            >
              #{t}
            </span>
          ))}
          {lead.tags.length > 3 && (
            <span className="text-[10px] text-zinc-500">+{lead.tags.length - 3}</span>
          )}
        </div>
      )}
    </div>
  );
}
