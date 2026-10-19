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
  Plus,
  Sparkles,
  LoaderCircle,
  Eye,
  EyeOff,
  Wand2,
  BarChart3,
  Layers,
  Heading,
  Code,
  List,
  Table as TableIcon,
  Quote,
  FolderKanban,
} from "lucide-react";
import { toast } from "sonner";
import { Button, Input, Textarea, Label, Badge, Card, Kbd } from "../../_ui";
import { addCaseStudy, updateCaseStudy } from "./actions";

interface Metric {
  label: string;
  value: string;
}

interface CaseStudyDrawerProps {
  open: boolean;
  onClose: () => void;
  caseStudy: any | null;
  availableProjects?: any[];
  onSaved: (caseStudy: any, isNew: boolean) => void;
}

const COMMON_TAGS = [
  "Shopify OS 2.0",
  "Liquid",
  "Custom Metafields",
  "CRO",
  "Luxury eCommerce",
  "Service Booking",
  "High-Ticket CRO",
  "Freight Logistics",
  "Full-Stack",
  "Next.js",
  "TailwindCSS",
];

const COMMON_CATEGORIES = [
  "Tech & Lifestyle",
  "Health & Wellness",
  "Fashion & Luxury",
  "Automotive & Powersports",
  "eCommerce Engineering",
];

export default function CaseStudyDrawer({
  open,
  onClose,
  caseStudy,
  availableProjects = [],
  onSaved,
}: CaseStudyDrawerProps) {
  const isEditing = Boolean(caseStudy?._id);

  // Form states
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientUrl, setClientUrl] = useState("");
  const [projectYear, setProjectYear] = useState("");
  const [category, setCategory] = useState("Shopify OS 2.0");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [readingTime, setReadingTime] = useState("6 min read");
  const [authorName, setAuthorName] = useState("Zakaria Bin Moti");
  const [authorRole, setAuthorRole] = useState("Lead Software Engineer & Shopify Architect");
  const [isPublished, setIsPublished] = useState(true);

  // Tags & Services
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [services, setServices] = useState<string[]>([]);
  const [serviceInput, setServiceInput] = useState("");

  // Metrics
  const [metrics, setMetrics] = useState<Metric[]>([]);

  // Cover image
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync state on open / caseStudy change
  useEffect(() => {
    if (caseStudy) {
      setSelectedProjectId(caseStudy.projectId || "");
      setTitle(caseStudy.title || "");
      setSlug(caseStudy.slug || "");
      setClientName(caseStudy.clientName || "");
      setClientUrl(caseStudy.clientUrl || "");
      setProjectYear(caseStudy.projectYear || "2025");
      setCategory(caseStudy.category || "Shopify OS 2.0");
      setSummary(caseStudy.summary || "");
      setContent(caseStudy.content || "");
      setReadingTime(caseStudy.readingTime || "6 min read");
      setAuthorName(caseStudy.authorName || "Zakaria Bin Moti");
      setAuthorRole(caseStudy.authorRole || "Lead Software Engineer & Shopify Architect");
      setIsPublished(caseStudy.isPublished !== false);
      setTags(Array.isArray(caseStudy.tags) ? [...caseStudy.tags] : []);
      setServices(Array.isArray(caseStudy.services) ? [...caseStudy.services] : []);
      setMetrics(
        Array.isArray(caseStudy.metrics) && caseStudy.metrics.length > 0
          ? caseStudy.metrics.map((m: any) => ({ label: m.label || "", value: m.value || "" }))
          : [
              { label: "Conversion Lift", value: "+35%" },
              { label: "Page Load (LCP)", value: "0.8s" },
            ]
      );
      setCoverImageUrl(caseStudy.coverImage || "");
      setImagePreview(caseStudy.coverImage || null);
      setImageFile(null);
      setRemoveExistingImage(false);
    } else {
      setSelectedProjectId("");
      setTitle("");
      setSlug("");
      setClientName("");
      setClientUrl("");
      setProjectYear(new Date().getFullYear().toString());
      setCategory("Shopify OS 2.0");
      setSummary("");
      setContent(`## Executive Summary

Brief context on the client, their primary commerce challenge, and the engineering solution implemented.

---

## The Challenge

1. **Architecture Hurdle:** Describe the technical limitation or bottleneck.
2. **Operational Friction:** Detail how this impacted business operations.

---

## Technical Architecture & Implementation

\`\`\`
Client / Shopper
      │
      ▼
Shopify Storefront Edge (Liquid / React)
\`\`\`

### 1. Bespoke Theme Architecture
Explain the core architectural solution and code structure.

---

## Commercial Results

* **+40% Conversion Lift:** Concrete performance metrics and impact.
* **Sub-Second Core Web Vitals:** Quantified speed gains.
`);
      setReadingTime("6 min read");
      setAuthorName("Zakaria Bin Moti");
      setAuthorRole("Lead Software Engineer & Shopify Architect");
      setIsPublished(true);
      setTags(["Shopify OS 2.0", "Liquid", "CRO"]);
      setServices([
        "Custom Shopify OS 2.0 Theme Architecture",
        "Mobile Core Web Vitals Optimization",
      ]);
      setMetrics([
        { label: "Conversion Lift", value: "+38%" },
        { label: "LCP Load Speed", value: "0.78s" },
      ]);
      setCoverImageUrl("");
      setImagePreview(null);
      setImageFile(null);
      setRemoveExistingImage(false);
    }
  }, [caseStudy, open]);

  const handleAutofillFromProject = (pId: string) => {
    const proj = (availableProjects || []).find((p: any) => p._id === pId);
    if (!proj) return;
    if (!clientName || clientName === "Client") setClientName(proj.title);
    if ((!clientUrl || clientUrl === "") && proj.liveLink) setClientUrl(proj.liveLink);
    if (!coverImageUrl && proj.imageUrl) {
      setCoverImageUrl(proj.imageUrl);
      setImagePreview(proj.imageUrl);
    }
    if (!title || title.trim() === "") {
      setTitle(`${proj.title}: Engineering Scalable eCommerce Architecture`);
      const generated = proj.title
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/&/g, "-and-")
        .replace(/[^\w\-]+/g, "")
        .replace(/\-\-+/g, "-");
      setSlug(generated);
    }
    if (proj.techStack && proj.techStack.length > 0) {
      const combined = Array.from(new Set([...tags, ...proj.techStack]));
      setTags(combined);
    }
    toast.success(`Autofilled details from "${proj.title}"`);
  };

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
  }, [open, title, slug, summary, content, metrics, services, tags, imageFile, removeExistingImage, coverImageUrl]);

  const handleGenerateSlug = () => {
    if (!title) {
      toast.error("Please enter a title first");
      return;
    }
    const generated = title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/&/g, "-and-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-");
    setSlug(generated);
    toast.success("Slug generated from title");
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (PNG, JPG, WebP)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image file must be under 10MB");
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

  // Metrics Helpers
  const handleAddMetric = () => {
    setMetrics([...metrics, { label: "Metric Label", value: "+00%" }]);
  };

  const handleUpdateMetric = (index: number, field: "label" | "value", val: string) => {
    const updated = [...metrics];
    updated[index][field] = val;
    setMetrics(updated);
  };

  const handleRemoveMetric = (index: number) => {
    setMetrics(metrics.filter((_, i) => i !== index));
  };

  // Services Helpers
  const handleAddService = (srv: string) => {
    const trimmed = srv.trim();
    if (!trimmed) return;
    if (!services.includes(trimmed)) {
      setServices([...services, trimmed]);
    }
    setServiceInput("");
  };

  const handleRemoveService = (srvToRemove: string) => {
    setServices(services.filter((s) => s !== srvToRemove));
  };

  // Tags Helpers
  const handleAddTag = (t: string) => {
    const trimmed = t.trim().replace(/^,+|,+$/g, "");
    if (!trimmed) return;
    if (!tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setTagInput("");
  };

  const handleRemoveTag = (tToRemove: string) => {
    setTags(tags.filter((t) => t !== tToRemove));
  };

  // Markdown snippet helper
  const insertMarkdownSnippet = (snippet: string) => {
    const textarea = contentTextareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = textarea.value;
    const before = current.substring(0, start);
    const after = current.substring(end);
    const updated = `${before}${snippet}${after}`;
    setContent(updated);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + snippet.length, start + snippet.length);
    }, 50);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) {
      toast.error("Case study title is required");
      return;
    }

    setSaving(true);
    const toastId = toast.loading(isEditing ? "Updating case study..." : "Publishing case study...");

    try {
      const formData = new FormData();
      formData.set("title", title);
      formData.set("slug", slug);
      formData.set("projectId", selectedProjectId);
      formData.set("clientName", clientName);
      formData.set("clientUrl", clientUrl);
      formData.set("projectYear", projectYear);
      formData.set("category", category);
      formData.set("summary", summary);
      formData.set("content", content);
      formData.set("readingTime", readingTime);
      formData.set("authorName", authorName);
      formData.set("authorRole", authorRole);
      formData.set("isPublished", String(isPublished));
      formData.set("tags", tags.join(","));
      formData.set("services", services.join("\n"));
      formData.set("metrics", JSON.stringify(metrics));

      if (coverImageUrl) {
        formData.set("coverImageUrl", coverImageUrl);
      }
      if (imageFile) {
        formData.set("image", imageFile);
      }
      if (removeExistingImage) {
        formData.set("removeImage", "true");
      }

      if (isEditing) {
        const res = await updateCaseStudy(caseStudy._id, formData);
        if (res.success) {
          toast.success("Case study updated successfully", { id: toastId });
          onSaved(res.caseStudy, false);
          onClose();
        } else {
          toast.error(res.error || "Failed to update case study", { id: toastId });
        }
      } else {
        const res = await addCaseStudy(formData);
        if (res.success) {
          toast.success("New case study published", { id: toastId });
          onSaved(res.caseStudy, true);
          onClose();
        } else {
          toast.error("Failed to create case study", { id: toastId });
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
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="relative z-10 w-full max-w-3xl bg-[#0b0b10] border-l border-white/10 shadow-2xl flex flex-col h-full overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
                    <Layers className="h-4 w-4" />
                  </span>
                  <h2 className="text-lg font-semibold text-white">
                    {isEditing ? "Edit Case Study" : "Create New Case Study"}
                  </h2>
                  <Badge tone={isPublished ? "green" : "neutral"} className="ml-2">
                    {isPublished ? "Published" : "Draft"}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-white/50">
                  Document client architecture, performance benchmarks, and technical impact.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {isEditing && caseStudy?.slug && (
                  <a
                    href={`/case-studies/${caseStudy.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="a-focus inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-xs text-white/70 hover:bg-white/[0.08] hover:text-white"
                  >
                    <span>View Live</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg p-2 text-white/40 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Linked Portfolio Showcase Project Selector */}
              <Card className="p-5 space-y-3 border-emerald-500/25 bg-emerald-500/[0.03]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FolderKanban className="h-4 w-4 text-emerald-400" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                      Linked Portfolio Showcase Project
                    </h3>
                  </div>
                  {selectedProjectId && (
                    <button
                      type="button"
                      onClick={() => handleAutofillFromProject(selectedProjectId)}
                      className="text-[11px] text-emerald-300 hover:text-white flex items-center gap-1 font-medium bg-emerald-500/15 px-2.5 py-1 rounded-md border border-emerald-500/30 transition-colors"
                      title="Sync title, live link, and cover image from selected project"
                    >
                      <Sparkles className="h-3 w-3" /> Auto-fill Details
                    </button>
                  )}
                </div>

                <div>
                  <Label htmlFor="cs-project-select">Select Existing Showcase Project</Label>
                  <select
                    id="cs-project-select"
                    value={selectedProjectId}
                    onChange={(e) => {
                      const pId = e.target.value;
                      setSelectedProjectId(pId);
                      if (pId && (!title || title.trim() === "")) {
                        handleAutofillFromProject(pId);
                      }
                    }}
                    className="w-full rounded-xl bg-white/[0.04] border border-[var(--a-border)] px-3.5 py-2.5 text-sm text-[var(--a-text)] outline-none hover:border-emerald-500/40 focus:border-emerald-400 focus:bg-white/[0.07] transition-colors"
                  >
                    <option value="" className="bg-[#0e0e14] text-white">None (Standalone Case Study)</option>
                    {(availableProjects || []).map((proj: any) => (
                      <option key={proj._id} value={proj._id} className="bg-[#0e0e14] text-white">
                        {proj.title}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1.5 text-xs text-white/50">
                    Selecting a project connects this case study to that project card in your homepage showcase and enables the <span className="text-emerald-400 font-medium">&quot;Case Study&quot;</span> button.
                  </p>
                </div>
              </Card>

              {/* Primary Details Card */}
              <Card className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                    Client & Identity
                  </h3>
                  {/* Published Toggle */}
                  <button
                    type="button"
                    onClick={() => setIsPublished(!isPublished)}
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      isPublished
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                        : "bg-white/5 border-white/15 text-white/50"
                    }`}
                  >
                    {isPublished ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    {isPublished ? "Status: Public" : "Status: Draft"}
                  </button>
                </div>

                <div>
                  <Label htmlFor="cs-title">Title *</Label>
                  <Input
                    id="cs-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Beccas Bags: Engineering a Custom Luxury Consignment & Rental Engine on Shopify OS 2.0"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <Label htmlFor="cs-slug" className="mb-0">URL Slug</Label>
                      <button
                        type="button"
                        onClick={handleGenerateSlug}
                        className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                      >
                        <Wand2 className="h-3 w-3" /> Auto-generate
                      </button>
                    </div>
                    <Input
                      id="cs-slug"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="beccas-bags-luxury-consignment-shopify"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cs-category">Industry Category</Label>
                    <div className="relative">
                      <Input
                        id="cs-category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="e.g. Fashion & Luxury, Health & Wellness"
                      />
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {COMMON_CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setCategory(cat)}
                          className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                            category === cat
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                              : "bg-white/[0.03] text-white/50 border-white/10 hover:text-white"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="cs-clientName">Client Brand Name</Label>
                    <Input
                      id="cs-clientName"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="e.g. Beccas Bags"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cs-clientUrl">Live Storefront URL</Label>
                    <Input
                      id="cs-clientUrl"
                      value={clientUrl}
                      onChange={(e) => setClientUrl(e.target.value)}
                      placeholder="https://beccasbags.ca"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cs-projectYear">Project Year</Label>
                    <Input
                      id="cs-projectYear"
                      value={projectYear}
                      onChange={(e) => setProjectYear(e.target.value)}
                      placeholder="2025"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="cs-summary">Executive Summary *</Label>
                  <Textarea
                    id="cs-summary"
                    rows={3}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="High-level commercial hook and technical achievement displayed on cards and search results..."
                    required
                  />
                </div>
              </Card>

              {/* Cover Media Card */}
              <Card className="p-5 space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  Cover Image & Visual Media
                </h3>

                {imagePreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-white/15 bg-black/40 group aspect-[16/10] max-h-56 flex items-center justify-center">
                    <Image
                      src={imagePreview}
                      alt="Cover preview"
                      fill
                      className="object-cover"
                      unoptimized={imagePreview.startsWith("blob:")}
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-4 w-4" />
                        Replace File
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                          setCoverImageUrl("");
                          setRemoveExistingImage(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
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
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                      isDraggingOver
                        ? "border-emerald-500 bg-emerald-500/10"
                        : "border-white/10 hover:border-white/20 bg-white/[0.02]"
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="p-3 rounded-full bg-white/5 text-white/60">
                        <Upload className="h-5 w-5" />
                      </span>
                      <p className="text-xs font-medium text-white/80">
                        Drag and drop your 16:10 showcase image, or <span className="text-emerald-400">browse</span>
                      </p>
                      <p className="text-[11px] text-white/40">
                        High-res PNG, JPG, or WebP (max 10MB) • Uploads automatically to Cloudinary
                      </p>
                    </div>
                  </div>
                )}

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

                <div>
                  <Label htmlFor="cs-coverImageUrl">Or Direct Cloudinary / CDN Image URL</Label>
                  <Input
                    id="cs-coverImageUrl"
                    value={coverImageUrl}
                    onChange={(e) => {
                      setCoverImageUrl(e.target.value);
                      if (e.target.value) setImagePreview(e.target.value);
                    }}
                    placeholder="https://res.cloudinary.com/..."
                  />
                </div>
              </Card>

              {/* Quantified Metrics Builder */}
              <Card className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-emerald-400" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                      Key Quantified Impact Metrics
                    </h3>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={handleAddMetric}
                    className="text-xs h-7"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Metric
                  </Button>
                </div>

                <div className="space-y-2">
                  {metrics.map((metric, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-white/[0.02] p-2 rounded-lg border border-white/5">
                      <Input
                        value={metric.label}
                        onChange={(e) => handleUpdateMetric(idx, "label", e.target.value)}
                        placeholder="Label (e.g. Conversion Lift)"
                        className="h-8 text-xs"
                      />
                      <Input
                        value={metric.value}
                        onChange={(e) => handleUpdateMetric(idx, "value", e.target.value)}
                        placeholder="Value (e.g. +42%, 0.74s)"
                        className="h-8 text-xs font-mono font-bold text-emerald-400 w-36"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveMetric(idx)}
                        className="p-1.5 text-white/30 hover:text-red-400 rounded transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {metrics.length === 0 && (
                    <p className="text-xs text-white/40 italic text-center py-2">
                      No metrics added. Click &quot;Add Metric&quot; to showcase quantified proof.
                    </p>
                  )}
                </div>
              </Card>

              {/* Services & Tech Stack Tags */}
              <Card className="p-5 space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  Services Delivered & Technologies
                </h3>

                {/* Services */}
                <div>
                  <Label>Services Delivered</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={serviceInput}
                      onChange={(e) => setServiceInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddService(serviceInput);
                        }
                      }}
                      placeholder="e.g. Dynamic Rental & Consignment Booking Flow (Press Enter)"
                      className="text-xs h-9"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => handleAddService(serviceInput)}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {services.map((srv, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/10 text-xs text-white/80"
                      >
                        <span>{srv}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveService(srv)}
                          className="text-white/40 hover:text-white"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tech Stack Tags */}
                <div>
                  <Label>Tech Stack & Architecture Tags</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === ",") {
                          e.preventDefault();
                          handleAddTag(tagInput);
                        }
                      }}
                      placeholder="Add tag (e.g. Liquid, Metafields, CRO)..."
                      className="text-xs h-9"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => handleAddTag(tagInput)}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300"
                      >
                        <span>{t}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(t)}
                          className="text-emerald-400 hover:text-white ml-0.5"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  {/* Preset quick tags */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {COMMON_TAGS.filter((ct) => !tags.includes(ct)).slice(0, 6).map((ct) => (
                      <button
                        key={ct}
                        type="button"
                        onClick={() => handleAddTag(ct)}
                        className="text-[10px] text-white/40 hover:text-white bg-white/[0.02] border border-white/5 rounded px-2 py-0.5"
                      >
                        + {ct}
                      </button>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Full Markdown Content Editor */}
              <Card className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                      In-Depth Case Study Narrative (Markdown)
                    </h3>
                    <p className="text-[11px] text-white/40">
                      Supports GitHub Flavored Markdown: Headings, Code Blocks, Lists, Tables & Blockquotes.
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      title="Insert Heading"
                      onClick={() => insertMarkdownSnippet("\n## Section Title\n")}
                      className="p-1.5 rounded hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                    >
                      <Heading className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Insert Code Block"
                      onClick={() => insertMarkdownSnippet("\n```liquid\n{% comment %} Custom Logic {% endcomment %}\n```\n")}
                      className="p-1.5 rounded hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                    >
                      <Code className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Insert Bullet List"
                      onClick={() => insertMarkdownSnippet("\n* **Item 1:** Detail description.\n* **Item 2:** Detail description.\n")}
                      className="p-1.5 rounded hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                    >
                      <List className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Insert Table"
                      onClick={() => insertMarkdownSnippet("\n| Metric | Before | After |\n| :--- | :--- | :--- |\n| LCP | 3.8s | 0.8s |\n")}
                      className="p-1.5 rounded hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                    >
                      <TableIcon className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Insert Quote"
                      onClick={() => insertMarkdownSnippet("\n> Key architectural takeaway or client endorsement.\n")}
                      className="p-1.5 rounded hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                    >
                      <Quote className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <Textarea
                  ref={contentTextareaRef}
                  id="cs-content"
                  rows={16}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="## Executive Summary\n\nDetail the project narrative here..."
                  className="font-mono text-xs leading-relaxed"
                  required
                />
              </Card>

              {/* Meta & Authoring */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="cs-readingTime">Reading Time</Label>
                  <Input
                    id="cs-readingTime"
                    value={readingTime}
                    onChange={(e) => setReadingTime(e.target.value)}
                    placeholder="6 min read"
                  />
                </div>
                <div>
                  <Label htmlFor="cs-authorName">Author Name</Label>
                  <Input
                    id="cs-authorName"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Zakaria Bin Moti"
                  />
                </div>
                <div>
                  <Label htmlFor="cs-authorRole">Author Role</Label>
                  <Input
                    id="cs-authorRole"
                    value={authorRole}
                    onChange={(e) => setAuthorRole(e.target.value)}
                    placeholder="Lead Software Engineer"
                  />
                </div>
              </div>
            </form>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-2 text-xs text-white/40">
                <Kbd>Ctrl</Kbd> + <Kbd>Enter</Kbd> to save
              </div>

              <div className="flex items-center gap-3">
                <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
                  Cancel
                </Button>
                <Button type="button" onClick={() => handleSubmit()} loading={saving}>
                  {isEditing ? "Save Changes" : "Publish Case Study"}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
