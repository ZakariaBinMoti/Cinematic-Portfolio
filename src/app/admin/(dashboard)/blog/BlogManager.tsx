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
  ExternalLink,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  BookOpen,
  Calendar,
  Clock,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button, Input, Badge, PageHeader, Card } from "../../_ui";
import BlogDrawer from "./BlogDrawer";
import { deleteBlogPost, toggleBlogPostPublish } from "./actions";

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  type: string;
  summary: string;
  content: string;
  coverImage?: string;
  category: string;
  tags?: string[];
  readingTime?: string;
  authorName?: string;
  authorRole?: string;
  publishedAt?: string;
  isPublished?: boolean;
}

export default function BlogManager({
  initialPosts,
}: {
  initialPosts: BlogPost[];
}) {
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  // Auto-open drawer if ?new=1
  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setEditingPost(null);
      setDrawerOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ["All", ...Array.from(set)];
  }, [posts]);

  // Filtered
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        searchQuery === "" ||
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        p.tags?.some((t) => t.toLowerCase().includes(q));

      const matchesCat =
        selectedCategory === "All" || p.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [posts, searchQuery, selectedCategory]);

  const publishedCount = useMemo(
    () => posts.filter((p) => p.isPublished !== false).length,
    [posts]
  );

  // Toggle publish
  const handleTogglePublish = async (post: BlogPost) => {
    const nextState = post.isPublished === false;
    const prev = [...posts];
    setPosts(
      posts.map((item) =>
        item._id === post._id ? { ...item, isPublished: nextState } : item
      )
    );

    try {
      const res = await toggleBlogPostPublish(post._id, nextState);
      if (res.success) {
        toast.success(
          nextState ? "Article published live" : "Article saved to draft"
        );
      } else {
        setPosts(prev);
        toast.error("Failed to update status");
      }
    } catch {
      setPosts(prev);
      toast.error("Error updating publish status");
    }
  };

  // Delete
  const handleDelete = async (post: BlogPost) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${post.title}"? This will remove it from the database and sitemap.`
    );
    if (!confirmDelete) return;

    const prev = [...posts];
    setPosts(posts.filter((item) => item._id !== post._id));
    const toastId = toast.loading("Deleting article...");

    try {
      const res = await deleteBlogPost(post._id);
      if (res.success) {
        toast.success("Article deleted", { id: toastId });
      } else {
        setPosts(prev);
        toast.error("Failed to delete", { id: toastId });
      }
    } catch {
      setPosts(prev);
      toast.error("Error deleting article", { id: toastId });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        eyebrow="Portfolio Admin"
        title="Blog Articles Manager"
        description="Publish and manage high-ranking technical SEO articles, guides, and engineering benchmarks."
        actions={
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                setEditingPost(null);
                setDrawerOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              New Article
            </Button>
          </div>
        }
      />

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
            <BookOpen className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-white/50 font-medium">Articles</p>
            <p className="text-xl font-bold text-white">{posts.length}</p>
          </div>
        </Card>
        <Card className="p-3.5 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
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
            <p className="text-xl font-bold text-white">{posts.length - publishedCount}</p>
          </div>
        </Card>
        <Card className="p-3.5 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-white/50 font-medium">Categories</p>
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
              placeholder="Search articles by title, category, keywords, or summary..."
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
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-medium"
                  : "bg-white/[0.02] text-white/50 border-white/5 hover:text-white hover:bg-white/5"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </Card>

      {/* Blog Cards Container */}
      {filteredPosts.length === 0 ? (
        <Card className="p-12 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-white/40">
            <BookOpen className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-white">No Articles Found</h3>
          <p className="text-xs text-white/50 max-w-sm mx-auto">
            {searchQuery
              ? `No articles matched "${searchQuery}". Try clearing search filters.`
              : "No articles in this category yet. Click 'New Article' to publish one."}
          </p>
          <Button
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
              setEditingPost(null);
              setDrawerOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> Write Article
          </Button>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPosts.map((post) => {
            const formattedDate = post.publishedAt
              ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "Recent";

            return (
              <Card
                key={post._id}
                className="overflow-hidden flex flex-col group hover:border-cyan-500/40 transition-all duration-300 hover:shadow-[0_10px_30px_-10px_rgba(6,182,212,0.15)]"
              >
                {/* Media banner */}
                <div className="relative aspect-[16/10] bg-black/60 overflow-hidden border-b border-white/10">
                  {post.coverImage ? (
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-white/20">
                      <BookOpen className="h-10 w-10" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-black/60 backdrop-blur-md border border-white/10 text-cyan-300">
                      {post.category}
                    </span>
                    <Badge tone={post.isPublished !== false ? "cyan" : "neutral"}>
                      {post.isPublished !== false ? "Live" : "Draft"}
                    </Badge>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-white/60">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-cyan-400" />
                      {formattedDate}
                    </span>
                    {post.readingTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-cyan-400" />
                        {post.readingTime}
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold text-white line-clamp-2 leading-snug group-hover:text-cyan-300 transition-colors">
                      {post.title}
                    </h4>
                    <p className="mt-1.5 text-xs text-white/50 line-clamp-2 leading-relaxed">
                      {post.summary}
                    </p>
                  </div>

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {post.tags.slice(0, 3).map((t, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2 py-0.5 rounded-full bg-white/[0.03] border border-white/5 text-[10px] text-white/60"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Footer actions */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                    {/* View Live */}
                    {post.slug && (
                      <a
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-cyan-300 transition-colors"
                      >
                        <span>View Live</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}

                    <div className="flex items-center gap-1.5">
                      {/* Publish toggle */}
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(post)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          post.isPublished !== false
                            ? "text-cyan-400 hover:bg-cyan-500/10"
                            : "text-white/40 hover:text-white hover:bg-white/5"
                        }`}
                        title={post.isPublished !== false ? "Save to Draft" : "Publish Live"}
                      >
                        {post.isPublished !== false ? (
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
                          setEditingPost(post);
                          setDrawerOpen(true);
                        }}
                        className="h-7 px-2.5 text-xs"
                      >
                        <Edit className="h-3 w-3" /> Edit
                      </Button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDelete(post)}
                        className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete Article"
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
          {filteredPosts.map((post) => {
            const formattedDate = post.publishedAt
              ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "Recent";

            return (
              <div
                key={post._id}
                className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-white/[0.01] transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Thumbnail */}
                  <div className="relative h-14 w-22 rounded-lg bg-black/40 overflow-hidden border border-white/10 shrink-0">
                    {post.coverImage ? (
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-white/20">
                        <BookOpen className="h-5 w-5" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white truncate">
                        {post.title}
                      </span>
                      <Badge tone={post.isPublished !== false ? "cyan" : "neutral"}>
                        {post.isPublished !== false ? "Live" : "Draft"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-white/40">
                      <span className="text-cyan-400">{post.category}</span>
                      <span>{formattedDate}</span>
                      {post.readingTime && <span>{post.readingTime}</span>}
                    </div>
                  </div>
                </div>

                {/* Right actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {post.slug && (
                    <a
                      href={`/blog/${post.slug}`}
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
                    onClick={() => handleTogglePublish(post)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      post.isPublished !== false
                        ? "text-cyan-400 hover:bg-cyan-500/10"
                        : "text-white/40 hover:text-white"
                    }`}
                  >
                    {post.isPublished !== false ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setEditingPost(post);
                      setDrawerOpen(true);
                    }}
                    className="h-8 px-3 text-xs"
                  >
                    <Edit className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <button
                    type="button"
                    onClick={() => handleDelete(post)}
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
      <BlogDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditingPost(null);
        }}
        post={editingPost}
        onSaved={(saved, isNew) => {
          if (isNew) {
            setPosts([saved, ...posts]);
          } else {
            setPosts(
              posts.map((p) => (p._id === saved._id ? saved : p))
            );
          }
        }}
      />
    </div>
  );
}
