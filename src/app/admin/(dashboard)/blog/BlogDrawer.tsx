"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Upload,
  ExternalLink,
  Trash2,
  Eye,
  EyeOff,
  Wand2,
  BookOpen,
  Heading,
  Code,
  List,
  Table as TableIcon,
  Quote,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { Button, Input, Textarea, Label, Badge, Card, Kbd } from "../../_ui";
import { addBlogPost, updateBlogPost } from "./actions";

interface BlogDrawerProps {
  open: boolean;
  onClose: () => void;
  post: any | null;
  onSaved: (post: any, isNew: boolean) => void;
}

const COMMON_TAGS = [
  "Shopify Performance",
  "Liquid Optimization",
  "Core Web Vitals",
  "Web Architecture",
  "AI in Commerce",
  "Shopify API",
  "Headless Commerce",
  "Next.js",
  "Shopify SEO",
  "JSON-LD Schema",
  "Custom Shopify Theme",
  "eCommerce ROI",
];

const COMMON_CATEGORIES = [
  "Shopify & Liquid",
  "AI & Automation",
  "Full-Stack & Next.js",
  "Shopify SEO & Growth",
  "Web Performance",
];

export default function BlogDrawer({
  open,
  onClose,
  post,
  onSaved,
}: BlogDrawerProps) {
  const isEditing = Boolean(post?._id);

  // Form states
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("Shopify & Liquid");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [readingTime, setReadingTime] = useState("6 min read");
  const [authorName, setAuthorName] = useState("Zakaria Bin Moti");
  const [authorRole, setAuthorRole] = useState("Lead Software Engineer & Shopify Architect");
  const [publishedAt, setPublishedAt] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  // Tags
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // Cover image
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto calculate reading time based on word count
  useEffect(() => {
    if (!content) return;
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    setReadingTime(`${minutes} min read`);
  }, [content]);

  // Sync state on open / post change
  useEffect(() => {
    if (post) {
      setTitle(post.title || "");
      setSlug(post.slug || "");
      setCategory(post.category || "Shopify & Liquid");
      setSummary(post.summary || "");
      setContent(post.content || "");
      setReadingTime(post.readingTime || "6 min read");
      setAuthorName(post.authorName || "Zakaria Bin Moti");
      setAuthorRole(post.authorRole || "Lead Software Engineer & Shopify Architect");
      setIsPublished(post.isPublished !== false);
      setPublishedAt(
        post.publishedAt
          ? new Date(post.publishedAt).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0]
      );
      setTags(Array.isArray(post.tags) ? [...post.tags] : []);
      setCoverImageUrl(post.coverImage || "");
      setImagePreview(post.coverImage || null);
      setImageFile(null);
      setRemoveExistingImage(false);
    } else {
      setTitle("");
      setSlug("");
      setCategory("Shopify & Liquid");
      setSummary("");
      setContent(`A strong opening paragraph establishing the engineering problem, conversion consequences, and high-level architectural principle.

---

## 1. The Core Engineering Challenge

Explain the technical bottleneck in depth with code or schema examples.

\`\`\`liquid
{% comment %} Code demonstration {% endcomment %}
\`\`\`

---

## 2. Senior Implementation Strategy

Detail how the problem was resolved without app bloat or performance degradation.

---

## Key Takeaways for High-Growth Brands

* **Point 1:** Concrete action step.
* **Point 2:** Architectural guideline.
`);
      setReadingTime("6 min read");
      setAuthorName("Zakaria Bin Moti");
      setAuthorRole("Lead Software Engineer & Shopify Architect");
      setPublishedAt(new Date().toISOString().split("T")[0]);
      setIsPublished(true);
      setTags(["Shopify Performance", "Liquid Optimization"]);
      setCoverImageUrl("");
      setImagePreview(null);
      setImageFile(null);
      setRemoveExistingImage(false);
    }
  }, [post, open]);

  // Escape & Ctrl+Enter
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
  }, [open, title, slug, summary, content, tags, imageFile, removeExistingImage, coverImageUrl, publishedAt]);

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
      toast.error("Article title is required");
      return;
    }

    setSaving(true);
    const toastId = toast.loading(isEditing ? "Updating article..." : "Publishing article...");

    try {
      const formData = new FormData();
      formData.set("title", title);
      formData.set("slug", slug);
      formData.set("category", category);
      formData.set("summary", summary);
      formData.set("content", content);
      formData.set("readingTime", readingTime);
      formData.set("authorName", authorName);
      formData.set("authorRole", authorRole);
      formData.set("publishedAt", publishedAt);
      formData.set("isPublished", String(isPublished));
      formData.set("tags", tags.join(","));

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
        const res = await updateBlogPost(post._id, formData);
        if (res.success) {
          toast.success("Blog article updated successfully", { id: toastId });
          onSaved(res.post, false);
          onClose();
        } else {
          toast.error(res.error || "Failed to update article", { id: toastId });
        }
      } else {
        const res = await addBlogPost(formData);
        if (res.success) {
          toast.success("New blog article published", { id: toastId });
          onSaved(res.post, true);
          onClose();
        } else {
          toast.error("Failed to publish article", { id: toastId });
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
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-400">
                    <BookOpen className="h-4 w-4" />
                  </span>
                  <h2 className="text-lg font-semibold text-white">
                    {isEditing ? "Edit Blog Article" : "Write New Blog Article"}
                  </h2>
                  <Badge tone={isPublished ? "cyan" : "neutral"} className="ml-2">
                    {isPublished ? "Published" : "Draft"}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-white/50">
                  Publish high-ranking technical SEO articles to capture search intent and demonstrate authority.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {isEditing && post?.slug && (
                  <a
                    href={`/blog/${post.slug}`}
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
              {/* Primary Details */}
              <Card className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                    Article Essentials & SEO Metadata
                  </h3>
                  {/* Published Toggle */}
                  <button
                    type="button"
                    onClick={() => setIsPublished(!isPublished)}
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      isPublished
                        ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-300"
                        : "bg-white/5 border-white/15 text-white/50"
                    }`}
                  >
                    {isPublished ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    {isPublished ? "Status: Public" : "Status: Draft"}
                  </button>
                </div>

                <div>
                  <Label htmlFor="blog-title">Article Title *</Label>
                  <Input
                    id="blog-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Why Most Shopify Stores Are Slow: Fixing Liquid Bottlenecks & Asset Bloat in 2026"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <Label htmlFor="blog-slug" className="mb-0">URL Slug</Label>
                      <button
                        type="button"
                        onClick={handleGenerateSlug}
                        className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                      >
                        <Wand2 className="h-3 w-3" /> Auto-generate
                      </button>
                    </div>
                    <Input
                      id="blog-slug"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="why-most-shopify-stores-are-slow"
                    />
                  </div>

                  <div>
                    <Label htmlFor="blog-category">Primary Category</Label>
                    <Input
                      id="blog-category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="e.g. Shopify & Liquid, AI & Automation"
                    />
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {COMMON_CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setCategory(cat)}
                          className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                            category === cat
                              ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                              : "bg-white/[0.03] text-white/50 border-white/10 hover:text-white"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="blog-summary">SEO Meta Summary / Article Hook *</Label>
                  <Textarea
                    id="blog-summary"
                    rows={3}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="A compelling 1-2 sentence description that will show in Google Search snippets and blog cards..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="blog-publishedAt">Publish Date</Label>
                    <Input
                      id="blog-publishedAt"
                      type="date"
                      value={publishedAt}
                      onChange={(e) => setPublishedAt(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="blog-readingTime">Estimated Reading Time</Label>
                    <div className="relative">
                      <Input
                        id="blog-readingTime"
                        value={readingTime}
                        onChange={(e) => setReadingTime(e.target.value)}
                        placeholder="6 min read"
                      />
                      <Clock className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Cover Media Card */}
              <Card className="p-5 space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                  Header Cover Media
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
                        Replace Image
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
                        ? "border-cyan-500 bg-cyan-500/10"
                        : "border-white/10 hover:border-white/20 bg-white/[0.02]"
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="p-3 rounded-full bg-white/5 text-white/60">
                        <Upload className="h-5 w-5" />
                      </span>
                      <p className="text-xs font-medium text-white/80">
                        Drag and drop your blog banner, or <span className="text-cyan-400">browse</span>
                      </p>
                      <p className="text-[11px] text-white/40">
                        16:10 or 16:9 ratio recommended • PNG, JPG, or WebP • Uploads to Cloudinary
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
                  <Label htmlFor="blog-coverImageUrl">Or Direct Image URL (Cloudinary / CDN)</Label>
                  <Input
                    id="blog-coverImageUrl"
                    value={coverImageUrl}
                    onChange={(e) => {
                      setCoverImageUrl(e.target.value);
                      if (e.target.value) setImagePreview(e.target.value);
                    }}
                    placeholder="https://res.cloudinary.com/daysiptql/image/upload/v.../portfolio/blog/..."
                  />
                </div>
              </Card>

              {/* Tags */}
              <Card className="p-5 space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                  Search Engine & Topic Tags
                </h3>

                <div>
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
                      placeholder="Add tag (e.g. Liquid Optimization, Core Web Vitals)..."
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
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[11px] text-cyan-300"
                      >
                        <span>{t}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(t)}
                          className="text-cyan-400 hover:text-white ml-0.5"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {COMMON_TAGS.filter((ct) => !tags.includes(ct)).slice(0, 7).map((ct) => (
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

              {/* Full Markdown Article Editor */}
              <Card className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                      Full Article Body (Markdown)
                    </h3>
                    <p className="text-[11px] text-white/40">
                      Write in GitHub Flavored Markdown with syntax highlighting and rich formatting.
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      title="Insert Heading 2"
                      onClick={() => insertMarkdownSnippet("\n## Section Title\n")}
                      className="p-1.5 rounded hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                    >
                      <Heading className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Insert Code Block"
                      onClick={() => insertMarkdownSnippet("\n```liquid\n{% comment %} Liquid Logic {% endcomment %}\n```\n")}
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
                      onClick={() => insertMarkdownSnippet("\n| Feature | Approach A | Approach B |\n| :--- | :--- | :--- |\n| Speed | Sub-second | Slow |\n")}
                      className="p-1.5 rounded hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                    >
                      <TableIcon className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Insert Blockquote"
                      onClick={() => insertMarkdownSnippet("\n> Key architectural takeaway or highlight.\n")}
                      className="p-1.5 rounded hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                    >
                      <Quote className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <Textarea
                  ref={contentTextareaRef}
                  id="blog-content"
                  rows={18}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="## Section Title\n\nWrite your technical article..."
                  className="font-mono text-xs leading-relaxed"
                  required
                />
              </Card>

              {/* Authoring & Attribution */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="blog-authorName">Author Byline</Label>
                  <Input
                    id="blog-authorName"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Zakaria Bin Moti"
                  />
                </div>
                <div>
                  <Label htmlFor="blog-authorRole">Author Role</Label>
                  <Input
                    id="blog-authorRole"
                    value={authorRole}
                    onChange={(e) => setAuthorRole(e.target.value)}
                    placeholder="Lead Software Engineer & Shopify Architect"
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
                  {isEditing ? "Save Changes" : "Publish Article"}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
