"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { Button, PageHeader, Card } from "../../_ui";
import SortableExperienceCard from "./SortableExperienceCard";
import ExperienceDrawer from "./ExperienceDrawer";
import { deleteExperience, reorderExperiences, restoreExperience } from "./actions";

interface Experience {
  _id: string;
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate: string;
  description: string;
  order: number;
}

export default function ExperienceManager({
  initialExperiences,
}: {
  initialExperiences: Experience[];
}) {
  const searchParams = useSearchParams();
  const [experiences, setExperiences] = useState<Experience[]>(initialExperiences);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setEditingExperience(null);
      setDrawerOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    setExperiences(initialExperiences);
  }, [initialExperiences]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = experiences.findIndex((e) => e._id === active.id);
    const newIndex = experiences.findIndex((e) => e._id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(experiences, oldIndex, newIndex).map((e, idx) => ({
      ...e,
      order: idx,
    }));
    setExperiences(reordered);

    try {
      await reorderExperiences(reordered.map((e) => e._id));
      toast.success("Timeline order updated", { duration: 2000 });
    } catch {
      toast.error("Failed to persist timeline order");
      setExperiences(initialExperiences);
    }
  };

  const handleNew = () => {
    setEditingExperience(null);
    setDrawerOpen(true);
  };

  const handleEdit = (exp: Experience) => {
    setEditingExperience(exp);
    setDrawerOpen(true);
  };

  const handleDelete = async (exp: Experience) => {
    const previous = [...experiences];
    setExperiences(experiences.filter((e) => e._id !== exp._id));

    try {
      const res = await deleteExperience(exp._id);
      if (res.success) {
        toast("Milestone removed", {
          description: `"${exp.title} at ${exp.company}" deleted.`,
          action: {
            label: "Undo",
            onClick: async () => {
              const restoreRes = await restoreExperience(res.backup);
              if (restoreRes.success) {
                setExperiences((curr) => [...curr, restoreRes.experience]);
                toast.success("Milestone restored");
              }
            },
          },
        });
      } else {
        setExperiences(previous);
        toast.error("Failed to delete experience");
      }
    } catch {
      setExperiences(previous);
      toast.error("Error deleting experience");
    }
  };

  const handleSaved = (savedExp: Experience, isNew: boolean) => {
    if (isNew) {
      setExperiences((curr) => [...curr, savedExp]);
    } else {
      setExperiences((curr) =>
        curr.map((e) => (e._id === savedExp._id ? savedExp : e))
      );
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Career Timeline"
        title="Experience Manager"
        description="Chronicle your professional trajectory. Drag and drop roles to arrange your career timeline."
        actions={
          <Button onClick={handleNew} size="sm" className="gap-1.5 shadow-lg">
            <Plus className="h-4 w-4" /> Add Experience
          </Button>
        }
      />

      {experiences.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-gray-400 mb-3">
            <Briefcase className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-white">No experience entries yet</h3>
          <p className="text-xs text-[var(--a-text-muted)] mt-1 max-w-sm mx-auto">
            Document your career milestones, senior leadership roles, and client consulting engagements.
          </p>
          <div className="mt-4">
            <Button onClick={handleNew} size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" /> Add Experience
            </Button>
          </div>
        </Card>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={experiences.map((e) => e._id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {experiences.map((exp) => (
                <SortableExperienceCard
                  key={exp._id}
                  experience={exp}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <ExperienceDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        experience={editingExperience}
        onSaved={handleSaved}
      />
    </div>
  );
}
