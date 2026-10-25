"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Sparkles,
  Bot,
  Zap,
  Globe,
  Mail,
  Copy,
  Check,
  Building2,
  DollarSign,
  TrendingUp,
  X,
  Plus,
  ArrowRight,
  ExternalLink,
  Flame,
  Send,
  Sliders,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  MessageSquare,
  User,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import {
  MARKET_CATEGORIES,
  MarketCategory,
  GeneratedProspect,
} from "@/lib/ai-lead-generator";
import {
  SerializedAiSettings,
  getAiRadarSettings,
  updateAiRadarSettings,
  generateAiProspectBatch,
  importProspectsToCrm,
} from "./ai-actions";

interface AiLeadRadarModalProps {
  open: boolean;
  onClose: () => void;
  onLeadsImported?: () => void;
  onEmailLead?: (prospect: GeneratedProspect) => void;
}

const REGION_OPTIONS = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Worldwide / Any",
];

const PLATFORM_OPTIONS = [
  { value: "any", label: "Any Tech Platform" },
  { value: "WooCommerce", label: "WooCommerce (Prime Migration Target)" },
  { value: "Wix", label: "Wix / Squarespace (Needs Shopify Scale)" },
  { value: "Outdated Custom Site", label: "Legacy / Slow Website" },
  { value: "No Online Store", label: "No Store / Social Selling Only" },
  { value: "Shopify (Legacy Theme)", label: "Shopify (Needs CRO & Speed Redesign)" },
];

export default function AiLeadRadarModal({
  open,
  onClose,
  onLeadsImported,
  onEmailLead,
}: AiLeadRadarModalProps) {
  // Settings & state
  const [settings, setSettings] = useState<SerializedAiSettings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);

  // Discovery parameters
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("restaurant");
  const [selectedLocation, setSelectedLocation] = useState<string>("United States");
  const [customCity, setCustomCity] = useState<string>("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("any");
  const [customNiche, setCustomNiche] = useState<string>("");
  const [batchCount, setBatchCount] = useState<number>(5);

  // Generation state
  const [generating, setGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>("");
  const [prospects, setProspects] = useState<GeneratedProspect[]>([]);
  const [importedIds, setImportedIds] = useState<Set<string>>(new Set());

  // Pitch preview drawer state
  const [viewingPitchProspect, setViewingPitchProspect] = useState<GeneratedProspect | null>(null);
  const [pitchTab, setPitchTab] = useState<"email" | "dm">("email");
  const [copiedPitch, setCopiedPitch] = useState(false);
  const [copiedSubject, setCopiedSubject] = useState(false);

  // Settings edit mode
  const [editingDailyQuota, setEditingDailyQuota] = useState(false);
  const [tempQuota, setTempQuota] = useState<number>(10);
  const [isPending, startTransition] = useTransition();

  // Load settings on mount or open
  useEffect(() => {
    if (!open) return;
    let mounted = true;
    getAiRadarSettings().then((s) => {
      if (mounted) {
        setSettings(s);
        setTempQuota(s.dailyQuota);
        setLoadingSettings(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, [open]);

  if (!open) return null;

  const currentCategory =
    MARKET_CATEGORIES.find((c) => c.id === selectedCategoryId) || MARKET_CATEGORIES[0];

  // Save quota update
  const handleSaveQuota = async (newQuota: number) => {
    if (newQuota < 1) newQuota = 1;
    if (newQuota > 100) newQuota = 100;
    try {
      await updateAiRadarSettings({ dailyQuota: newQuota });
      setSettings((prev) => (prev ? { ...prev, dailyQuota: newQuota } : null));
      setEditingDailyQuota(false);
      toast.success(`Daily generation quota set to ${newQuota} leads/day`);
    } catch {
      toast.error("Failed to update daily quota");
    }
  };

  // Toggle Auto-Pilot
  const handleToggleAutoPilot = async () => {
    if (!settings) return;
    const nextState = !settings.autoPilotEnabled;
    try {
      await updateAiRadarSettings({ autoPilotEnabled: nextState });
      setSettings((prev) => (prev ? { ...prev, autoPilotEnabled: nextState } : null));
      toast.success(
        nextState
          ? "AI Auto-Pilot activated (Daily quota will run automatically)"
          : "AI Auto-Pilot paused"
      );
    } catch {
      toast.error("Failed to update Auto-Pilot status");
    }
  };

  // Run Lead Radar Generation
  const handleRunRadar = async () => {
    setGenerating(true);
    setGenerationStep("Initializing Google Gemini Intelligence Engine...");

    const locationQuery = customCity.trim()
      ? `${customCity.trim()}, ${selectedLocation}`
      : selectedLocation;

    try {
      setTimeout(() => {
        setGenerationStep(`Scanning ${currentCategory.name} in ${locationQuery}...`);
      }, 700);

      setTimeout(() => {
        setGenerationStep("Auditing tech stacks & diagnosing conversion bottlenecks...");
      }, 1600);

      setTimeout(() => {
        setGenerationStep("Crafting hyper-personalized Shopify outreach pitches...");
      }, 2500);

      const res = await generateAiProspectBatch({
        category: selectedCategoryId,
        location: locationQuery,
        currentPlatform: selectedPlatform,
        count: batchCount,
        customNiche: customNiche.trim() || undefined,
      });

      if (!res.success || !res.prospects || res.prospects.length === 0) {
        throw new Error(res.error || "Failed to generate prospective clients");
      }

      setProspects(res.prospects);
      setImportedIds(new Set());

      // Refresh today count in local settings
      setSettings((prev) =>
        prev
          ? {
              ...prev,
              leadsGeneratedToday: (prev.leadsGeneratedToday || 0) + res.prospects.length,
              leadsGeneratedTotal: (prev.leadsGeneratedTotal || 0) + res.prospects.length,
            }
          : null
      );

      toast.success(`Discovered ${res.prospects.length} high-ticket client leads!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to run AI Lead Radar");
    } finally {
      setGenerating(false);
      setGenerationStep("");
    }
  };

  // Import single lead to CRM
  const handleImportSingle = async (prospect: GeneratedProspect, index: number) => {
    const key = `${prospect.businessName}-${index}`;
    try {
      const res = await importProspectsToCrm([prospect]);
      if (res.success && res.count > 0) {
        setImportedIds((prev) => new Set(prev).add(key));
        toast.success(`"${prospect.businessName}" imported to CRM Pipeline!`);
        if (onLeadsImported) onLeadsImported();
      } else {
        toast.info("This lead is already present in your CRM pipeline");
        setImportedIds((prev) => new Set(prev).add(key));
      }
    } catch {
      toast.error("Failed to import lead to CRM");
    }
  };

  // Import all leads to CRM
  const handleImportAll = async () => {
    if (prospects.length === 0) return;
    try {
      const res = await importProspectsToCrm(prospects);
      if (res.success) {
        // Mark all as imported
        const allKeys = new Set(prospects.map((p, idx) => `${p.businessName}-${idx}`));
        setImportedIds(allKeys);
        toast.success(`Successfully imported ${res.count} leads to your CRM Pipeline!`);
        if (onLeadsImported) onLeadsImported();
      }
    } catch {
      toast.error("Failed to import all leads");
    }
  };

  // Copy Pitch
  const handleCopyPitch = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPitch(true);
    toast.success("Outreach message copied to clipboard");
    setTimeout(() => setCopiedPitch(false), 2000);
  };

  // Copy Subject
  const handleCopySubject = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSubject(true);
    toast.success("Subject line copied");
    setTimeout(() => setCopiedSubject(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-5xl rounded-3xl border border-violet-500/30 bg-[#0c0c16] text-white shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Glow Header Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-cyan-400 to-emerald-400" />

        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 sm:p-6 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3.5">
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 text-white shadow-lg shadow-violet-500/30">
              <Sparkles className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-violet-500/20 px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-violet-300 border border-violet-500/30">
                  Phase 6 Engine
                </span>
                <span className="text-xs text-[var(--a-text-subtle)]">
                  Autonomous Client Prospecting Radar
                </span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white mt-0.5">
                AI Client Discovery Radar
              </h2>
            </div>
          </div>

          {/* Daily Quota & Close */}
          <div className="flex items-center gap-3">
            {/* Daily Quota Status Badge */}
            {settings && (
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs">
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] text-[var(--a-text-subtle)]">
                    <span>Daily Quota:</span>
                    {editingDailyQuota ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={tempQuota}
                          onChange={(e) => setTempQuota(Number(e.target.value))}
                          className="w-12 h-6 px-1 rounded bg-black/60 border border-violet-400 text-xs text-center text-white"
                          min={1}
                          max={100}
                        />
                        <button
                          onClick={() => handleSaveQuota(tempQuota)}
                          className="text-emerald-400 hover:text-emerald-300 text-xs"
                        >
                          ✓
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingDailyQuota(true)}
                        className="font-bold text-white hover:text-violet-300 underline decoration-dotted"
                        title="Click to change daily quota"
                      >
                        {settings.dailyQuota}/day
                      </button>
                    )}
                  </div>
                  <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                    {settings.leadsGeneratedToday} of {settings.dailyQuota} generated today
                  </div>
                </div>

                <div className="h-6 w-px bg-white/10 mx-1" />

                {/* Auto Pilot Toggle */}
                <button
                  onClick={handleToggleAutoPilot}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all ${
                    settings.autoPilotEnabled
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-white/5 text-zinc-400 border border-white/10"
                  }`}
                  title="Toggle automated daily client discovery"
                >
                  <Bot className="h-3 w-3" />
                  <span>{settings.autoPilotEnabled ? "Auto-Pilot ON" : "Paused"}</span>
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-[var(--a-text-subtle)] hover:bg-white/10 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 custom-scrollbar">
          {/* Section 1: Target Market Category Selection */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--a-text-subtle)] flex items-center gap-1.5">
                <span>1. Select Target Market &amp; Industry Niche</span>
                <span className="text-[10px] lowercase font-normal text-violet-400">
                  (Pick the exact types of businesses you want to acquire as clients)
                </span>
              </label>
              <span className="text-[11px] text-[var(--a-text-subtle)]">
                Selected: <strong className="text-white">{currentCategory.name}</strong>
              </span>
            </div>

            {/* Category Chips Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {MARKET_CATEGORIES.map((cat) => {
                const active = selectedCategoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`flex items-start gap-2.5 p-3 rounded-2xl text-left transition-all border ${
                      active
                        ? "border-violet-500 bg-violet-500/15 text-white shadow-lg shadow-violet-500/10 scale-[1.02]"
                        : "border-white/10 bg-white/[0.02] text-zinc-300 hover:border-white/20 hover:bg-white/[0.05]"
                    }`}
                  >
                    <span className="text-xl shrink-0 mt-0.5">{cat.icon}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold leading-tight truncate text-white">
                        {cat.name.split(",")[0]}
                      </p>
                      <p className="text-[10px] text-[var(--a-text-subtle)] font-mono mt-1">
                        Est: {cat.typicalBudget}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Category Intelligence Insight Banner */}
            <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-r from-violet-500/[0.05] to-transparent p-3.5 text-xs text-zinc-300 flex items-start gap-3">
              <div className="h-6 w-6 rounded-lg bg-violet-500/20 text-violet-300 flex items-center justify-center shrink-0 mt-0.5">
                <Flame className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-white">{currentCategory.description}</p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-violet-300">
                  <span className="font-semibold text-[var(--a-text-subtle)]">Primary Bottleneck:</span>
                  <span>{currentCategory.typicalPainPoints[0]}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Geographic & Tech Stack Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-white/10">
            {/* Target Geography */}
            <div>
              <label className="text-xs font-semibold text-[var(--a-text-subtle)] block mb-1.5">
                Target Country / Region
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white outline-none focus:border-violet-400"
              >
                {REGION_OPTIONS.map((r) => (
                  <option key={r} value={r} className="bg-gray-900 text-white">
                    📍 {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Specific City or Sub-Region */}
            <div>
              <label className="text-xs font-semibold text-[var(--a-text-subtle)] block mb-1.5">
                Specific City / Metro Area (Optional)
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Miami, Austin, London, New York..."
                  value={customCity}
                  onChange={(e) => setCustomCity(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white outline-none focus:border-violet-400"
                />
              </div>
            </div>

            {/* Platform / Technology Target */}
            <div>
              <label className="text-xs font-semibold text-[var(--a-text-subtle)] block mb-1.5">
                Target Technology Stack
              </label>
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white outline-none focus:border-violet-400"
              >
                {PLATFORM_OPTIONS.map((p) => (
                  <option key={p.value} value={p.value} className="bg-gray-900 text-white">
                    ⚡ {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 3: Quantity & Trigger Action */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-2xl border border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <label className="text-xs font-medium text-[var(--a-text-subtle)]">
                Batch Generation Quantity:
              </label>
              <div className="flex items-center rounded-xl border border-white/10 bg-black/40 p-1">
                {[3, 5, 10, 15].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setBatchCount(cnt)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                      batchCount === cnt
                        ? "bg-violet-600 text-white shadow-sm"
                        : "text-[var(--a-text-subtle)] hover:text-white"
                    }`}
                  >
                    {cnt}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              disabled={generating}
              onClick={handleRunRadar}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold transition-all shadow-xl ${
                generating
                  ? "bg-violet-500/50 text-white/70 cursor-not-allowed"
                  : "bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 text-white hover:opacity-95 shadow-violet-500/25 hover:scale-[1.02]"
              }`}
            >
              {generating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Scanning Market...</span>
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 text-cyan-300" />
                  <span>Launch AI Lead Radar</span>
                </>
              )}
            </button>
          </div>

          {/* Live Progress Indicator during Generation */}
          {generating && (
            <div className="p-4 rounded-2xl border border-violet-500/30 bg-violet-500/10 text-center space-y-2 animate-pulse">
              <p className="text-xs font-semibold text-violet-300 flex items-center justify-center gap-2">
                <Bot className="h-4 w-4 animate-bounce" />
                <span>{generationStep || "AI is synthesizing high-ticket client prospects..."}</span>
              </p>
              <div className="w-full max-w-md mx-auto bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-violet-500 to-cyan-400 h-full w-2/3 animate-pulse rounded-full" />
              </div>
            </div>
          )}

          {/* Section 4: Discovered Prospects Staging Radar */}
          {prospects.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">
                    Discovered Prospects ({prospects.length})
                  </h3>
                  <span className="text-xs text-[var(--a-text-subtle)]">
                    · Ready for one-click CRM import &amp; outreach
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleImportAll}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-black hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 self-start sm:self-auto"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Import All {prospects.length} Leads to CRM</span>
                </button>
              </div>

              {/* Prospects Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {prospects.map((prospect, idx) => {
                  const key = `${prospect.businessName}-${idx}`;
                  const isImported = importedIds.has(key);

                  return (
                    <div
                      key={key}
                      className="rounded-2xl border border-white/10 bg-white/[0.02] p-4.5 space-y-3.5 hover:border-violet-500/40 transition-all"
                    >
                      {/* Top Row: Business Name & Estimated Value */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white">{prospect.businessName}</h4>
                            <span className="rounded bg-violet-500/20 px-1.5 py-0.2 text-[10px] font-mono text-violet-300">
                              🔥{prospect.leadScore}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-[var(--a-text-subtle)] mt-0.5">
                            <span className="flex items-center gap-1 text-zinc-300">
                              <User className="h-3 w-3 text-cyan-400" />
                              <strong>{prospect.ownerName}</strong> ({prospect.ownerRole})
                            </span>
                            <span>•</span>
                            <span>{prospect.location}</span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-sm font-mono font-bold text-emerald-400">
                            ${prospect.estimatedValue.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-[var(--a-text-subtle)] block">
                            est. deal
                          </span>
                        </div>
                      </div>

                      {/* Contact & Stack Pills */}
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                        <span className="font-mono text-zinc-300 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                          {prospect.email}
                        </span>
                        <span className="rounded bg-amber-500/10 text-amber-300 px-2 py-0.5 border border-amber-500/20">
                          {prospect.currentPlatform}
                        </span>
                        <a
                          href={prospect.website}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 rounded bg-cyan-500/10 text-cyan-300 px-2 py-0.5 border border-cyan-500/20 hover:underline"
                        >
                          <Globe className="h-3 w-3" />
                          <span>{prospect.website.replace(/^https?:\/\//, "")}</span>
                          <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                        </a>
                      </div>

                      {/* Diagnosed Bottlenecks */}
                      <div className="rounded-xl border border-white/5 bg-black/40 p-2.5 text-[11px] space-y-1">
                        <span className="font-semibold text-rose-300 uppercase tracking-wider text-[10px] block">
                          Diagnosed Bottleneck:
                        </span>
                        <p className="text-zinc-300 leading-snug">
                          {prospect.painPoints[0] || "Outdated mobile UX causing high bounce rate"}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
                        <button
                          type="button"
                          onClick={() => setViewingPitchProspect(prospect)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/25 transition-colors"
                        >
                          <MessageSquare className="h-3 w-3" />
                          <span>View Tailored Pitch</span>
                        </button>

                        <button
                          type="button"
                          disabled={isImported}
                          onClick={() => handleImportSingle(prospect, idx)}
                          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                            isImported
                              ? "bg-white/10 text-emerald-400 border border-emerald-500/30 cursor-default"
                              : "bg-emerald-500 text-black hover:bg-emerald-400 shadow-sm"
                          }`}
                        >
                          {isImported ? (
                            <>
                              <Check className="h-3.5 w-3.5" />
                              <span>In CRM Pipeline</span>
                            </>
                          ) : (
                            <>
                              <Plus className="h-3.5 w-3.5" />
                              <span>Add to CRM</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Tailored Pitch Preview Drawer (Sub-modal) */}
        {viewingPitchProspect && (
          <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="relative w-full max-w-2xl rounded-2xl border border-cyan-500/30 bg-[#0d0d18] p-5 sm:p-6 text-white shadow-2xl space-y-4 max-h-[88vh] overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-300">
                    <Send className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      Tailored Pitch for {viewingPitchProspect.businessName}
                    </h4>
                    <p className="text-[11px] text-[var(--a-text-subtle)]">
                      Recipient: {viewingPitchProspect.ownerName} ({viewingPitchProspect.email})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setViewingPitchProspect(null)}
                  className="text-[var(--a-text-subtle)] hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Pitch Switcher: Email vs LinkedIn DM */}
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <button
                  type="button"
                  onClick={() => setPitchTab("email")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    pitchTab === "email"
                      ? "bg-white/15 text-white border border-white/20"
                      : "text-[var(--a-text-subtle)] hover:text-white"
                  }`}
                >
                  📧 Personalized Email Proposal
                </button>
                <button
                  type="button"
                  onClick={() => setPitchTab("dm")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    pitchTab === "dm"
                      ? "bg-white/15 text-white border border-white/20"
                      : "text-[var(--a-text-subtle)] hover:text-white"
                  }`}
                >
                  💬 Quick LinkedIn / DM Hook
                </button>
              </div>

              {pitchTab === "email" ? (
                <div className="space-y-3">
                  {/* Subject Line */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-[var(--a-text-subtle)] mb-1">
                      <span>Subject Line:</span>
                      <button
                        onClick={() => handleCopySubject(viewingPitchProspect.pitchEmailSubject)}
                        className="text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        {copiedSubject ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        <span>{copiedSubject ? "Copied" : "Copy Subject"}</span>
                      </button>
                    </div>
                    <div className="p-2.5 rounded-xl border border-white/10 bg-black/40 text-xs font-medium text-white">
                      {viewingPitchProspect.pitchEmailSubject}
                    </div>
                  </div>

                  {/* Email Body */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-[var(--a-text-subtle)] mb-1">
                      <span>Email Pitch Body:</span>
                      <button
                        onClick={() => handleCopyPitch(viewingPitchProspect.pitchEmailBody)}
                        className="text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        {copiedPitch ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        <span>{copiedPitch ? "Copied" : "Copy Pitch"}</span>
                      </button>
                    </div>
                    <pre className="p-3.5 rounded-xl border border-white/10 bg-black/50 text-xs leading-relaxed text-zinc-200 whitespace-pre-wrap font-sans">
                      {viewingPitchProspect.pitchEmailBody}
                    </pre>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between text-[11px] text-[var(--a-text-subtle)] mb-1">
                    <span>Short DM (LinkedIn / Instagram):</span>
                    <button
                      onClick={() => handleCopyPitch(viewingPitchProspect.pitchDmMessage)}
                      className="text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      {copiedPitch ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedPitch ? "Copied" : "Copy DM"}</span>
                    </button>
                  </div>
                  <pre className="p-3.5 rounded-xl border border-white/10 bg-black/50 text-xs leading-relaxed text-zinc-200 whitespace-pre-wrap font-sans">
                    {viewingPitchProspect.pitchDmMessage}
                  </pre>
                </div>
              )}

              {/* Actions at bottom of Pitch Modal */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <a
                  href={`mailto:${viewingPitchProspect.email}?subject=${encodeURIComponent(
                    viewingPitchProspect.pitchEmailSubject
                  )}&body=${encodeURIComponent(viewingPitchProspect.pitchEmailBody)}`}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500 text-black hover:bg-cyan-400 transition-colors"
                >
                  <Send className="h-3 w-3" />
                  <span>Launch in Mail Client</span>
                </a>
                <button
                  type="button"
                  onClick={() => setViewingPitchProspect(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
