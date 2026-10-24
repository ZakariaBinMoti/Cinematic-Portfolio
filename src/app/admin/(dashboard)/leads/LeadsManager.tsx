"use client";

import { useState, useMemo, useTransition } from "react";
import {
  UserCheck,
  Mail,
  ExternalLink,
  Copy,
  Check,
  Trash2,
  Download,
  RotateCw,
  Search,
  Filter,
  Bot,
  Globe,
  DollarSign,
  Calendar,
  MessageSquare,
  Sparkles,
  ChevronDown,
  Layers,
  ArrowUpRight,
  Send,
  FileEdit,
  Clock,
  Briefcase,
  AlertCircle,
  Inbox,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { Card, Badge, Button, PageHeader, Input } from "../../_ui";
import { SerializedLead, updateLeadStatus, updateLeadNotes, deleteLead, getLeads } from "./actions";

interface LeadsManagerProps {
  initialLeads: SerializedLead[];
}

type StatusFilter = "all" | "new" | "contacted" | "qualified" | "closed" | "archived";
type ChannelFilter = "all" | "website" | "linkedin" | "google_maps";

function formatRelativeTime(dateString: string) {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffSecs = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSecs < 60) return "Just now";
    if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
    if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)}h ago`;
    if (diffSecs < 604800) return `${Math.floor(diffSecs / 86400)}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "Recently";
  }
}

function formatFullDateTime(dateString: string) {
  try {
    return new Date(dateString).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return dateString;
  }
}

const STATUS_CONFIG: Record<
  SerializedLead["status"],
  { label: string; tone: "green" | "cyan" | "amber" | "violet" | "neutral"; bg: string; border: string; text: string }
> = {
  new: {
    label: "New Inquiry",
    tone: "green",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    text: "text-emerald-300",
  },
  contacted: {
    label: "Contacted",
    tone: "cyan",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/30",
    text: "text-cyan-300",
  },
  qualified: {
    label: "Qualified",
    tone: "amber",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    text: "text-amber-300",
  },
  closed: {
    label: "Closed / Won",
    tone: "violet",
    bg: "bg-violet-500/10",
    border: "border-violet-500/30",
    text: "text-violet-300",
  },
  archived: {
    label: "Archived",
    tone: "neutral",
    bg: "bg-white/5",
    border: "border-white/10",
    text: "text-[var(--a-text-subtle)]",
  },
};

export default function LeadsManager({ initialLeads }: LeadsManagerProps) {
  const [leads, setLeads] = useState<SerializedLead[]>(initialLeads);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>("all");
  const [copiedEmailId, setCopiedEmailId] = useState<string | null>(null);
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sync temp notes when editing starts
  const handleStartEditNotes = (lead: SerializedLead) => {
    setEditingNotesId(lead._id);
    setTempNotes((prev) => ({ ...prev, [lead._id]: lead.notes || "" }));
  };

  const handleSaveNotes = async (leadId: string) => {
    const notesValue = tempNotes[leadId] ?? "";
    try {
      await updateLeadNotes(leadId, notesValue);
      setLeads((prev) =>
        prev.map((l) => (l._id === leadId ? { ...l, notes: notesValue } : l))
      );
      setEditingNotesId(null);
      toast.success("Admin note saved");
    } catch {
      toast.error("Failed to save note");
    }
  };

  // Status update
  const handleStatusChange = async (leadId: string, newStatus: SerializedLead["status"]) => {
    // Optimistic update
    setLeads((prev) =>
      prev.map((l) => (l._id === leadId ? { ...l, status: newStatus } : l))
    );

    try {
      await updateLeadStatus(leadId, newStatus);
      toast.success(`Status updated to "${STATUS_CONFIG[newStatus].label}"`);
    } catch {
      toast.error("Failed to update status");
      // Revert if error
      handleRefresh();
    }
  };

  // Delete lead
  const handleDelete = async (lead: SerializedLead) => {
    if (!confirm(`Are you sure you want to delete the lead from ${lead.email}?`)) {
      return;
    }

    const previous = [...leads];
    setLeads((prev) => prev.filter((l) => l._id !== lead._id));

    try {
      await deleteLead(lead._id);
      toast.success("Lead removed successfully");
    } catch {
      toast.error("Failed to delete lead");
      setLeads(previous);
    }
  };

  // Copy email
  const handleCopyEmail = (email: string, id: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmailId(id);
    toast.success("Email copied to clipboard");
    setTimeout(() => setCopiedEmailId(null), 2000);
  };

  // Refresh from DB
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const refreshed = await getLeads();
      setLeads(refreshed);
      toast.success("Leads refreshed");
    } catch {
      toast.error("Failed to refresh leads");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (leads.length === 0) {
      toast.error("No leads available to export");
      return;
    }

    const headers = ["Name", "Email", "Store URL", "Budget", "Message", "Source", "Channel", "Status", "Notes", "Date"];
    const rows = filteredLeads.map((l) => [
      `"${(l.name || "").replace(/"/g, '""')}"`,
      `"${l.email.replace(/"/g, '""')}"`,
      `"${(l.storeUrl || "").replace(/"/g, '""')}"`,
      `"${(l.projectBudget || "").replace(/"/g, '""')}"`,
      `"${(l.message || "").replace(/"/g, '""')}"`,
      `"${l.source}"`,
      `"${l.channel}"`,
      `"${l.status}"`,
      `"${(l.notes || "").replace(/"/g, '""')}"`,
      `"${formatFullDateTime(l.createdAt)}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `zakaria-leads-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${filteredLeads.length} leads to CSV`);
  };

  // Filtered leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Status filter
      if (statusFilter !== "all" && lead.status !== statusFilter) {
        return false;
      }
      // Channel filter
      if (channelFilter !== "all" && lead.channel !== channelFilter) {
        return false;
      }
      // Search filter
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesName = lead.name?.toLowerCase().includes(query);
        const matchesEmail = lead.email?.toLowerCase().includes(query);
        const matchesStore = lead.storeUrl?.toLowerCase().includes(query);
        const matchesBudget = lead.projectBudget?.toLowerCase().includes(query);
        const matchesMessage = lead.message?.toLowerCase().includes(query);
        const matchesNotes = lead.notes?.toLowerCase().includes(query);
        if (!matchesName && !matchesEmail && !matchesStore && !matchesBudget && !matchesMessage && !matchesNotes) {
          return false;
        }
      }
      return true;
    });
  }, [leads, statusFilter, channelFilter, search]);

  // Counts
  const counts = useMemo(() => {
    return {
      all: leads.length,
      new: leads.filter((l) => l.status === "new").length,
      contacted: leads.filter((l) => l.status === "contacted").length,
      qualified: leads.filter((l) => l.status === "qualified").length,
      closed: leads.filter((l) => l.status === "closed").length,
      archived: leads.filter((l) => l.status === "archived").length,
    };
  }, [leads]);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <PageHeader
        eyebrow="Client Acquisition Pipeline"
        title="Leads & Inquiries"
        description="Review and follow up on client inquiries captured automatically by Zaki (your website AI companion) and direct contact submissions."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleRefresh}
              loading={isRefreshing}
              className="gap-2 text-xs"
            >
              <RotateCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleExportCSV}
              className="gap-2 text-xs"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </Button>
          </div>
        }
      />

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {/* Total Leads */}
        <Card className="relative overflow-hidden p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-[var(--a-text-subtle)]">
              Total Inbound
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-[var(--a-text-muted)]">
              <Inbox className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-[var(--a-text)]">
              {counts.all}
            </span>
            <span className="text-xs text-[var(--a-text-subtle)]">leads recorded</span>
          </div>
        </Card>

        {/* New Leads */}
        <Card className="relative overflow-hidden border-emerald-500/20 bg-emerald-500/[0.03] p-5 shadow-[0_0_30px_-10px_rgba(16,185,129,0.15)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-emerald-400">
              New Inquiries
            </span>
            <span className="relative flex h-3 w-3">
              {counts.new > 0 && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              )}
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-emerald-300">
              {counts.new}
            </span>
            <span className="text-xs text-emerald-400/80">awaiting response</span>
          </div>
        </Card>

        {/* Contacted */}
        <Card className="relative overflow-hidden p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-[var(--a-text-subtle)]">
              Contacted
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-300">
              <MessageSquare className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-[var(--a-text)]">
              {counts.contacted}
            </span>
            <span className="text-xs text-[var(--a-text-subtle)]">in discussion</span>
          </div>
        </Card>

        {/* Qualified */}
        <Card className="relative overflow-hidden p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-[var(--a-text-subtle)]">
              Qualified
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-300">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-[var(--a-text)]">
              {counts.qualified}
            </span>
            <span className="text-xs text-[var(--a-text-subtle)]">ready to close</span>
          </div>
        </Card>
      </div>

      {/* Multi-channel ready badge & note */}
      <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-xs text-[var(--a-text-muted)] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-500/20 text-violet-300">
            <Bot className="h-3.5 w-3.5" />
          </span>
          <span>
            <strong className="text-[var(--a-text)]">Active Capture Engine:</strong> Website AI Companion (Zaki) is live and auto-qualifying visitors into this CRM.
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-[var(--a-text-subtle)]">
          <span className="rounded bg-white/5 px-2 py-0.5 border border-white/5">Website (Active)</span>
          <span className="rounded bg-white/5 px-2 py-0.5 border border-white/5 opacity-50">LinkedIn (Upcoming)</span>
          <span className="rounded bg-white/5 px-2 py-0.5 border border-white/5 opacity-50">Google Maps (Upcoming)</span>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="space-y-4">
        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              { key: "all", label: "All Leads", count: counts.all },
              { key: "new", label: "New", count: counts.new },
              { key: "contacted", label: "Contacted", count: counts.contacted },
              { key: "qualified", label: "Qualified", count: counts.qualified },
              { key: "closed", label: "Closed", count: counts.closed },
              { key: "archived", label: "Archived", count: counts.archived },
            ] as const
          ).map((tab) => {
            const active = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium transition-all ${
                  active
                    ? "bg-white/15 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] border border-white/20"
                    : "bg-white/[0.03] text-[var(--a-text-muted)] hover:bg-white/[0.06] hover:text-[var(--a-text)] border border-white/5"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-semibold ${
                    active ? "bg-white/20 text-white" : "bg-white/5 text-[var(--a-text-subtle)]"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--a-text-subtle)]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, store domain, budget, or message keyword…"
            className="pl-10"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--a-text-subtle)] hover:text-white"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Leads List */}
      {filteredLeads.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-[var(--a-text-subtle)]">
            <Inbox className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-[var(--a-text)]">
            {search || statusFilter !== "all" ? "No matching leads found" : "No leads captured yet"}
          </h3>
          <p className="mt-1.5 max-w-md text-xs text-[var(--a-text-subtle)]">
            {search || statusFilter !== "all"
              ? "Try adjusting your search query or switching the status filter tab above."
              : "When visitors interact with your website AI companion (Zaki) and provide their email or project details, they will automatically appear here."}
          </p>
          {(search || statusFilter !== "all") && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
              }}
              className="mt-4 text-xs"
            >
              Reset filters
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredLeads.map((lead) => {
            const statusMeta = STATUS_CONFIG[lead.status] || STATUS_CONFIG.new;
            const isEditingNotes = editingNotesId === lead._id;
            const leadInitial = (lead.name?.trim().charAt(0) || lead.email.charAt(0) || "?").toUpperCase();

            return (
              <Card
                key={lead._id}
                className="group relative overflow-hidden p-5 transition-all hover:border-white/20 hover:bg-white/[0.04]"
              >
                {/* Status indicator strip on left */}
                <div
                  className={`absolute bottom-0 left-0 top-0 w-1 ${
                    lead.status === "new"
                      ? "bg-emerald-500"
                      : lead.status === "contacted"
                      ? "bg-cyan-500"
                      : lead.status === "qualified"
                      ? "bg-amber-500"
                      : lead.status === "closed"
                      ? "bg-violet-500"
                      : "bg-white/10"
                  }`}
                />

                <div className="space-y-4 pl-2">
                  {/* Row 1: Header - Avatar, Name, Email, Status, Time, Actions */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3.5">
                      {/* Avatar */}
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-violet-500/20 to-blue-500/20 text-base font-bold text-white shadow-sm">
                        {leadInitial}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-base font-semibold text-[var(--a-text)]">
                            {lead.name ? lead.name : "Prospective Client"}
                          </h4>
                          {/* Origin Tag */}
                          <span className="inline-flex items-center gap-1 rounded-full border border-violet-400/25 bg-violet-500/10 px-2 py-0.5 text-[10.5px] font-medium text-violet-300">
                            <Bot className="h-3 w-3" />
                            Website AI (Zaki)
                          </span>
                        </div>

                        {/* Email row with quick copy and mailto */}
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-mono text-zinc-300">{lead.email}</span>
                          <button
                            onClick={() => handleCopyEmail(lead.email, lead._id)}
                            title="Copy email address"
                            className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-[var(--a-text-subtle)] hover:bg-white/10 hover:text-white"
                          >
                            {copiedEmailId === lead._id ? (
                              <>
                                <Check className="h-3 w-3 text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                          <a
                            href={`mailto:${lead.email}?subject=Regarding%20your%20Shopify%20inquiry%20with%20Zakaria`}
                            className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-cyan-400 hover:bg-cyan-500/10 hover:underline"
                          >
                            <Send className="h-3 w-3" />
                            <span>Send Email</span>
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Status dropdown & Meta */}
                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      {/* Status Selector Dropdown */}
                      <div className="relative">
                        <select
                          value={lead.status}
                          onChange={(e) =>
                            handleStatusChange(lead._id, e.target.value as SerializedLead["status"])
                          }
                          aria-label="Lead status"
                          className={`cursor-pointer appearance-none rounded-lg border px-3 py-1.5 pr-7 text-xs font-medium outline-none transition-colors ${statusMeta.bg} ${statusMeta.border} ${statusMeta.text}`}
                        >
                          <option value="new" className="bg-[#12121a] text-emerald-300">
                            🟢 New Inquiry
                          </option>
                          <option value="contacted" className="bg-[#12121a] text-cyan-300">
                            🔵 Contacted
                          </option>
                          <option value="qualified" className="bg-[#12121a] text-amber-300">
                            🟡 Qualified
                          </option>
                          <option value="closed" className="bg-[#12121a] text-violet-300">
                            🟣 Closed / Won
                          </option>
                          <option value="archived" className="bg-[#12121a] text-zinc-400">
                            ⚪ Archived
                          </option>
                        </select>
                        <ChevronDown className={`pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 opacity-70 ${statusMeta.text}`} />
                      </div>

                      {/* Time */}
                      <div
                        title={formatFullDateTime(lead.createdAt)}
                        className="flex items-center gap-1 text-[11px] text-[var(--a-text-subtle)]"
                      >
                        <Clock className="h-3 w-3" />
                        <span>{formatRelativeTime(lead.createdAt)}</span>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(lead)}
                        title="Delete lead record"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--a-text-subtle)] hover:bg-red-500/10 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Row 2: Metadata Pills (Store URL, Budget) */}
                  <div className="flex flex-wrap items-center gap-2.5 text-xs">
                    {lead.storeUrl ? (
                      <a
                        href={lead.storeUrl.startsWith("http") ? lead.storeUrl : `https://${lead.storeUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-zinc-300 hover:border-cyan-400/40 hover:text-cyan-300 transition-colors"
                      >
                        <Globe className="h-3.5 w-3.5 text-cyan-400" />
                        <span>{lead.storeUrl}</span>
                        <ExternalLink className="h-3 w-3 opacity-60" />
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/[0.02] px-2.5 py-1 text-zinc-500">
                        <Globe className="h-3.5 w-3.5" />
                        <span>No store provided</span>
                      </span>
                    )}

                    {lead.projectBudget && (
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 font-medium text-emerald-300">
                        <DollarSign className="h-3.5 w-3.5" />
                        <span>Budget: {lead.projectBudget}</span>
                      </span>
                    )}

                    <span className="inline-flex items-center gap-1 rounded-lg border border-white/5 bg-white/[0.02] px-2.5 py-1 text-[11px] text-[var(--a-text-subtle)]">
                      <Calendar className="h-3 w-3" />
                      <span>{formatFullDateTime(lead.createdAt)}</span>
                    </span>
                  </div>

                  {/* Row 3: Message / Inquiry Body */}
                  {lead.message && (
                    <div className="rounded-xl border border-white/5 bg-black/30 p-3.5">
                      <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--a-text-subtle)]">
                        <MessageSquare className="h-3 w-3" />
                        <span>Inquiry Message / Request</span>
                      </div>
                      <p className="whitespace-pre-wrap text-xs leading-relaxed text-zinc-200">
                        {lead.message}
                      </p>
                    </div>
                  )}

                  {/* Row 4: Private Admin Notes */}
                  <div className="border-t border-white/5 pt-3">
                    {isEditingNotes ? (
                      <div className="space-y-2">
                        <label className="text-[11px] font-medium text-[var(--a-text-subtle)] flex items-center gap-1">
                          <FileEdit className="h-3 w-3" />
                          <span>Internal Admin Notes (Private to Zakaria):</span>
                        </label>
                        <textarea
                          rows={2}
                          value={tempNotes[lead._id] ?? ""}
                          onChange={(e) =>
                            setTempNotes((prev) => ({ ...prev, [lead._id]: e.target.value }))
                          }
                          placeholder="e.g., Sent Liquid proposal via email, asked about timeline, meeting booked for Thursday..."
                          className="w-full rounded-xl border border-white/15 bg-white/[0.04] p-2.5 text-xs text-[var(--a-text)] outline-none focus:border-violet-400"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingNotesId(null)}
                            className="h-7 text-xs"
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleSaveNotes(lead._id)}
                            className="h-7 text-xs"
                          >
                            Save Note
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-[var(--a-text-subtle)]">
                          {lead.notes ? (
                            <div className="flex items-start gap-1.5 text-amber-200/90">
                              <span className="font-semibold text-amber-400">Note:</span>
                              <span>{lead.notes}</span>
                            </div>
                          ) : (
                            <span className="italic text-[var(--a-text-subtle)]">No internal notes yet.</span>
                          )}
                        </div>
                        <button
                          onClick={() => handleStartEditNotes(lead)}
                          className="flex items-center gap-1 rounded px-2 py-1 text-xs text-[var(--a-text-subtle)] hover:bg-white/5 hover:text-white transition-colors"
                        >
                          <FileEdit className="h-3 w-3" />
                          <span>{lead.notes ? "Edit note" : "Add note"}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
