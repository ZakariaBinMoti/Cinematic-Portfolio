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
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button, PageHeader, Card } from "../../_ui";
import SkillCategoryColumn from "./SkillCategoryColumn";
import SkillCategoryDrawer from "./SkillCategoryDrawer";
import { deleteSkill, reorderSkills, restoreSkill } from "./actions";

interface SkillGroup {
  _id: string;
  category: string;
  items: string[];
  order: number;
}

export default function SkillsManager({
  initialSkills,
}: {
  initialSkills: SkillGroup[];
}) {
  const searchParams = useSearchParams();
  const [skills, setSkills] = useState<SkillGroup[]>(initialSkills);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setDrawerOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    setSkills(initialSkills);
  }, [initialSkills]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = skills.findIndex((s) => s._id === active.id);
    const newIndex = skills.findIndex((s) => s._id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(skills, oldIndex, newIndex).map((s, idx) => ({
      ...s,
      order: idx,
    }));
    setSkills(reordered);

    try {
      await reorderSkills(reordered.map((s) => s._id));
      toast.success("Category order updated", { duration: 2000 });
    } catch {
      toast.error("Failed to persist category order");
      setSkills(initialSkills);
    }
  };

  const handleDeleteGroup = async (group: SkillGroup) => {
    const previous = [...skills];
    setSkills(skills.filter((s) => s._id !== group._id));

    try {
      const res = await deleteSkill(group._id);
      if (res.success) {
        toast("Category deleted", {
          description: `"${group.category}" has been removed.`,
          action: {
            label: "Undo",
            onClick: async () => {
              const restoreRes = await restoreSkill(res.backup);
              if (restoreRes.success) {
                setSkills((curr) => [...curr, restoreRes.skill]);
                toast.success("Category restored");
              }
            },
          },
        });
      } else {
        setSkills(previous);
        toast.error("Failed to delete category");
      }
    } catch {
      setSkills(previous);
      toast.error("Error deleting category");
    }
  };

  const handleGroupUpdated = (updatedGroup: SkillGroup) => {
    setSkills((curr) =>
      curr.map((s) => (s._id === updatedGroup._id ? updatedGroup : s))
    );
  };

  const handleCreated = (newGroup: SkillGroup) => {
    setSkills((curr) => [...curr, newGroup]);
  };

  const totalSkillTags = skills.reduce((sum, s) => sum + s.items.length, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Technical Arsenal"
        title="Skills Manager"
        description={`Manage your capabilities (${totalSkillTags} skills across ${skills.length} categories). Drag columns to reorder or add skills inline.`}
        actions={
          <Button onClick={() => setDrawerOpen(true)} size="sm" className="gap-1.5 shadow-lg">
            <Plus className="h-4 w-4" /> Add Category
          </Button>
        }
      />

      {skills.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-gray-400 mb-3">
            <Sparkles className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-white">No skill categories configured</h3>
          <p className="text-xs text-[var(--a-text-muted)] mt-1 max-w-sm mx-auto">
            Categorize your engineering toolset into domains such as Shopify Ecosystem, Frontend Systems, and APIs.
          </p>
          <div className="mt-4">
            <Button onClick={() => setDrawerOpen(true)} size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" /> Add Category
            </Button>
          </div>
        </Card>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={skills.map((s) => s._id)} strategy={rectSortingStrategy}>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {skills.map((group) => (
                <SkillCategoryColumn
                  key={group._id}
                  group={group}
                  onDeleteGroup={handleDeleteGroup}
                  onGroupUpdated={handleGroupUpdated}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <SkillCategoryDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onCreated={handleCreated}
      />
    </div>
  );
}
