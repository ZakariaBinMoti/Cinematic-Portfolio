"use client";

import Image from "next/image";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2, ExternalLink, Image as ImageIcon } from "lucide-react";
import { Button } from "../../_ui";

interface Project {
  _id: string;
  title: string;
  description: string;
  techStack: string[];
  liveLink?: string;
  imageUrl?: string;
  order: number;
}

export default function SortableProjectRow({
  project,
  onEdit,
  onDelete,
}: {
  project: Project;
  onEdit: (p: Project) => void;
  onDelete: (p: Project) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: project._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-4 p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-colors ${
        isDragging ? "opacity-30 z-50 scale-98" : ""
      }`}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="p-2 text-gray-500 hover:text-white cursor-grab active:cursor-grabbing rounded-lg hover:bg-white/5 transition-colors shrink-0"
        title="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Index Badge */}
      <span className="text-xs font-mono text-[var(--a-text-subtle)] w-6 text-center shrink-0">
        #{project.order + 1}
      </span>

      {/* Thumbnail */}
      <div className="relative h-12 w-16 rounded-lg overflow-hidden bg-black/40 border border-white/5 shrink-0">
        {project.imageUrl ? (
          <Image src={project.imageUrl} alt={project.title} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600">
            <ImageIcon className="h-5 w-5" />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold text-white truncate">{project.title}</h4>
          {project.liveLink && (
            <a
              href={project.liveLink.startsWith("http") ? project.liveLink : `https://${project.liveLink}`}
              target="_blank"
              rel="noreferrer"
              className="text-gray-400 hover:text-violet-300"
              title="Open external link"
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
        <p className="text-xs text-[var(--a-text-muted)] truncate max-w-lg mt-0.5">{project.description}</p>
      </div>

      {/* Tech pills */}
      <div className="hidden md:flex items-center gap-1 shrink-0 max-w-[200px] overflow-hidden">
        {project.techStack?.slice(0, 3).map((t) => (
          <span key={t} className="text-[11px] px-2 py-0.5 rounded bg-white/5 text-gray-300">
            {t}
          </span>
        ))}
        {(project.techStack?.length || 0) > 3 && (
          <span className="text-[10px] text-gray-500">+{project.techStack.length - 3}</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 shrink-0 ml-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(project)}
          className="h-8 px-2.5 text-xs gap-1 text-gray-300 hover:text-white"
        >
          <Pencil className="h-3 w-3" /> Edit
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={() => onDelete(project)}
          className="h-8 px-2 text-xs text-red-400 hover:text-red-300"
          title="Delete project"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
