"use client";

import Image from "next/image";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2, ExternalLink, Image as ImageIcon } from "lucide-react";
import { Card, Badge, Button } from "../../_ui";

interface Project {
  _id: string;
  title: string;
  description: string;
  techStack: string[];
  liveLink?: string;
  imageUrl?: string;
  order: number;
}

export default function SortableProjectCard({
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
      className={`group relative ${isDragging ? "opacity-30 z-50 scale-95" : ""}`}
    >
      <Card className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:border-white/20 hover:shadow-xl bg-gradient-to-b from-white/[0.035] to-white/[0.01]">
        {/* Top Cover Thumbnail with Drag Handle Overlay */}
        <div className="relative aspect-[16/10] w-full bg-black/40 overflow-hidden border-b border-white/5">
          {project.imageUrl ? (
            <Image
              src={project.imageUrl}
              alt={project.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 bg-white/[0.01]">
              <ImageIcon className="h-8 w-8 mb-1.5 opacity-40" />
              <span className="text-xs">No cover image</span>
            </div>
          )}

          {/* Drag Handle button on top-left of image */}
          <button
            {...attributes}
            {...listeners}
            className="absolute top-2.5 left-2.5 p-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-gray-400 hover:text-white hover:bg-black/80 transition-all cursor-grab active:cursor-grabbing shadow-md z-10"
            title="Drag to reorder"
          >
            <GripVertical className="h-4 w-4" />
          </button>

          {/* Live Link Button on top-right of image */}
          {project.liveLink && (
            <a
              href={project.liveLink.startsWith("http") ? project.liveLink : `https://${project.liveLink}`}
              target="_blank"
              rel="noreferrer"
              className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-gray-300 hover:text-white hover:bg-black/80 transition-all shadow-md z-10"
              title="Visit live site"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-white text-base leading-snug line-clamp-1 group-hover:text-violet-200 transition-colors">
                {project.title}
              </h3>
            </div>

            <p className="mt-2 text-xs text-[var(--a-text-muted)] line-clamp-2 leading-relaxed">
              {project.description}
            </p>

            {/* Tech badges */}
            {project.techStack && project.techStack.length > 0 && (
              <div className="mt-3.5 flex flex-wrap gap-1.5">
                {project.techStack.slice(0, 4).map((tech) => (
                  <span
                    key={tech}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/5 text-gray-300 font-medium"
                  >
                    {tech}
                  </span>
                ))}
                {project.techStack.length > 4 && (
                  <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-white/[0.03] text-gray-500 font-medium">
                    +{project.techStack.length - 4}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="mt-5 pt-3.5 border-t border-white/5 flex items-center justify-between">
            <span className="text-[11px] font-mono text-[var(--a-text-subtle)]">#{project.order + 1}</span>
            <div className="flex items-center gap-1.5">
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
        </div>
      </Card>
    </div>
  );
}
