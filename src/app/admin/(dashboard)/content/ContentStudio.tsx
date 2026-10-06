"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  FileText,
  Monitor,
  Tablet,
  Smartphone,
  RotateCw,
  ExternalLink,
  Save,
  Sparkles,
  Trophy,
  GraduationCap,
  Mail,
  GripVertical,
  Plus,
  Trash2,
} from "lucide-react";
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
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import { Button, Input, Textarea, Label, Card, Badge, PageHeader, Kbd } from "../../_ui";
import { updateContentDirect } from "./actions";

export interface MetricItem {
  id: string;
  value: string;
  label: string;
}

export interface EducationItem {
  id: string;
  degree: string;
  school: string;
  score: string;
  years: string;
}

interface ContentStudioProps {
  initialContent: {
    hero?: {
      headline?: string;
      subheadline?: string;
      supporting?: string;
    };
    about?: {
      p1?: string;
      p2?: string;
      p3?: string;
      p4?: string;
    };
    achievements?: {
      metrics?: MetricItem[];
    };
    education?: {
      title?: string;
      subtitle?: string;
      items?: EducationItem[];
    };
    contact?: {
      headline?: string;
      description?: string;
      email?: string;
      linkedin?: string;
      github?: string;
      twitter?: string;
      calendly?: string;
    };
  };
}

const defaultMetrics: MetricItem[] = [
  { id: "m-1", value: "120+", label: "Websites Delivered" },
  { id: "m-2", value: "20k+", label: "USD Revenue Contribution" },
  { id: "m-3", value: "Global", label: "International Client Projects" },
  { id: "m-4", value: "Lead", label: "Shopify Team Lead" },
];

const defaultEducation: EducationItem[] = [
  {
    id: "edu-1",
    degree: "B.Sc. in Computer Science and Engineering",
    school: "East West University",
    score: "CGPA: 3.22 / 4.00",
    years: "2020 - 2024",
  },
  {
    id: "edu-2",
    degree: "HSC",
    school: "Govt. Azizul Haque College",
    score: "GPA 5.00",
    years: "Pre-2020",
  },
  {
    id: "edu-3",
    degree: "SSC",
    school: "R.D.A Laboratory School and College",
    score: "GPA 5.00",
    years: "Pre-2018",
  },
];

type StudioTab = "hero" | "about" | "achievements" | "education" | "contact";

const tabMeta: { id: StudioTab; label: string; icon: any }[] = [
  { id: "hero", label: "Hero Showcase", icon: Sparkles },
  { id: "about", label: "About Narrative", icon: FileText },
  { id: "achievements", label: "Key Metrics", icon: Trophy },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "contact", label: "Contact & Links", icon: Mail },
];

// ── Sortable Metric Item Component ──
function SortableMetricRow({
  metric,
  onChange,
  onDelete,
}: {
  metric: MetricItem;
  onChange: (field: "value" | "label", val: string) => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: metric.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors ${
        isDragging ? "opacity-50 border-violet-500/50 shadow-xl" : ""
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-300 p-1 shrink-0"
        title="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="w-28 shrink-0">
        <Input
          placeholder="e.g. 120+"
          value={metric.value}
          onChange={(e) => onChange("value", e.target.value)}
          className="font-bold text-center"
        />
      </div>

      <div className="flex-1">
        <Input
          placeholder="Metric label (e.g. Websites Delivered)"
          value={metric.label}
          onChange={(e) => onChange("label", e.target.value)}
        />
      </div>

      <button
        type="button"
        onClick={onDelete}
        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
        title="Delete metric"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

// ── Sortable Education Item Component ──
function SortableEducationRow({
  item,
  onChange,
  onDelete,
}: {
  item: EducationItem;
  onChange: (field: keyof EducationItem, val: string) => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors space-y-3 ${
        isDragging ? "opacity-50 border-cyan-500/50 shadow-xl" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-300 p-1"
            title="Drag to reorder"
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <span className="text-xs font-semibold text-gray-300">
            {item.degree || "Academic Milestone"}
          </span>
        </div>
        <button
          type="button"
          onClick={onDelete}
          className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          title="Delete milestone"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label className="text-[11px]">Degree / Certificate</Label>
          <Input
            placeholder="e.g. B.Sc. in Computer Science"
            value={item.degree}
            onChange={(e) => onChange("degree", e.target.value)}
          />
        </div>
        <div>
          <Label className="text-[11px]">Institution / School</Label>
          <Input
            placeholder="e.g. East West University"
            value={item.school}
            onChange={(e) => onChange("school", e.target.value)}
          />
        </div>
        <div>
          <Label className="text-[11px]">Score / CGPA</Label>
          <Input
            placeholder="e.g. CGPA: 3.22 / 4.00 or GPA 5.00"
            value={item.score}
            onChange={(e) => onChange("score", e.target.value)}
          />
        </div>
        <div>
          <Label className="text-[11px]">Years / Duration</Label>
          <Input
            placeholder="e.g. 2020 - 2024 or Pre-2020"
            value={item.years}
            onChange={(e) => onChange("years", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

export default function ContentStudio({ initialContent }: ContentStudioProps) {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as StudioTab) || "hero";
  const [activeTab, setActiveTab] = useState<StudioTab>(
    ["hero", "about", "achievements", "education", "contact"].includes(initialTab)
      ? initialTab
      : "hero"
  );

  // 1. Hero Form State
  const [heroForm, setHeroForm] = useState({
    headline: initialContent.hero?.headline || "Zakaria Bin Moti",
    subheadline:
      initialContent.hero?.subheadline ||
      "Software Engineer crafting premium eCommerce experiences",
    supporting:
      initialContent.hero?.supporting || "120+ business websites delivered globally.",
  });

  // 2. About Form State
  const [aboutForm, setAboutForm] = useState({
    p1:
      initialContent.about?.p1 ||
      "I am a software engineer specializing in Shopify development, modern frontend systems, and high-converting eCommerce experiences.",
    p2:
      initialContent.about?.p2 ||
      "My journey began through frontend engineering and evolved into delivering production-ready digital systems for international businesses.",
    p3:
      initialContent.about?.p3 ||
      "I combine engineering precision with visual execution to build stores and websites that are fast, scalable, conversion-driven, and business-focused.",
    p4:
      initialContent.about?.p4 ||
      "Currently leading Shopify development projects while solving advanced frontend problems for global clients.",
  });

  // 3. Achievements / Metrics State
  const [metricsList, setMetricsList] = useState<MetricItem[]>(
    initialContent.achievements?.metrics && initialContent.achievements.metrics.length > 0
      ? initialContent.achievements.metrics.map((m, idx) => ({
          id: m.id || `m-${idx}-${Date.now()}`,
          value: m.value || "",
          label: m.label || "",
        }))
      : defaultMetrics
  );

  // 4. Education State
  const [eduTitle, setEduTitle] = useState(initialContent.education?.title || "Academic");
  const [eduSubtitle, setEduSubtitle] = useState(
    initialContent.education?.subtitle || "Background."
  );
  const [educationList, setEducationList] = useState<EducationItem[]>(
    initialContent.education?.items && initialContent.education.items.length > 0
      ? initialContent.education.items.map((e, idx) => ({
          id: e.id || `edu-${idx}-${Date.now()}`,
          degree: e.degree || "",
          school: e.school || "",
          score: e.score || "",
          years: e.years || "",
        }))
      : defaultEducation
  );

  // 5. Contact State
  const [contactForm, setContactForm] = useState({
    headline:
      initialContent.contact?.headline || "Let's build something exceptional.",
    description:
      initialContent.contact?.description ||
      "Whether you need a Shopify expert, custom frontend architecture, or a full-scale eCommerce solution.",
    email: initialContent.contact?.email || "zakaria.binmoti@gmail.com",
    linkedin:
      initialContent.contact?.linkedin ||
      "https://www.linkedin.com/in/zakariabinmoti",
    github: initialContent.contact?.github || "https://github.com/ZakariaBinMoti",
    twitter: initialContent.contact?.twitter || "",
    calendly: initialContent.contact?.calendly || "",
  });

  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  // Live preview device switcher
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">(
    "desktop"
  );
  const [iframeKey, setIframeKey] = useState(0);
  const [isReloadingPreview, setIsReloadingPreview] = useState(false);

  // DnD Sensors
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

  // Keyboard shortcut Ctrl+S / Ctrl+Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "Enter")) {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, heroForm, aboutForm, metricsList, educationList, contactForm, eduTitle, eduSubtitle]);

  const reloadPreview = () => {
    setIsReloadingPreview(true);
    setIframeKey((k) => k + 1);
    setTimeout(() => setIsReloadingPreview(false), 600);
  };

  const handleSave = async () => {
    setSaving(true);
    const activeLabel =
      tabMeta.find((t) => t.id === activeTab)?.label || "Section";
    const toastId = toast.loading(`Saving ${activeLabel}...`);

    try {
      let dataToSave: any;
      if (activeTab === "hero") {
        dataToSave = heroForm;
      } else if (activeTab === "about") {
        dataToSave = aboutForm;
      } else if (activeTab === "achievements") {
        dataToSave = { metrics: metricsList };
      } else if (activeTab === "education") {
        dataToSave = {
          title: eduTitle,
          subtitle: eduSubtitle,
          items: educationList,
        };
      } else if (activeTab === "contact") {
        dataToSave = contactForm;
      }

      const res = await updateContentDirect(activeTab, dataToSave);

      if (res.success) {
        setIsDirty(false);
        const now = new Date();
        setLastSavedTime(
          now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        );
        toast.success(`${activeLabel} updated!`, { id: toastId });

        setTimeout(() => {
          reloadPreview();
        }, 300);
      } else {
        toast.error("Failed to save content", { id: toastId });
      }
    } catch (err: any) {
      toast.error(err?.message || "An error occurred", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  // DnD Handlers for Metrics
  const handleDragEndMetrics = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setMetricsList((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
      setIsDirty(true);
    }
  };

  const addMetric = (value = "100+", label = "Custom Metric") => {
    setMetricsList((prev) => [
      ...prev,
      { id: `m-${Date.now()}`, value, label },
    ]);
    setIsDirty(true);
  };

  // DnD Handlers for Education
  const handleDragEndEducation = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setEducationList((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
      setIsDirty(true);
    }
  };

  const addEducation = () => {
    setEducationList((prev) => [
      ...prev,
      {
        id: `edu-${Date.now()}`,
        degree: "New Degree / Certification",
        school: "University / Institute",
        score: "Score / Grade",
        years: "Year - Year",
      },
    ]);
    setIsDirty(true);
  };

  const deviceWidthClass =
    previewDevice === "mobile"
      ? "max-w-[375px]"
      : previewDevice === "tablet"
      ? "max-w-[640px]"
      : "w-full";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Content Management System"
        title="Content Studio"
        description="Craft your portfolio narrative, showcase metrics, academic milestones, and contact profiles with live dual-pane preview."
        actions={
          <div className="flex items-center gap-2.5">
            {isDirty && (
              <Badge tone="amber" className="animate-pulse">
                Unsaved edits
              </Badge>
            )}
            {lastSavedTime && !isDirty && (
              <span className="text-xs text-[var(--a-text-subtle)]">
                Saved at {lastSavedTime}
              </span>
            )}
            <Button
              onClick={handleSave}
              size="sm"
              loading={saving}
              className="gap-1.5 shadow-lg"
            >
              <Save className="h-4 w-4" /> Save Changes
            </Button>
          </div>
        }
      />

      {/* ── Main Dual-Pane Studio ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Editor (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Section Selector Tabs */}
          <div className="p-1.5 rounded-2xl bg-black/40 border border-white/5 flex flex-wrap gap-1">
            {tabMeta.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 py-2 px-3 text-xs font-medium rounded-xl transition-all ${
                    isActive
                      ? "bg-white/10 text-white shadow-sm border border-white/10"
                      : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <Card className="p-6 space-y-6">
            {/* ── Tab 1: Hero Showcase ── */}
            {activeTab === "hero" && (
              <>
                <div className="border-b border-white/5 pb-4">
                  <h3 className="text-base font-semibold text-white">Hero Intro Copy</h3>
                  <p className="text-xs text-[var(--a-text-muted)] mt-0.5">
                    Controls the opening scrollytelling scene headline and sub-taglines
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label htmlFor="h-title">Main Headline</Label>
                    <span className="text-[10px] text-[var(--a-text-subtle)]">
                      {heroForm.headline.length}/40
                    </span>
                  </div>
                  <Input
                    id="h-title"
                    value={heroForm.headline}
                    onChange={(e) => {
                      setHeroForm({ ...heroForm, headline: e.target.value });
                      setIsDirty(true);
                    }}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label htmlFor="h-sub">Subheadline / Specialization</Label>
                    <span className="text-[10px] text-[var(--a-text-subtle)]">
                      {heroForm.subheadline.length}/100
                    </span>
                  </div>
                  <Textarea
                    id="h-sub"
                    rows={2}
                    value={heroForm.subheadline}
                    onChange={(e) => {
                      setHeroForm({ ...heroForm, subheadline: e.target.value });
                      setIsDirty(true);
                    }}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label htmlFor="h-sup">Supporting Proof Point</Label>
                    <span className="text-[10px] text-[var(--a-text-subtle)]">
                      {heroForm.supporting.length}/80
                    </span>
                  </div>
                  <Input
                    id="h-sup"
                    value={heroForm.supporting}
                    onChange={(e) => {
                      setHeroForm({ ...heroForm, supporting: e.target.value });
                      setIsDirty(true);
                    }}
                  />
                  <p className="text-[11px] text-[var(--a-text-subtle)] mt-1.5">
                    Example: &quot;120+ business websites delivered globally.&quot;
                  </p>
                </div>
              </>
            )}

            {/* ── Tab 2: About Narrative ── */}
            {activeTab === "about" && (
              <>
                <div className="border-b border-white/5 pb-4">
                  <h3 className="text-base font-semibold text-white">About Bio Narrative</h3>
                  <p className="text-xs text-[var(--a-text-muted)] mt-0.5">
                    Four sequential paragraphs composing your professional story
                  </p>
                </div>

                <div>
                  <Label htmlFor="about-p1">Paragraph 1 — Mission & Niche</Label>
                  <Textarea
                    id="about-p1"
                    rows={2}
                    value={aboutForm.p1}
                    onChange={(e) => {
                      setAboutForm({ ...aboutForm, p1: e.target.value });
                      setIsDirty(true);
                    }}
                  />
                </div>

                <div>
                  <Label htmlFor="about-p2">Paragraph 2 — Origin & Evolution</Label>
                  <Textarea
                    id="about-p2"
                    rows={2}
                    value={aboutForm.p2}
                    onChange={(e) => {
                      setAboutForm({ ...aboutForm, p2: e.target.value });
                      setIsDirty(true);
                    }}
                  />
                </div>

                <div>
                  <Label htmlFor="about-p3">Paragraph 3 — Philosophy & Execution</Label>
                  <Textarea
                    id="about-p3"
                    rows={2}
                    value={aboutForm.p3}
                    onChange={(e) => {
                      setAboutForm({ ...aboutForm, p3: e.target.value });
                      setIsDirty(true);
                    }}
                  />
                </div>

                <div>
                  <Label htmlFor="about-p4">Paragraph 4 — Current Focus</Label>
                  <Textarea
                    id="about-p4"
                    rows={2}
                    value={aboutForm.p4}
                    onChange={(e) => {
                      setAboutForm({ ...aboutForm, p4: e.target.value });
                      setIsDirty(true);
                    }}
                  />
                </div>
              </>
            )}

            {/* ── Tab 3: Key Metrics & Achievements ── */}
            {activeTab === "achievements" && (
              <>
                <div className="border-b border-white/5 pb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-white">
                      Key Metrics & Achievements
                    </h3>
                    <p className="text-xs text-[var(--a-text-muted)] mt-0.5">
                      Drag cards to reorder proof metrics. Changes reflect immediately on live site.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addMetric()}
                    className="gap-1 shrink-0"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add
                  </Button>
                </div>

                {/* Quick preset suggestions */}
                <div className="space-y-1.5">
                  <span className="text-[11px] text-[var(--a-text-subtle)] block">
                    Quick Suggestion Chips:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { v: "5+ Yrs", l: "Industry Experience" },
                      { v: "99.9%", l: "Client Satisfaction" },
                      { v: "50+", l: "Repeat Clients" },
                      { v: "Top Rated", l: "Shopify Developer" },
                    ].map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => addMetric(chip.v, chip.l)}
                        className="text-[11px] px-2.5 py-1 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-violet-500/15 hover:border-violet-500/30 text-gray-400 hover:text-violet-300 transition-colors"
                      >
                        + {chip.v} ({chip.l})
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sortable Metrics List */}
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEndMetrics}
                >
                  <SortableContext
                    items={metricsList.map((m) => m.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2.5">
                      {metricsList.map((metric) => (
                        <SortableMetricRow
                          key={metric.id}
                          metric={metric}
                          onChange={(field, val) => {
                            setMetricsList((prev) =>
                              prev.map((m) =>
                                m.id === metric.id ? { ...m, [field]: val } : m
                              )
                            );
                            setIsDirty(true);
                          }}
                          onDelete={() => {
                            setMetricsList((prev) =>
                              prev.filter((m) => m.id !== metric.id)
                            );
                            setIsDirty(true);
                          }}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </>
            )}

            {/* ── Tab 4: Academic & Education ── */}
            {activeTab === "education" && (
              <>
                <div className="border-b border-white/5 pb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-white">
                      Academic Background
                    </h3>
                    <p className="text-xs text-[var(--a-text-muted)] mt-0.5">
                      Manage degrees, certifications, institutions, and chronological ordering
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addEducation}
                    className="gap-1 shrink-0"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Milestone
                  </Button>
                </div>

                {/* Section Header Customization */}
                <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <div>
                    <Label className="text-[11px]">Section Title</Label>
                    <Input
                      value={eduTitle}
                      onChange={(e) => {
                        setEduTitle(e.target.value);
                        setIsDirty(true);
                      }}
                      placeholder="Academic"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px]">Section Subtitle</Label>
                    <Input
                      value={eduSubtitle}
                      onChange={(e) => {
                        setEduSubtitle(e.target.value);
                        setIsDirty(true);
                      }}
                      placeholder="Background."
                    />
                  </div>
                </div>

                {/* Sortable Education List */}
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEndEducation}
                >
                  <SortableContext
                    items={educationList.map((e) => e.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3">
                      {educationList.map((item) => (
                        <SortableEducationRow
                          key={item.id}
                          item={item}
                          onChange={(field, val) => {
                            setEducationList((prev) =>
                              prev.map((e) =>
                                e.id === item.id ? { ...e, [field]: val } : e
                              )
                            );
                            setIsDirty(true);
                          }}
                          onDelete={() => {
                            setEducationList((prev) =>
                              prev.filter((e) => e.id !== item.id)
                            );
                            setIsDirty(true);
                          }}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </>
            )}

            {/* ── Tab 5: Contact & Social Links ── */}
            {activeTab === "contact" && (
              <>
                <div className="border-b border-white/5 pb-4">
                  <h3 className="text-base font-semibold text-white">
                    Contact & Social Profiles
                  </h3>
                  <p className="text-xs text-[var(--a-text-muted)] mt-0.5">
                    Controls call-to-action copy, contact emails, and social profiles in the footer
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label htmlFor="contact-headline">Call-to-Action Headline</Label>
                    <span className="text-[10px] text-[var(--a-text-subtle)]">
                      {contactForm.headline.length}/60
                    </span>
                  </div>
                  <Input
                    id="contact-headline"
                    value={contactForm.headline}
                    onChange={(e) => {
                      setContactForm({ ...contactForm, headline: e.target.value });
                      setIsDirty(true);
                    }}
                    placeholder="Let's build something exceptional."
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label htmlFor="contact-desc">Supporting Subtitle</Label>
                    <span className="text-[10px] text-[var(--a-text-subtle)]">
                      {contactForm.description.length}/140
                    </span>
                  </div>
                  <Textarea
                    id="contact-desc"
                    rows={2}
                    value={contactForm.description}
                    onChange={(e) => {
                      setContactForm({
                        ...contactForm,
                        description: e.target.value,
                      });
                      setIsDirty(true);
                    }}
                    placeholder="Whether you need a Shopify expert, custom frontend architecture..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div>
                    <Label htmlFor="contact-email">Primary Email</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => {
                        setContactForm({ ...contactForm, email: e.target.value });
                        setIsDirty(true);
                      }}
                      placeholder="you@domain.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact-linkedin">LinkedIn Profile URL</Label>
                    <Input
                      id="contact-linkedin"
                      value={contactForm.linkedin}
                      onChange={(e) => {
                        setContactForm({
                          ...contactForm,
                          linkedin: e.target.value,
                        });
                        setIsDirty(true);
                      }}
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact-github">GitHub Profile URL</Label>
                    <Input
                      id="contact-github"
                      value={contactForm.github}
                      onChange={(e) => {
                        setContactForm({ ...contactForm, github: e.target.value });
                        setIsDirty(true);
                      }}
                      placeholder="https://github.com/username"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact-twitter">X / Twitter (Optional)</Label>
                    <Input
                      id="contact-twitter"
                      value={contactForm.twitter}
                      onChange={(e) => {
                        setContactForm({ ...contactForm, twitter: e.target.value });
                        setIsDirty(true);
                      }}
                      placeholder="https://x.com/username"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="contact-calendly">Calendly / Meeting Link (Optional)</Label>
                    <Input
                      id="contact-calendly"
                      value={contactForm.calendly}
                      onChange={(e) => {
                        setContactForm({ ...contactForm, calendly: e.target.value });
                        setIsDirty(true);
                      }}
                      placeholder="https://calendly.com/your-name/30min"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Bottom Save Action Bar */}
            <div className="pt-2 flex items-center justify-between border-t border-white/5 text-xs text-[var(--a-text-subtle)]">
              <span className="flex items-center gap-1">
                <Kbd>Ctrl</Kbd>
                <Kbd>S</Kbd> to save
              </span>
              <Button
                onClick={handleSave}
                size="sm"
                loading={saving}
                className="gap-1.5"
              >
                <Save className="h-3.5 w-3.5" /> Save Section
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column: Interactive Live Preview Iframe (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-4 bg-gradient-to-b from-white/[0.03] to-black/60 border-white/10">
            {/* Preview Toolbar */}
            <div className="flex items-center justify-between pb-3.5 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                <span className="text-xs font-semibold text-white">Live Render Preview</span>
              </div>

              {/* Viewport switchers */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-black/40 border border-white/5">
                <button
                  onClick={() => setPreviewDevice("desktop")}
                  className={`p-1.5 rounded-lg transition-colors ${
                    previewDevice === "desktop"
                      ? "bg-white/10 text-white"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                  title="Desktop Preview"
                >
                  <Monitor className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setPreviewDevice("tablet")}
                  className={`p-1.5 rounded-lg transition-colors ${
                    previewDevice === "tablet"
                      ? "bg-white/10 text-white"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                  title="Tablet (640px)"
                >
                  <Tablet className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setPreviewDevice("mobile")}
                  className={`p-1.5 rounded-lg transition-colors ${
                    previewDevice === "mobile"
                      ? "bg-white/10 text-white"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                  title="Mobile (375px)"
                >
                  <Smartphone className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={reloadPreview}
                  className={`p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all ${
                    isReloadingPreview ? "animate-spin text-violet-400" : ""
                  }`}
                  title="Refresh Preview"
                >
                  <RotateCw className="h-3.5 w-3.5" />
                </button>
                <a
                  href="/"
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                  title="Open live site in new tab"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            {/* Iframe Viewport Frame */}
            <div className="pt-4 flex justify-center items-center min-h-[560px] bg-black/50 rounded-xl overflow-hidden p-2">
              <div
                className={`transition-all duration-300 rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-[#121212] ${deviceWidthClass} h-[600px] flex flex-col`}
              >
                {/* Fake browser bar */}
                <div className="h-7 bg-[#1e1e24] border-b border-white/5 flex items-center px-3 gap-1.5 shrink-0">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                  </div>
                  <span className="ml-auto mr-auto text-[10px] text-gray-400 font-mono">
                    localhost:3000
                  </span>
                </div>

                {/* Actual Live Iframe */}
                <iframe
                  key={iframeKey}
                  src="/"
                  className="w-full flex-1 border-0"
                  title="Live Portfolio Preview"
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
