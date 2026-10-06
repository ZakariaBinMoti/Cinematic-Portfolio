"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Upload,
  Image as ImageIcon,
  ExternalLink,
  Trash2,
  Check,
  Plus,
  Sparkles,
  LoaderCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button, Input, Textarea, Label, Badge, Card, Kbd } from "../../_ui";
import { addProject, updateProject } from "./actions";

interface ProjectDrawerProps {
  open: boolean;
  onClose: () => void;
  project: any | null;
  onSaved: (project: any, isNew: boolean) => void;
}

const COMMON_TAGS = [
  "Shopify",
  "Liquid",
  "Next.js",
  "React",
  "TypeScript",
  "TailwindCSS",
  "Framer Motion",
  "GraphQL",
  "eCommerce",
  "Headless",
  "Node.js",
  "MongoDB",
];

export default function ProjectDrawer({ open, onClose, project, onSaved }: ProjectDrawerProps) {
  const isEditing = Boolean(project?._id);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [liveLink, setLiveLink] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state when project changes or drawer opens
  useEffect(() => {
    if (project) {
      setTitle(project.title || "");
      setDescription(project.description || "");
      setLiveLink(project.liveLink || "");
      setTags(Array.isArray(project.techStack) ? [...project.techStack] : []);
      setImagePreview(project.imageUrl || null);
      setImageFile(null);
      setRemoveExistingImage(false);
    } else {
      setTitle("");
      setDescription("");
      setLiveLink("");
      setTags(["Shopify", "React"]);
      setImagePreview(null);
      setImageFile(null);
      setRemoveExistingImage(false);
    }
  }, [project, open]);

  // Handle escape & Ctrl+Enter
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, title, description, liveLink, tags, imageFile, removeExistingImage]);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (PNG, JPG, WebP)");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image file must be under 8MB");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setRemoveExistingImage(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleAddTag = (tagToAdd: string) => {
    const trimmed = tagToAdd.trim().replace(/^,+|,+$/g, "");
    if (!trimmed) return;
    if (!tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag(tagInput);
    } else if (e.key === "Backspace" && !tagInput && tags.length > 0) {
      handleRemoveTag(tags[tags.length - 1]);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) {
      toast.error("Project title is required");
      return;
    }

    setSaving(true);
    const toastId = toast.loading(isEditing ? "Updating project..." : "Creating project...");

    try {
      const formData = new FormData();
      formData.set("title", title);
      formData.set("description", description);
      formData.set("liveLink", liveLink);
      formData.set("techStack", tags.join(","));

      if (imageFile) {
        formData.set("image", imageFile);
      }
      if (removeExistingImage) {
        formData.set("removeImage", "true");
      }

      if (isEditing) {
        const res = await updateProject(project._id, formData);
        if (res.success) {
          toast.success("Project updated successfully", { id: toastId });
          onSaved(res.project, false);
          onClose();
        } else {
          toast.error(res.error || "Failed to update project", { id: toastId });
        }
      } else {
        const res = await addProject(formData);
        if (res.success) {
          toast.success("New project added to showcase", { id: toastId });
          onSaved(res.project, true);
          onClose();
        } else {
          toast.error("Failed to add project", { id: toastId });
        }
      }
    } catch (err: any) {
      toast.error(err?.message || "An unexpected error occurred", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer Panel */}
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
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {isEditing ? "Edit Project" : "New Showcase Project"}
                </h2>
                <p className="text-xs text-[var(--a-text-muted)] mt-0.5">
                  {isEditing
                    ? "Update project details, cover media, and tech stack"
                    : "Add a high-converting project to your cinematic portfolio"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form id="project-drawer-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Title */}
              <div>
                <Label htmlFor="proj-title">Project Title *</Label>
                <Input
                  id="proj-title"
                  placeholder="e.g. Minimalist Luxury Shopify Store"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Cover Image Dropzone */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label>Cover Media / Screenshot</Label>
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                        setRemoveExistingImage(true);
                      }}
                      className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="h-3 w-3" /> Remove media
                    </button>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileSelect(e.target.files[0]);
                    }
                  }}
                />

                {imagePreview ? (
                  <div className="relative group aspect-[16/9] w-full rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                    <Image
                      src={imagePreview}
                      alt="Project preview"
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="gap-1.5 text-xs"
                      >
                        <Upload className="h-3.5 w-3.5" /> Replace Image
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingOver(true);
                    }}
                    onDragLeave={() => setIsDraggingOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                      isDraggingOver
                        ? "border-violet-400 bg-violet-500/10"
                        : "border-white/10 hover:border-white/20 bg-white/[0.01] hover:bg-white/[0.03]"
                    }`}
                  >
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-violet-300 mb-3">
                      <ImageIcon className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-medium text-white">Click or drag & drop project cover</p>
                    <p className="text-xs text-[var(--a-text-subtle)] mt-1">PNG, JPG or WebP up to 8MB</p>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="proj-desc">Description & Impact</Label>
                <Textarea
                  id="proj-desc"
                  rows={4}
                  placeholder="Detail the challenge, architectural solution, and business conversion results..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              {/* Live URL */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label htmlFor="proj-link">Live Project / Store URL</Label>
                  {liveLink && (
                    <a
                      href={liveLink.startsWith("http") ? liveLink : `https://${liveLink}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-violet-300 hover:text-white flex items-center gap-1 transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" /> Test link
                    </a>
                  )}
                </div>
                <Input
                  id="proj-link"
                  type="url"
                  placeholder="https://client-store.com"
                  value={liveLink}
                  onChange={(e) => setLiveLink(e.target.value)}
                />
              </div>

              {/* Tech Stack Interactive Tag Input */}
              <div>
                <Label>Tech Stack & Technologies</Label>
                <div className="p-2.5 rounded-xl border border-white/10 bg-white/[0.02] focus-within:border-violet-500/50 transition-colors">
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 border border-white/10 text-xs font-medium text-gray-200"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-gray-400 hover:text-white"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  <input
                    type="text"
                    placeholder={tags.length === 0 ? "Type tech and press Enter (e.g. Next.js)..." : "Add another tag..."}
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagInputKeyDown}
                    className="w-full bg-transparent text-sm text-white placeholder:text-[var(--a-text-subtle)] outline-none px-1 py-0.5"
                  />
                </div>

                {/* Tag suggestions */}
                <div className="mt-2.5">
                  <p className="text-[11px] text-[var(--a-text-subtle)] mb-1.5 flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-violet-400" /> Suggested tags:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {COMMON_TAGS.filter((t) => !tags.includes(t)).slice(0, 7).map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => handleAddTag(suggestion)}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-white/[0.03] hover:bg-white/[0.08] text-gray-400 hover:text-white border border-white/5 transition-colors flex items-center gap-1"
                      >
                        <Plus className="h-2.5 w-2.5" /> {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </form>

            {/* Footer with Actions */}
            <div className="p-5 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
              <div className="text-xs text-[var(--a-text-subtle)] hidden sm:flex items-center gap-1">
                <Kbd>Ctrl</Kbd>
                <Kbd>Enter</Kbd> to save
              </div>

              <div className="flex items-center gap-2.5 ml-auto">
                <Button variant="ghost" size="sm" onClick={onClose} disabled={saving}>
                  Cancel
                </Button>
                <Button
                  form="project-drawer-form"
                  type="submit"
                  size="sm"
                  loading={saving}
                  className="gap-1.5 shadow-lg"
                >
                  {saving ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" /> {isEditing ? "Update Project" : "Publish Project"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
