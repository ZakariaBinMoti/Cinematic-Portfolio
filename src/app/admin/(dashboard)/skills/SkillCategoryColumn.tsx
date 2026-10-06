"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Plus,
  X,
  Trash2,
  Pencil,
  Check,
  Sparkles,
} from "lucide-react";
import { Card, Badge, Button } from "../../_ui";
import { updateSkillDirect } from "./actions";
import { toast } from "sonner";

interface SkillGroup {
  _id: string;
  category: string;
  items: string[];
  order: number;
}

export default function SkillCategoryColumn({
  group,
  onDeleteGroup,
  onGroupUpdated,
}: {
  group: SkillGroup;
  onDeleteGroup: (group: SkillGroup) => void;
  onGroupUpdated: (updated: SkillGroup) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: group._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [categoryTitle, setCategoryTitle] = useState(group.category);

  // Inline add skill state
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [newSkillText, setNewSkillText] = useState("");

  const handleSaveTitle = async () => {
    if (!categoryTitle.trim()) return;
    setIsEditingTitle(false);
    try {
      const res = await updateSkillDirect(group._id, categoryTitle.trim(), group.items);
      if (res.success) {
        onGroupUpdated(res.skill);
        toast.success("Category renamed");
      }
    } catch {
      toast.error("Failed to rename category");
    }
  };

  const handleAddSkill = async () => {
    const text = newSkillText.trim();
    if (!text) {
      setIsAddingSkill(false);
      return;
    }

    if (group.items.includes(text)) {
      toast.error("Skill already exists in this category");
      return;
    }

    const updatedItems = [...group.items, text];
    setNewSkillText("");
    setIsAddingSkill(false);

    try {
      const res = await updateSkillDirect(group._id, group.category, updatedItems);
      if (res.success) {
        onGroupUpdated(res.skill);
        toast.success(`Added "${text}"`);
      }
    } catch {
      toast.error("Failed to add skill");
    }
  };

  const handleRemoveSkill = async (skillToRemove: string) => {
    const updatedItems = group.items.filter((s) => s !== skillToRemove);
    try {
      const res = await updateSkillDirect(group._id, group.category, updatedItems);
      if (res.success) {
        onGroupUpdated(res.skill);
        toast.success(`Removed "${skillToRemove}"`);
      }
    } catch {
      toast.error("Failed to remove skill");
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative ${isDragging ? "opacity-30 z-50 scale-95" : ""}`}
    >
      <Card className="h-full flex flex-col p-5 bg-gradient-to-b from-white/[0.04] to-white/[0.015] border-white/10 hover:border-white/20 transition-all duration-300">
        {/* Column Header */}
        <div className="flex items-center justify-between gap-2 pb-3.5 border-b border-white/5">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* Drag Handle */}
            <button
              {...attributes}
              {...listeners}
              className="p-1 rounded text-gray-500 hover:text-white cursor-grab active:cursor-grabbing hover:bg-white/5 transition-colors shrink-0"
              title="Drag column to reorder"
            >
              <GripVertical className="h-4 w-4" />
            </button>

            {isEditingTitle ? (
              <div className="flex items-center gap-1 flex-1">
                <input
                  type="text"
                  value={categoryTitle}
                  onChange={(e) => setCategoryTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveTitle();
                    if (e.key === "Escape") setIsEditingTitle(false);
                  }}
                  autoFocus
                  className="bg-black/50 text-sm font-semibold text-white px-2 py-0.5 rounded border border-violet-400 outline-none w-full"
                />
                <button
                  onClick={handleSaveTitle}
                  className="p-1 text-emerald-400 hover:text-emerald-300"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 truncate">
                <h3 className="font-semibold text-white text-sm truncate">{group.category}</h3>
                <button
                  onClick={() => setIsEditingTitle(true)}
                  className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-500 hover:text-gray-300 transition-opacity"
                  title="Rename"
                >
                  <Pencil className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs font-mono text-[var(--a-text-subtle)] px-2 py-0.5 rounded bg-white/5">
              {group.items.length}
            </span>
            <button
              onClick={() => onDeleteGroup(group)}
              className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              title="Delete category"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Skill Chips Area */}
        <div className="py-4 flex-1 flex flex-wrap content-start gap-2 min-h-[140px]">
          {group.items.map((skill) => (
            <span
              key={skill}
              className="group/chip inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 hover:border-white/15 text-xs font-medium text-gray-200 transition-all shadow-sm"
            >
              {skill}
              <button
                type="button"
                onClick={() => handleRemoveSkill(skill)}
                className="text-gray-500 hover:text-red-400 transition-colors"
                title={`Remove ${skill}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}

          {/* Inline Add Skill Pill */}
          {isAddingSkill ? (
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-violet-500/10 border border-violet-500/30">
              <input
                type="text"
                value={newSkillText}
                onChange={(e) => setNewSkillText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddSkill();
                  if (e.key === "Escape") setIsAddingSkill(false);
                }}
                onBlur={handleAddSkill}
                placeholder="Skill name..."
                autoFocus
                className="bg-transparent text-xs text-white placeholder:text-violet-300/50 outline-none w-24"
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsAddingSkill(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-dashed border-white/10 hover:border-violet-400/40 text-xs text-gray-400 hover:text-violet-300 hover:bg-violet-500/5 transition-all"
            >
              <Plus className="h-3 w-3" /> Add Skill
            </button>
          )}
        </div>
      </Card>
    </div>
  );
}
