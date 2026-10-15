"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2, Calendar, MapPin, Building2, Eye, EyeOff } from "lucide-react";
import { Card, Badge, Button } from "../../_ui";

interface Experience {
  _id: string;
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate: string;
  description: string;
  order: number;
  isVisible?: boolean;
}

export default function SortableExperienceCard({
  experience,
  onEdit,
  onDelete,
  onToggleVisibility,
}: {
  experience: Experience;
  onEdit: (exp: Experience) => void;
  onDelete: (exp: Experience) => void;
  onToggleVisibility: (exp: Experience) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: experience._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isCurrent = experience.endDate?.toLowerCase() === "present";
  const isHidden = experience.isVisible === false;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative ${isDragging ? "opacity-30 z-50 scale-98" : ""}`}
    >
      <Card className={`p-6 transition-all duration-300 hover:border-white/20 hover:shadow-xl ${
        isHidden
          ? "bg-gradient-to-r from-amber-950/20 to-black/40 border-amber-500/20 opacity-80"
          : "bg-gradient-to-r from-white/[0.03] to-white/[0.01]"
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Drag Handle */}
            <button
              {...attributes}
              {...listeners}
              className="mt-1 p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 cursor-grab active:cursor-grabbing transition-colors shrink-0"
              title="Drag to reorder timeline"
            >
              <GripVertical className="h-4 w-4" />
            </button>

            {/* Timeline indicator & Content */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="text-base font-semibold text-white group-hover:text-violet-200 transition-colors">
                  {experience.title}
                </h3>
                <span className="text-gray-500">•</span>
                <span className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-violet-400" />
                  {experience.company}
                </span>
                {isCurrent && <Badge tone="green">Current Role</Badge>}
                {isHidden && <Badge tone="amber">Hidden</Badge>}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--a-text-muted)]">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-[var(--a-text-subtle)]" />
                  {experience.startDate} — {experience.endDate}
                </span>
                {experience.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-[var(--a-text-subtle)]" />
                    {experience.location}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 ml-auto sm:ml-0 shrink-0">
            <button
              type="button"
              onClick={() => onToggleVisibility(experience)}
              className={`h-8 px-2 rounded-lg text-xs flex items-center gap-1.5 transition-all ${
                isHidden
                  ? "bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25"
                  : "bg-white/[0.04] border border-white/5 text-gray-300 hover:text-white hover:bg-white/[0.08]"
              }`}
              title={isHidden ? "Hidden from live site (click to show)" : "Visible on live site (click to hide)"}
            >
              {isHidden ? (
                <>
                  <EyeOff className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-[11px] font-medium hidden sm:inline">Hidden</span>
                </>
              ) : (
                <>
                  <Eye className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-[11px] font-medium text-emerald-300 hidden sm:inline">Live</span>
                </>
              )}
            </button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(experience)}
              className="h-8 px-2.5 text-xs gap-1 text-gray-300 hover:text-white"
            >
              <Pencil className="h-3 w-3" /> Edit
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDelete(experience)}
              className="h-8 px-2 text-xs text-red-400 hover:text-red-300"
              title="Delete milestone"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Description body */}
        <div className="mt-4 pl-12 border-l border-white/10 ml-4 space-y-1.5">
          <p className="text-xs text-[var(--a-text-muted)] whitespace-pre-line leading-relaxed">
            {experience.description}
          </p>
        </div>
      </Card>
    </div>
  );
}
