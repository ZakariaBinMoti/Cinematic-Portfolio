"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  FolderKanban,
  Sparkles,
  X,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { Button, Input, Badge, PageHeader, Card } from "../../_ui";
import SortableProjectCard from "./SortableProjectCard";
import SortableProjectRow from "./SortableProjectRow";
import ProjectDrawer from "./ProjectDrawer";
import { deleteProject, reorderProjects, restoreProject } from "./actions";

interface Project {
  _id: string;
  title: string;
  description: string;
  techStack: string[];
  liveLink?: string;
  imageUrl?: string;
  order: number;
}

export default function ProjectsManager({ initialProjects }: { initialProjects: Project[] }) {
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Drag overlay active id
  const [activeId, setActiveId] = useState<string | null>(null);

  // Auto-open drawer if ?new=1
  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setEditingProject(null);
      setDrawerOpen(true);
    }
  }, [searchParams]);

  // Keep state synced with server props
  useEffect(() => {
    setProjects(initialProjects);
  }, [initialProjects]);

  // All distinct tags across projects for filtering
  const allTags = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      p.techStack?.forEach((t) => set.add(t));
    });
    return Array.from(set);
  }, [projects]);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        searchQuery === "" ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.techStack?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesTag = selectedTag === null || p.techStack?.includes(selectedTag);

      return matchesSearch && matchesTag;
    });
  }, [projects, searchQuery, selectedTag]);

  // Sensors for dnd-kit
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Avoid hijacking clicks on buttons or links
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const oldIndex = projects.findIndex((p) => p._id === active.id);
    const newIndex = projects.findIndex((p) => p._id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Optimistically update order
    const reordered = arrayMove(projects, oldIndex, newIndex).map((p, idx) => ({
      ...p,
      order: idx,
    }));

    setProjects(reordered);

    try {
      const ids = reordered.map((p) => p._id);
      await reorderProjects(ids);
      toast.success("Showcase order updated", { duration: 2000 });
    } catch (err) {
      toast.error("Failed to persist order to database");
      setProjects(initialProjects); // rollback
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setDrawerOpen(true);
  };

  const handleNew = () => {
    setEditingProject(null);
    setDrawerOpen(true);
  };

  const handleDelete = async (project: Project) => {
    const previous = [...projects];
    // Optimistic removal
    setProjects(projects.filter((p) => p._id !== project._id));

    try {
      const res = await deleteProject(project._id);
      if (res.success) {
        toast("Project removed", {
          description: `"${project.title}" has been deleted.`,
          action: {
            label: "Undo",
            onClick: async () => {
              const restoreRes = await restoreProject(res.backup);
              if (restoreRes.success) {
                setProjects((current) => [...current, restoreRes.project]);
                toast.success("Project restored");
              }
            },
          },
        });
      } else {
        setProjects(previous);
        toast.error("Failed to delete project");
      }
    } catch {
      setProjects(previous);
      toast.error("Error deleting project");
    }
  };

  const handleDrawerSaved = (savedProject: Project, isNew: boolean) => {
    if (isNew) {
      setProjects((current) => [...current, savedProject]);
    } else {
      setProjects((current) =>
        current.map((p) => (p._id === savedProject._id ? savedProject : p))
      );
    }
  };

  const activeProject = useMemo(() => {
    return projects.find((p) => p._id === activeId) || null;
  }, [projects, activeId]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Selected Work"
        title="Projects Manager"
        description="Organize your portfolio showcase. Drag and drop cards to reorder your work in real time."
        actions={
          <Button onClick={handleNew} size="sm" className="gap-1.5 shadow-lg">
            <Plus className="h-4 w-4" /> Add Project
          </Button>
        }
      />

      {/* ── Toolbar: Search, Filters, View Mode ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--a-text-subtle)]" />
          <Input
            placeholder="Search projects by name, description or tech..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 text-xs bg-black/20"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 rounded-xl bg-black/40 border border-white/5">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "grid" ? "bg-white/10 text-white shadow-sm" : "text-gray-500 hover:text-gray-300"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "list" ? "bg-white/10 text-white shadow-sm" : "text-gray-500 hover:text-gray-300"
              }`}
              title="Table View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Tag Filter Pills ── */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[var(--a-text-subtle)] text-[11px] font-medium mr-1 shrink-0">Filter:</span>
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-2.5 py-1 rounded-full transition-all shrink-0 ${
              selectedTag === null
                ? "bg-violet-500/20 text-violet-300 border border-violet-500/40 font-medium"
                : "bg-white/[0.03] text-gray-400 hover:text-white hover:bg-white/[0.06] border border-white/5"
            }`}
          >
            All ({projects.length})
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-2.5 py-1 rounded-full transition-all shrink-0 ${
                selectedTag === tag
                  ? "bg-violet-500/20 text-violet-300 border border-violet-500/40 font-medium"
                  : "bg-white/[0.03] text-gray-400 hover:text-white hover:bg-white/[0.06] border border-white/5"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* ── Draggable Projects Canvas ── */}
      {filteredProjects.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-gray-400 mb-3">
            <FolderKanban className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-white">No projects found</h3>
          <p className="text-xs text-[var(--a-text-muted)] mt-1 max-w-sm mx-auto">
            {searchQuery || selectedTag
              ? "Try adjusting your search query or tag filter to find projects."
              : "Start showcasing your craftsmanship by adding your first project."}
          </p>
          <div className="mt-4">
            <Button onClick={handleNew} size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" /> Add Project
            </Button>
          </div>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredProjects.map((p) => p._id)}
            strategy={viewMode === "grid" ? rectSortingStrategy : verticalListSortingStrategy}
          >
            {viewMode === "grid" ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProjects.map((project) => (
                  <SortableProjectCard
                    key={project._id}
                    project={project}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredProjects.map((project) => (
                  <SortableProjectRow
                    key={project._id}
                    project={project}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </SortableContext>

          {/* Drag Overlay Preview */}
          <DragOverlay>
            {activeProject ? (
              <div className="rotate-2 scale-105 shadow-2xl opacity-90 pointer-events-none">
                <SortableProjectCard
                  project={activeProject}
                  onEdit={() => {}}
                  onDelete={() => {}}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* ── Slide-over Editor Drawer ── */}
      <ProjectDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        project={editingProject}
        onSaved={handleDrawerSaved}
      />
    </div>
  );
}
