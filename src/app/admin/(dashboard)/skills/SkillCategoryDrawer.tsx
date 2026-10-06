"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Check, Sparkles, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button, Input, Label, Kbd } from "../../_ui";
import { addSkill } from "./actions";

interface SkillCategoryDrawerProps {
  open: boolean;
  onClose: () => void;
  onCreated: (newGroup: any) => void;
}

const CATEGORY_PRESETS = [
  "Core eCommerce & Shopify",
  "Frontend Architecture",
  "Animation & 3D Web",
  "Backend & APIs",
  "Tools & Performance",
];

export default function SkillCategoryDrawer({
  open,
  onClose,
  onCreated,
}: SkillCategoryDrawerProps) {
  const [category, setCategory] = useState("");
  const [items, setItems] = useState<string[]>([]);
  const [itemInput, setItemInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setCategory("");
      setItems([]);
      setItemInput("");
    }
  }, [open]);

  const handleAddItem = (tag: string) => {
    const trimmed = tag.trim().replace(/^,+|,+$/g, "");
    if (!trimmed) return;
    if (!items.includes(trimmed)) {
      setItems([...items, trimmed]);
    }
    setItemInput("");
  };

  const handleRemoveItem = (tag: string) => {
    setItems(items.filter((i) => i !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddItem(itemInput);
    } else if (e.key === "Backspace" && !itemInput && items.length > 0) {
      handleRemoveItem(items[items.length - 1]);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!category.trim()) {
      toast.error("Category name is required");
      return;
    }

    setSaving(true);
    const toastId = toast.loading("Creating category...");

    try {
      const formData = new FormData();
      formData.set("category", category.trim());
      formData.set("items", items.join(","));

      const res = await addSkill(formData);
      if (res.success) {
        toast.success("Skill category created", { id: toastId });
        onCreated(res.skill);
        onClose();
      } else {
        toast.error("Failed to create category", { id: toastId });
      }
    } catch (err: any) {
      toast.error(err?.message || "An error occurred", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="relative z-10 w-full max-w-xl bg-[#0e0e14] border-l border-white/10 shadow-2xl flex flex-col h-full overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.01]">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">New Skill Category</h2>
                <p className="text-xs text-[var(--a-text-muted)] mt-0.5">
                  Organize your technical capabilities into distinct domain columns
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form id="skill-cat-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <Label htmlFor="cat-name">Category Title *</Label>
                <Input
                  id="cat-name"
                  placeholder="e.g. Modern Frontend Architecture"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                />
              </div>

              {/* Suggestions */}
              <div>
                <p className="text-[11px] text-[var(--a-text-subtle)] mb-2 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-violet-400" /> Category ideas:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORY_PRESETS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setCategory(p)}
                      className="text-xs px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-gray-400 hover:text-white border border-white/5 transition-colors"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Skill chips */}
              <div>
                <Label>Initial Skills (Press Enter or comma to add)</Label>
                <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02] focus-within:border-violet-500/50 transition-colors">
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {items.map((it) => (
                      <span
                        key={it}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 border border-white/10 text-xs font-medium text-gray-200"
                      >
                        {it}
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(it)}
                          className="text-gray-400 hover:text-white"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  <input
                    type="text"
                    placeholder="Type skill name..."
                    value={itemInput}
                    onChange={(e) => setItemInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-transparent text-sm text-white placeholder:text-[var(--a-text-subtle)] outline-none px-1 py-0.5"
                  />
                </div>
              </div>
            </form>

            {/* Footer */}
            <div className="p-5 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-2.5 ml-auto">
                <Button variant="ghost" size="sm" onClick={onClose} disabled={saving}>
                  Cancel
                </Button>
                <Button form="skill-cat-form" type="submit" size="sm" loading={saving} className="gap-1.5">
                  <Check className="h-4 w-4" /> Create Category
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
