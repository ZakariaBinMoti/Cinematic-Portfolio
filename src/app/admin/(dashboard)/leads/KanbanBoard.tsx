"use client";

import { useState } from "react";
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
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Sparkles,
  MessageSquare,
  CheckCircle2,
  Trophy,
  XCircle,
  Archive,
  Plus,
} from "lucide-react";
import { SerializedLead } from "./actions";
import KanbanLeadCard from "./KanbanLeadCard";

interface KanbanBoardProps {
  leads: SerializedLead[];
  onStatusChange: (leadId: string, newStatus: SerializedLead["status"]) => void;
  onEditLead: (lead: SerializedLead) => void;
  onDeleteLead?: (lead: SerializedLead) => void;
  onAddLeadToStage?: (stage: SerializedLead["status"]) => void;
}

const STAGES: Array<{
  id: SerializedLead["status"];
  label: string;
  icon: any;
  tone: string;
  headerBorder: string;
  bgGradient: string;
}> = [
  {
    id: "new",
    label: "New Inquiries",
    icon: Sparkles,
    tone: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    headerBorder: "border-emerald-500/30",
    bgGradient: "from-emerald-500/[0.03] to-transparent",
  },
  {
    id: "contacted",
    label: "Contacted / Outreach",
    icon: MessageSquare,
    tone: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
    headerBorder: "border-cyan-500/30",
    bgGradient: "from-cyan-500/[0.03] to-transparent",
  },
  {
    id: "qualified",
    label: "Qualified & Scope",
    icon: CheckCircle2,
    tone: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    headerBorder: "border-amber-500/30",
    bgGradient: "from-amber-500/[0.03] to-transparent",
  },
  {
    id: "won",
    label: "Closed Won 🏆",
    icon: Trophy,
    tone: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    headerBorder: "border-emerald-500/30",
    bgGradient: "from-emerald-500/[0.03] to-transparent",
  },
  {
    id: "lost",
    label: "Closed Lost ❌",
    icon: XCircle,
    tone: "text-rose-400 border-rose-500/30 bg-rose-500/10",
    headerBorder: "border-rose-500/30",
    bgGradient: "from-rose-500/[0.03] to-transparent",
  },
];

function KanbanColumn({
  stage,
  leads,
  onEditLead,
  onDeleteLead,
}: {
  stage: (typeof STAGES)[0];
  leads: SerializedLead[];
  onEditLead: (lead: SerializedLead) => void;
  onDeleteLead?: (lead: SerializedLead) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  const totalValue = leads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0);
  const Icon = stage.icon;

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col min-w-[280px] w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.02] p-3 transition-colors ${
        isOver ? "border-violet-500/50 bg-violet-500/[0.05]" : ""
      }`}
    >
      {/* Column Header */}
      <div className={`flex items-center justify-between border-b pb-3 mb-3 ${stage.headerBorder}`}>
        <div className="flex items-center gap-2">
          <div className={`flex h-7 w-7 items-center justify-center rounded-lg border ${stage.tone}`}>
            <Icon className="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--a-text)]">
              {stage.label}
            </h3>
            {totalValue > 0 && (
              <p className="text-[10px] font-mono text-emerald-400">
                ${totalValue.toLocaleString()} pipeline
              </p>
            )}
          </div>
        </div>

        <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold text-white">
          {leads.length}
        </span>
      </div>

      {/* Sortable Drop Area */}
      <SortableContext items={leads.map((l) => l._id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 space-y-2.5 min-h-[300px]">
          {leads.length === 0 ? (
            <div className="flex h-36 flex-col items-center justify-center rounded-xl border border-dashed border-white/10 text-center p-3">
              <p className="text-xs text-[var(--a-text-subtle)]">No leads in stage</p>
              <p className="text-[10px] text-[var(--a-text-subtle)] mt-0.5">Drag prospect card here</p>
            </div>
          ) : (
            leads.map((lead) => (
              <KanbanLeadCard
                key={lead._id}
                lead={lead}
                onEdit={onEditLead}
                onDelete={onDeleteLead}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export default function KanbanBoard({
  leads,
  onStatusChange,
  onEditLead,
  onDeleteLead,
}: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const leadId = String(active.id);
    const draggedLead = leads.find((l) => l._id === leadId);
    if (!draggedLead) return;

    // Determine target status:
    // It could be dropped directly onto a column (over.id is a stage id),
    // or onto another card inside that column (over.id is another lead._id)
    let targetStatus: SerializedLead["status"] | null = null;

    if (STAGES.some((s) => s.id === over.id)) {
      targetStatus = over.id as SerializedLead["status"];
    } else {
      const overLead = leads.find((l) => l._id === String(over.id));
      if (overLead) {
        targetStatus = overLead.status;
      }
    }

    if (targetStatus && targetStatus !== draggedLead.status) {
      onStatusChange(leadId, targetStatus);
    }
  };

  const activeLead = activeId ? leads.find((l) => l._id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-6 pt-2 custom-scrollbar">
        {STAGES.map((stage) => {
          const stageLeads = leads.filter((l) => {
            if (stage.id === "won") return l.status === "won" || l.status === "closed";
            return (l.status || "new") === stage.id;
          });
          return (
            <KanbanColumn
              key={stage.id}
              stage={stage}
              leads={stageLeads}
              onEditLead={onEditLead}
              onDeleteLead={onDeleteLead}
            />
          );
        })}
      </div>

      <DragOverlay>
        {activeLead ? (
          <KanbanLeadCard lead={activeLead} onEdit={() => {}} isOverlay />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
