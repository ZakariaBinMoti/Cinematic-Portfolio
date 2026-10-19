"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  Sparkles,
  ExternalLink,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Layers,
  BarChart3,
  Calendar,
  Building,
  FolderKanban,
} from "lucide-react";
import { toast } from "sonner";
import { Button, Input, Badge, PageHeader, Card } from "../../_ui";
import CaseStudyDrawer from "./CaseStudyDrawer";
import {
  deleteCaseStudy,
  reorderCaseStudies,
  toggleCaseStudyPublish,
} from "./actions";

interface Metric {
  label: string;
  value: string;
}

interface CaseStudy {
  _id: string;
  title: string;
  slug: string;
  type: string;
  summary: string;
  content: string;
  coverImage?: string;
  projectId?: string;
  clientName?: string;
  clientUrl?: string;
  projectYear?: string;
  category: string;
  tags?: string[];
  services?: string[];
  metrics?: Metric[];
  order?: number;
  isPublished?: boolean;
  publishedAt?: string;
  readingTime?: string;
}

export default function CaseStudiesManager({
  initialCaseStudies,
  availableProjects = [],
}: {
  initialCaseStudies: CaseStudy[];
  availableProjects?: any[];
}) {
  const searchParams = useSearchParams();
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>(initialCaseStudies);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingCaseStudy, setEditingCaseStudy] = useState<CaseStudy | null>(null);

  // Auto-open drawer if ?new=1
  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setEditingCaseStudy(null);
      setDrawerOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    setCaseStudies(initialCaseStudies);
  }, [initialCaseStudies]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    caseStudies.forEach((cs) => {
      if (cs.category) set.add(cs.category);
    });
    return ["All", ...Array.from(set)];
  }, [caseStudies]);

  // Filtered
  const filteredCaseStudies = useMemo(() => {
    return caseStudies.filter((cs) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        searchQuery === "" ||
        cs.title.toLowerCase().includes(q) ||
        (cs.clientName && cs.clientName.toLowerCase().includes(q)) ||
        (cs.summary && cs.summary.toLowerCase().includes(q)) ||
        (cs.category && cs.category.toLowerCase().includes(q)) ||
        cs.tags?.some((t) => t.toLowerCase().includes(q));

      const matchesCat =
        selectedCategory === "All" || cs.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [caseStudies, searchQuery, selectedCategory]);

  const publishedCount = useMemo(
    () => caseStudies.filter((cs) => cs.isPublished !== false).length,
    [caseStudies]
  );

  // Toggle publish
  const handleTogglePublish = async (cs: CaseStudy) => {
    const nextState = cs.isPublished === false;
    const prev = [...caseStudies];
    setCaseStudies(
      caseStudies.map((item) =>
        item._id === cs._id ? { ...item, isPublished: nextState } : item
      )
    );

    try {
      const res = await toggleCaseStudyPublish(cs._id, nextState);
      if (res.success) {
        toast.success(
          nextState ? "Case study published live" : "Case study set to draft"
        );
      } else {
        setCaseStudies(prev);
        toast.error("Failed to update status");
      }
    } catch {
      setCaseStudies(prev);
      toast.error("Error updating publish status");
    }
  };

  // Delete
  const handleDelete = async (cs: CaseStudy) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${cs.title}"? This will remove it from the database and sitemap.`
    );
    if (!confirmDelete) return;

    const prev = [...caseStudies];
    setCaseStudies(caseStudies.filter((item) => item._id !== cs._id));
    const toastId = toast.loading("Deleting case study...");

    try {
      const res = await deleteCaseStudy(cs._id);
      if (res.success) {
        toast.success("Case study deleted", { id: toastId });
      } else {
        setCaseStudies(prev);
        toast.error("Failed to delete", { id: toastId });
      }
    } catch {
      setCaseStudies(prev);
      toast.error("Error deleting case study", { id: toastId });
    }
  };

  // Reorder up/down
  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= caseStudies.length) return;

    const reordered = [...caseStudies];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    const updated = reordered.map((item, idx) => ({ ...item, order: idx }));
    setCaseStudies(updated);

    try {
      await reorderCaseStudies(updated.map((item) => item._id));
      toast.success("Display order updated", { duration: 1500 });
    } catch {
      toast.error("Failed to update order");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        eyebrow="Portfolio Admin"
        title="Case Studies Manager"
        description="Add, update, or remove client engineering case studies with verified benchmarks and metrics."
        actions={
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                setEditingCaseStudy(null);
                setDrawerOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              New Case Study
            </Button>
          </div>
        }
      />

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
            <Layers className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-white/50 font-medium">Total Studies</p>
            <p className="text-xl font-bold text-white">{caseStudies.length}</p>
          </div>
        </Card>
        <Card className="p-3.5 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
            <Eye className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-white/50 font-medium">Published Live</p>
            <p className="text-xl font-bold text-white">{publishedCount}</p>
          </div>
        </Card>
        <Card className="p-3.5 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
            <EyeOff className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-white/50 font-medium">Drafts</p>
            <p className="text-xl font-bold text-white">{caseStudies.length - publishedCount}</p>
          </div>
        </Card>
        <Card className="p-3.5 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
            <BarChart3 className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-white/50 font-medium">Industries</p>
            <p className="text-xl font-bold text-white">{categories.length - 1}</p>
          </div>
        </Card>
      </div>

      {/* Search & Filter Toolbar */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search case studies by title, client, category, or tags..."
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.02] p-1">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  viewMode === "grid"
                    ? "bg-white/15 text-white"
                    : "text-white/40 hover:text-white"
                }`}
                title="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  viewMode === "list"
                    ? "bg-white/15 text-white"
                    : "text-white/40 hover:text-white"
                }`}
                title="List view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3 py-1 rounded-full border transition-all ${
                selectedCategory === cat
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-medium"
                  : "bg-white/[0.02] text-white/50 border-white/5 hover:text-white hover:bg-white/5"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </Card>

      {/* Case Studies Container */}
      {filteredCaseStudies.length === 0 ? (
        <Card className="p-12 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-white/40">
            <Layers className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-white">No Case Studies Found</h3>
          <p className="text-xs text-white/50 max-w-sm mx-auto">
            {searchQuery
              ? `No case studies matched "${searchQuery}". Try clearing search filters.`
              : "No case studies in this category yet. Click 'New Case Study' to create one."}
          </p>
          <Button
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
              setEditingCaseStudy(null);
              setDrawerOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> Create Case Study
          </Button>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCaseStudies.map((cs, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === filteredCaseStudies.length - 1;

            return (
              <Card
                key={cs._id}
                className="overflow-hidden flex flex-col group hover:border-emerald-500/40 transition-all duration-300 hover:shadow-[0_10px_30px_-10px_rgba(16,185,129,0.15)]"
              >
                {/* Media header */}
                <div className="relative aspect-[16/10] bg-black/60 overflow-hidden border-b border-white/10">
                  {cs.coverImage ? (
                    <Image
                      src={cs.coverImage}
                      alt={cs.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-white/20">
                      <Layers className="h-10 w-10" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                  {/* Top badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-black/60 backdrop-blur-md border border-white/10 text-white">
                      #{idx + 1} • {cs.category}
                    </span>
                    <Badge tone={cs.isPublished !== false ? "green" : "neutral"}>
                      {cs.isPublished !== false ? "Live" : "Draft"}
                    </Badge>
                  </div>

                  {/* Client title on bottom overlay */}
                  <div className="absolute bottom-3 left-3 right-3">
                    {cs.clientName && (
                      <p className="text-[11px] font-semibold text-emerald-400 tracking-wide uppercase">
                        {cs.clientName} {cs.projectYear ? `• ${cs.projectYear}` : ""}
                      </p>
                    )}
                  </div>
                </div>

                {/* Body content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold text-white line-clamp-2 leading-snug group-hover:text-emerald-300 transition-colors">
                      {cs.title}
                    </h4>
                    <p className="mt-1.5 text-xs text-white/50 line-clamp-2 leading-relaxed">
                      {cs.summary}
                    </p>
                  </div>

                  {/* Impact metrics chips */}
                  {cs.metrics && cs.metrics.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {cs.metrics.slice(0, 2).map((m, mIdx) => (
                        <div
                          key={mIdx}
                          className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-300 flex items-center gap-1"
                        >
                          <span className="font-mono font-bold">{m.value}</span>
                          <span className="text-emerald-400/70">{m.label}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Footer actions */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                    {/* Move ordering */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={isFirst}
                        onClick={() => handleMove(idx, "up")}
                        className="p-1 rounded text-white/40 hover:text-white disabled:opacity-20 transition-colors"
                        title="Move Up"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={isLast}
                        onClick={() => handleMove(idx, "down")}
                        className="p-1 rounded text-white/40 hover:text-white disabled:opacity-20 transition-colors"
                        title="Move Down"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* View live */}
                      {cs.slug && (
                        <a
                          href={`/case-studies/${cs.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
                          title="View Live Page"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}

                      {/* Quick toggle */}
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(cs)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          cs.isPublished !== false
                            ? "text-emerald-400 hover:bg-emerald-500/10"
                            : "text-white/40 hover:text-white hover:bg-white/5"
                        }`}
                        title={cs.isPublished !== false ? "Unpublish (Draft)" : "Publish Live"}
                      >
                        {cs.isPublished !== false ? (
                          <Eye className="h-3.5 w-3.5" />
                        ) : (
                          <EyeOff className="h-3.5 w-3.5" />
                        )}
                      </button>

                      {/* Edit */}
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setEditingCaseStudy(cs);
                          setDrawerOpen(true);
                        }}
                        className="h-7 px-2.5 text-xs"
                      >
                        <Edit className="h-3 w-3" /> Edit
                      </Button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDelete(cs)}
                        className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete Case Study"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        /* List / Table View */
        <Card className="divide-y divide-white/5 overflow-hidden">
          {filteredCaseStudies.map((cs, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === filteredCaseStudies.length - 1;

            return (
              <div
                key={cs._id}
                className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-white/[0.01] transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Order control */}
                  <div className="flex flex-col items-center gap-0.5 text-white/40">
                    <button
                      type="button"
                      disabled={isFirst}
                      onClick={() => handleMove(idx, "up")}
                      className="p-0.5 hover:text-white disabled:opacity-20"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </button>
                    <span className="text-[10px] font-mono">{idx + 1}</span>
                    <button
                      type="button"
                      disabled={isLast}
                      onClick={() => handleMove(idx, "down")}
                      className="p-0.5 hover:text-white disabled:opacity-20"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Thumbnail */}
                  <div className="relative h-14 w-22 rounded-lg bg-black/40 overflow-hidden border border-white/10 shrink-0">
                    {cs.coverImage ? (
                      <Image
                        src={cs.coverImage}
                        alt={cs.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-white/20">
                        <Layers className="h-5 w-5" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white truncate">
                        {cs.title}
                      </span>
                      <Badge tone={cs.isPublished !== false ? "green" : "neutral"}>
                        {cs.isPublished !== false ? "Live" : "Draft"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-white/40">
                      {cs.clientName && (
                        <span className="flex items-center gap-1 text-emerald-400">
                          <Building className="h-3 w-3" /> {cs.clientName}
                        </span>
                      )}
                      <span>{cs.category}</span>
                      {cs.projectYear && <span>{cs.projectYear}</span>}
                    </div>
                  </div>
                </div>

                {/* Right actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {cs.slug && (
                    <a
                      href={`/case-studies/${cs.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
                      title="View live"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => handleTogglePublish(cs)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      cs.isPublished !== false
                        ? "text-emerald-400 hover:bg-emerald-500/10"
                        : "text-white/40 hover:text-white"
                    }`}
                  >
                    {cs.isPublished !== false ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setEditingCaseStudy(cs);
                      setDrawerOpen(true);
                    }}
                    className="h-8 px-3 text-xs"
                  >
                    <Edit className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <button
                    type="button"
                    onClick={() => handleDelete(cs)}
                    className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </Card>
      )}

      {/* Slide-out Edit/Create Drawer */}
      <CaseStudyDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditingCaseStudy(null);
        }}
        caseStudy={editingCaseStudy}
        availableProjects={availableProjects}
        onSaved={(saved, isNew) => {
          if (isNew) {
            setCaseStudies([saved, ...caseStudies]);
          } else {
            setCaseStudies(
              caseStudies.map((cs) => (cs._id === saved._id ? saved : cs))
            );
          }
        }}
      />
    </div>
  );
}
