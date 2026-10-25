"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
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
  Plus,
  Edit3,
  Building2,
  Phone,
  MapPin,
  Tag as TagIcon,
  Zap,
  TrendingUp,
  Flame,
  LayoutList,
  FolderKanban,
  Table,
  Trophy,
  XCircle,
  BarChart3,
  Target,
  Award,
  ArrowRight,
  X,
} from "lucide-react";
import { toast } from "sonner";

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}
import { Card, Badge, Button, PageHeader, Input } from "../../_ui";
import {
  SerializedLead,
  updateLeadStatus,
  updateLeadNotes,
  deleteLead,
  getLeads,
  bulkDeleteLeads,
  bulkUpdateLeadStatus,
  bulkUpdateLeadPriority,
} from "./actions";
import LeadDrawer from "./LeadDrawer";
import KanbanBoard from "./KanbanBoard";
import EmailModal from "./EmailModal";
import AiLeadRadarModal from "./AiLeadRadarModal";

interface LeadsManagerProps {
  initialLeads: SerializedLead[];
}

type StatusFilter = "all" | "new" | "contacted" | "qualified" | "won" | "lost" | "closed" | "archived";
type ChannelFilter = "all" | "website" | "linkedin" | "google_maps" | "referral" | "cold_outreach" | "direct" | "other";
type PriorityFilter = "all" | "urgent" | "high" | "medium" | "low";

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
  { label: string; tone: "green" | "cyan" | "amber" | "violet" | "rose" | "neutral"; bg: string; border: string; text: string }
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
  won: {
    label: "Closed Won 🏆",
    tone: "green",
    bg: "bg-emerald-500/15",
    border: "border-emerald-500/40",
    text: "text-emerald-300",
  },
  lost: {
    label: "Closed Lost ❌",
    tone: "rose",
    bg: "bg-rose-500/15",
    border: "border-rose-500/40",
    text: "text-rose-300",
  },
  closed: {
    label: "Closed Won 🏆",
    tone: "green",
    bg: "bg-emerald-500/15",
    border: "border-emerald-500/40",
    text: "text-emerald-300",
  },
  archived: {
    label: "Archived",
    tone: "neutral",
    bg: "bg-white/5",
    border: "border-white/10",
    text: "text-[var(--a-text-subtle)]",
  },
};

const PRIORITY_CONFIG: Record<
  SerializedLead["priority"],
  { label: string; badge: string; dot: string }
> = {
  urgent: {
    label: "Urgent",
    badge: "border-red-500/30 bg-red-500/10 text-red-300",
    dot: "bg-red-400",
  },
  high: {
    label: "High",
    badge: "border-orange-500/30 bg-orange-500/10 text-orange-300",
    dot: "bg-orange-400",
  },
  medium: {
    label: "Medium",
    badge: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    dot: "bg-amber-400",
  },
  low: {
    label: "Low",
    badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    dot: "bg-emerald-400",
  },
};

const CHANNEL_CONFIG: Record<string, { label: string; icon: string; tone: string }> = {
  website: { label: "Website AI (Zaki)", icon: "🤖", tone: "border-violet-400/25 bg-violet-500/10 text-violet-300" },
  linkedin: { label: "LinkedIn Outreach", icon: "🔗", tone: "border-blue-400/25 bg-blue-500/10 text-blue-300" },
  google_maps: { label: "Google Maps", icon: "🗺️", tone: "border-emerald-400/25 bg-emerald-500/10 text-emerald-300" },
  referral: { label: "Referral", icon: "🤝", tone: "border-amber-400/25 bg-amber-500/10 text-amber-300" },
  cold_outreach: { label: "Cold Outreach", icon: "📧", tone: "border-cyan-400/25 bg-cyan-500/10 text-cyan-300" },
  direct: { label: "Direct Inbound", icon: "📥", tone: "border-indigo-400/25 bg-indigo-500/10 text-indigo-300" },
  other: { label: "Other Channel", icon: "🌐", tone: "border-white/10 bg-white/5 text-gray-300" },
};

const PROJECT_TYPE_LABELS: Record<string, string> = {
  new_shopify_store: "New Shopify Store",
  shopify_redesign: "Shopify Redesign & CRO",
  shopify_migration: "Shopify Migration",
  custom_website: "Custom Next.js App",
  landing_page: "High-Converting Landing Page",
  maintenance: "Retainer & Maintenance",
  consultation: "Technical Consultation",
  other: "Other Project",
};

export default function LeadsManager({ initialLeads }: LeadsManagerProps) {
  const [leads, setLeads] = useState<SerializedLead[]>(initialLeads);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>("all");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");

  // Multi-selection state for bulk edit
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<SerializedLead | null>(null);

  // Drawer & modal state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [radarOpen, setRadarOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<SerializedLead | null>(null);
  const [emailingLead, setEmailingLead] = useState<SerializedLead | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "kanban" | "cards">("table");
  const [showAnalytics, setShowAnalytics] = useState(false);

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
    setLeads((prev) =>
      prev.map((l) => (l._id === leadId ? { ...l, status: newStatus } : l))
    );

    try {
      await updateLeadStatus(leadId, newStatus);
      toast.success(`Status updated to "${STATUS_CONFIG[newStatus].label}"`);
    } catch {
      toast.error("Failed to update status");
      handleRefresh();
    }
  };

  // Open Drawer for Create
  const handleOpenCreateDrawer = () => {
    setSelectedLead(null);
    setDrawerOpen(true);
  };

  // Open Drawer for Edit
  const handleOpenEditDrawer = (lead: SerializedLead) => {
    setSelectedLead(lead);
    setDrawerOpen(true);
  };

  // Handle saved from Drawer
  const handleLeadSaved = (savedLead: SerializedLead, isNew: boolean) => {
    if (isNew) {
      setLeads((prev) => [savedLead, ...prev]);
    } else {
      setLeads((prev) =>
        prev.map((l) => (l._id === savedLead._id ? savedLead : l))
      );
    }
  };

  // Delete lead (open in-app confirmation modal)
  const handleDelete = (lead: SerializedLead) => {
    setLeadToDelete(lead);
  };

  // Confirm single lead delete
  const handleConfirmSingleDelete = async () => {
    if (!leadToDelete) return;
    const target = leadToDelete;
    setLeadToDelete(null);

    const previous = [...leads];
    setLeads((prev) => prev.filter((l) => l._id !== target._id));
    setSelectedIds((prev) => prev.filter((id) => id !== target._id));

    try {
      await deleteLead(target._id);
      toast.success(`Lead "${target.name || target.company || target.email}" removed successfully`);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete lead");
      setLeads(previous);
    }
  };

  // Multi-selection handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Bulk update status
  const handleBulkStatusChange = async (newStatus: SerializedLead["status"]) => {
    if (selectedIds.length === 0) return;
    setBulkLoading(true);
    const prevLeads = [...leads];

    setLeads((prev) =>
      prev.map((l) => (selectedIds.includes(l._id) ? { ...l, status: newStatus } : l))
    );

    try {
      await bulkUpdateLeadStatus(selectedIds, newStatus);
      toast.success(`Updated ${selectedIds.length} leads to "${STATUS_CONFIG[newStatus].label}"`);
    } catch (err: any) {
      toast.error(err.message || "Failed to bulk update status");
      setLeads(prevLeads);
    } finally {
      setBulkLoading(false);
    }
  };

  // Bulk update priority
  const handleBulkPriorityChange = async (newPriority: SerializedLead["priority"]) => {
    if (selectedIds.length === 0) return;
    setBulkLoading(true);
    const prevLeads = [...leads];

    setLeads((prev) =>
      prev.map((l) => (selectedIds.includes(l._id) ? { ...l, priority: newPriority } : l))
    );

    try {
      await bulkUpdateLeadPriority(selectedIds, newPriority);
      toast.success(`Updated priority for ${selectedIds.length} leads`);
    } catch (err: any) {
      toast.error(err.message || "Failed to bulk update priority");
      setLeads(prevLeads);
    } finally {
      setBulkLoading(false);
    }
  };

  // Bulk delete
  const handleConfirmBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setBulkLoading(true);
    setShowBulkDeleteConfirm(false);
    const prevLeads = [...leads];
    const countToDelete = selectedIds.length;
    const idsToDelete = [...selectedIds];

    setLeads((prev) => prev.filter((l) => !idsToDelete.includes(l._id)));
    setSelectedIds([]);

    try {
      await bulkDeleteLeads(idsToDelete);
      toast.success(`Successfully removed ${countToDelete} leads`);
    } catch (err: any) {
      toast.error(err.message || "Failed to bulk delete leads");
      setLeads(prevLeads);
    } finally {
      setBulkLoading(false);
    }
  };

  // Bulk export selected CSV
  const handleBulkExportSelected = () => {
    const selectedLeads = leads.filter((l) => selectedIds.includes(l._id));
    if (selectedLeads.length === 0) {
      toast.error("No leads selected to export");
      return;
    }

    const headers = [
      "Name",
      "Company",
      "Email",
      "Phone",
      "Location",
      "Industry",
      "Store URL",
      "Website",
      "LinkedIn",
      "Current Platform",
      "Project Type",
      "Budget",
      "Estimated Value ($)",
      "Channel",
      "Status",
      "Priority",
      "Lead Score",
      "Tags",
      "Message",
      "Notes",
      "Date Added",
    ];

    const rows = selectedLeads.map((l) => [
      `"${(l.name || "").replace(/"/g, '""')}"`,
      `"${(l.company || "").replace(/"/g, '""')}"`,
      `"${(l.email || "").replace(/"/g, '""')}"`,
      `"${(l.phone || "").replace(/"/g, '""')}"`,
      `"${(l.location || "").replace(/"/g, '""')}"`,
      `"${(l.industry || "").replace(/"/g, '""')}"`,
      `"${(l.storeUrl || "").replace(/"/g, '""')}"`,
      `"${(l.website || "").replace(/"/g, '""')}"`,
      `"${(l.linkedinUrl || "").replace(/"/g, '""')}"`,
      `"${(l.currentPlatform || "").replace(/"/g, '""')}"`,
      `"${(l.projectType || "").replace(/"/g, '""')}"`,
      `"${(l.projectBudget || "").replace(/"/g, '""')}"`,
      l.estimatedValue || 0,
      `"${l.channel || l.source || "website"}"`,
      `"${l.status}"`,
      `"${l.priority || "medium"}"`,
      l.leadScore ?? 20,
      `"${(l.tags || []).join("; ").replace(/"/g, '""')}"`,
      `"${(l.message || "").replace(/"/g, '""')}"`,
      `"${(l.notes || "").replace(/"/g, '""')}"`,
      `"${formatFullDateTime(l.createdAt)}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `zakaria-crm-selected-${selectedLeads.length}-leads-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${selectedLeads.length} selected leads to CSV`);
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

    const headers = [
      "Name",
      "Company",
      "Email",
      "Phone",
      "Location",
      "Industry",
      "Store URL",
      "Website",
      "LinkedIn",
      "Current Platform",
      "Project Type",
      "Budget",
      "Estimated Value ($)",
      "Channel",
      "Status",
      "Priority",
      "Lead Score",
      "Tags",
      "Message",
      "Notes",
      "Date Added",
    ];

    const rows = filteredLeads.map((l) => [
      `"${(l.name || "").replace(/"/g, '""')}"`,
      `"${(l.company || "").replace(/"/g, '""')}"`,
      `"${l.email.replace(/"/g, '""')}"`,
      `"${(l.phone || "").replace(/"/g, '""')}"`,
      `"${(l.location || "").replace(/"/g, '""')}"`,
      `"${(l.industry || "").replace(/"/g, '""')}"`,
      `"${(l.storeUrl || "").replace(/"/g, '""')}"`,
      `"${(l.website || "").replace(/"/g, '""')}"`,
      `"${(l.linkedinUrl || "").replace(/"/g, '""')}"`,
      `"${(l.currentPlatform || "").replace(/"/g, '""')}"`,
      `"${(l.projectType || "").replace(/"/g, '""')}"`,
      `"${(l.projectBudget || "").replace(/"/g, '""')}"`,
      `"${l.estimatedValue ?? ""}"`,
      `"${l.channel || l.source}"`,
      `"${l.status}"`,
      `"${l.priority || "medium"}"`,
      `"${l.leadScore ?? 0}"`,
      `"${(l.tags || []).join(", ").replace(/"/g, '""')}"`,
      `"${(l.message || "").replace(/"/g, '""')}"`,
      `"${(l.notes || "").replace(/"/g, '""')}"`,
      `"${formatFullDateTime(l.createdAt)}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `zakaria-crm-leads-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${filteredLeads.length} leads to CSV`);
  };

  // Filtered leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Status filter
      if (statusFilter !== "all") {
        if (statusFilter === "won" || statusFilter === "closed") {
          if (lead.status !== "won" && lead.status !== "closed") return false;
        } else if (lead.status !== statusFilter) {
          return false;
        }
      }
      // Channel filter
      if (channelFilter !== "all" && (lead.channel || "website") !== channelFilter) {
        return false;
      }
      // Priority filter
      if (priorityFilter !== "all" && (lead.priority || "medium") !== priorityFilter) {
        return false;
      }
      // Search filter
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesName = lead.name?.toLowerCase().includes(query);
        const matchesCompany = lead.company?.toLowerCase().includes(query);
        const matchesEmail = lead.email?.toLowerCase().includes(query);
        const matchesPhone = lead.phone?.toLowerCase().includes(query);
        const matchesLocation = lead.location?.toLowerCase().includes(query);
        const matchesStore = lead.storeUrl?.toLowerCase().includes(query);
        const matchesBudget = lead.projectBudget?.toLowerCase().includes(query);
        const matchesMessage = lead.message?.toLowerCase().includes(query);
        const matchesNotes = lead.notes?.toLowerCase().includes(query);
        const matchesTags = lead.tags?.some((t) => t.toLowerCase().includes(query));

        return (
          matchesName ||
          matchesCompany ||
          matchesEmail ||
          matchesPhone ||
          matchesLocation ||
          matchesStore ||
          matchesBudget ||
          matchesMessage ||
          matchesNotes ||
          matchesTags
        );
      }
      return true;
    });
  }, [leads, statusFilter, channelFilter, priorityFilter, search]);

  // Master selection status
  const isAllSelected = useMemo(() => {
    if (filteredLeads.length === 0) return false;
    return filteredLeads.every((l) => selectedIds.includes(l._id));
  }, [filteredLeads, selectedIds]);

  const handleSelectAll = () => {
    const visibleIds = filteredLeads.map((l) => l._id);
    if (isAllSelected) {
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  // Aggregate KPI & Funnel metrics
  const counts = useMemo(() => {
    const totalLeads = leads.length;
    const wonLeads = leads.filter((l) => l.status === "won" || l.status === "closed");
    const lostLeads = leads.filter((l) => l.status === "lost");
    const totalClosed = wonLeads.length + lostLeads.length;

    const wonRevenue = wonLeads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0);
    const lostRevenue = lostLeads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0);

    const activePipelineLeads = leads.filter((l) => l.status === "new" || l.status === "contacted" || l.status === "qualified");
    const activePipelineValue = activePipelineLeads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0);
    const totalPipelineValue = leads.reduce((sum, lead) => sum + (lead.estimatedValue || 0), 0);

    const leadsWithVal = leads.filter((l) => typeof l.estimatedValue === "number" && l.estimatedValue > 0);
    const avgDeal = leadsWithVal.length > 0 ? Math.round(totalPipelineValue / leadsWithVal.length) : 0;

    // Conversion rates:
    // 1. Closed Won Rate (e.g., 2 of 5 closed negotiations won = 40%)
    const closedWonRate = totalClosed > 0 ? Math.round((wonLeads.length / totalClosed) * 100) : 0;
    // 2. Overall Inbound Win Rate ("2 of 100 approach": e.g. 2 of 100 inbound leads converted = 2%)
    const overallWinRate = totalLeads > 0 ? ((wonLeads.length / totalLeads) * 100).toFixed(1) : "0.0";
    // 3. Response rate (contacted / all)
    const contactedOrBeyond = leads.filter((l) => l.status !== "new").length;
    const responseRate = totalLeads > 0 ? Math.round((contactedOrBeyond / totalLeads) * 100) : 0;
    // 4. Qualification rate (qualified or closed / contacted)
    const qualifiedOrBeyond = leads.filter((l) => l.status === "qualified" || l.status === "won" || l.status === "closed").length;
    const qualRate = contactedOrBeyond > 0 ? Math.round((qualifiedOrBeyond / contactedOrBeyond) * 100) : 0;

    // Channel stats breakdown
    const channelStats: Record<string, { count: number; value: number; wonCount: number; wonValue: number }> = {};
    leads.forEach((l) => {
      const ch = l.channel || l.source || "website";
      if (!channelStats[ch]) {
        channelStats[ch] = { count: 0, value: 0, wonCount: 0, wonValue: 0 };
      }
      channelStats[ch].count += 1;
      channelStats[ch].value += l.estimatedValue || 0;
      if (l.status === "won" || l.status === "closed") {
        channelStats[ch].wonCount += 1;
        channelStats[ch].wonValue += l.estimatedValue || 0;
      }
    });

    return {
      all: totalLeads,
      new: leads.filter((l) => l.status === "new").length,
      contacted: leads.filter((l) => l.status === "contacted").length,
      qualified: leads.filter((l) => l.status === "qualified").length,
      won: wonLeads.length,
      lost: lostLeads.length,
      closed: wonLeads.length,
      totalClosed,
      wonRevenue,
      lostRevenue,
      activePipelineValue,
      archived: leads.filter((l) => l.status === "archived").length,
      pipelineValue: totalPipelineValue,
      avgDeal,
      closedWonRate,
      overallWinRate,
      winRate: closedWonRate,
      responseRate,
      qualRate,
      channelStats,
    };
  }, [leads]);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <PageHeader
        eyebrow="Client Acquisition & CRM Command Center"
        title="Leads & Deal Pipeline"
        description="Manage high-ticket Shopify and custom web development prospects from Website AI, LinkedIn outreach, and direct inquiries."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant={showAnalytics ? "primary" : "secondary"}
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="gap-2 text-xs"
            >
              <BarChart3 className="h-3.5 w-3.5" />
              {showAnalytics ? "Hide Analytics" : "Pipeline Funnel"}
            </Button>
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
            <Button
              size="sm"
              onClick={() => setRadarOpen(true)}
              className="gap-2 text-xs font-bold bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 text-white shadow-lg shadow-violet-500/25 hover:opacity-95 ring-1 ring-white/20"
            >
              <Sparkles className="h-3.5 w-3.5 text-cyan-300 animate-pulse" />
              AI Lead Radar (Phase 6)
            </Button>
            <Button
              size="sm"
              onClick={handleOpenCreateDrawer}
              className="gap-2 text-xs font-semibold shadow-lg shadow-violet-500/20"
            >
              <Plus className="h-4 w-4" />
              Add Lead
            </Button>
          </div>
        }
      />

      {/* KPI Stats Row (6 Cards) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {/* Total Leads */}
        <Card className="relative overflow-hidden p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--a-text-subtle)]">
              Total Inbound
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-[var(--a-text-muted)]">
              <Inbox className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-[var(--a-text)]">
              {counts.all}
            </span>
            <span className="text-[11px] text-[var(--a-text-subtle)]">prospects</span>
          </div>
        </Card>

        {/* New Leads */}
        <Card className="relative overflow-hidden border-emerald-500/20 bg-emerald-500/[0.03] p-4 shadow-[0_0_20px_-8px_rgba(16,185,129,0.2)]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-emerald-400">
              New Inquiries
            </span>
            <span className="relative flex h-2.5 w-2.5">
              {counts.new > 0 && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              )}
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-emerald-300">
              {counts.new}
            </span>
            <span className="text-[11px] text-emerald-400/80">awaiting response</span>
          </div>
        </Card>

        {/* Qualified Scope */}
        <Card className="relative overflow-hidden p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--a-text-subtle)]">
              Qualified Scope
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-300">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-[var(--a-text)]">
              {counts.qualified}
            </span>
            <span className="text-[11px] text-amber-400/80">ready to close</span>
          </div>
        </Card>

        {/* Closed Won */}
        <Card className="relative overflow-hidden border-emerald-500/30 bg-emerald-500/[0.06] p-4 shadow-[0_0_25px_-5px_rgba(16,185,129,0.25)]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1">
              <span>Closed Won</span>
              <span>🏆</span>
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300">
              <Trophy className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-bold tracking-tight text-emerald-300">
                {counts.won}
              </span>
              <span className="text-[11px] text-emerald-400/80 ml-1.5">won deals</span>
            </div>
            {counts.wonRevenue > 0 && (
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded">
                +${counts.wonRevenue.toLocaleString()}
              </span>
            )}
          </div>
        </Card>

        {/* Closed Lost */}
        <Card className="relative overflow-hidden border-rose-500/20 bg-rose-500/[0.04] p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1">
              <span>Closed Lost</span>
              <span>❌</span>
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/15 text-rose-300">
              <XCircle className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-bold tracking-tight text-rose-300">
                {counts.lost}
              </span>
              <span className="text-[11px] text-rose-400/80 ml-1.5">lost deals</span>
            </div>
            {counts.lostRevenue > 0 && (
              <span className="text-xs font-mono font-medium text-rose-400/90 bg-rose-500/15 px-1.5 py-0.5 rounded">
                -${counts.lostRevenue.toLocaleString()}
              </span>
            )}
          </div>
        </Card>

        {/* Win Conversion Rate (2 of 100 Approach) */}
        <Card className="relative overflow-hidden border-violet-500/30 bg-violet-500/[0.05] p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-violet-300">
              Win Rate %
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/20 text-violet-300">
              <Target className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-violet-300">
              {counts.closedWonRate}%
            </span>
            <span className="text-[11px] text-violet-400/80 font-mono">
              ({counts.won}/{counts.totalClosed || 0})
            </span>
          </div>
          <p className="mt-1 text-[10px] text-[var(--a-text-subtle)] truncate">
            {counts.overallWinRate}% of all {counts.all} inbound converted
          </p>
        </Card>
      </div>

      {/* Funnel Analytics Dashboard (Phase 5) */}
      {showAnalytics && (
        <Card className="p-6 border-violet-500/20 bg-gradient-to-br from-violet-500/[0.04] via-transparent to-transparent space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-violet-500/20 text-violet-300 flex items-center justify-center border border-violet-500/30">
                <Target className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[var(--a-text)]">
                  Client Acquisition Funnel & Win/Loss Performance
                </h3>
                <p className="text-xs text-[var(--a-text-subtle)]">
                  Tracking pipeline velocity, won revenue generation vs lost deals, and conversion efficiency
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-[var(--a-text-subtle)]">Win Rate:</span>
                <span className="font-bold text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {counts.closedWonRate}%
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[var(--a-text-subtle)]">Revenue Won:</span>
                <span className="font-bold text-emerald-300 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  ${counts.wonRevenue.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[var(--a-text-subtle)]">Lost Pipeline:</span>
                <span className="font-bold text-rose-300 font-mono bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                  ${counts.lostRevenue.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Visual Funnel Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {/* Step 1: Inbound */}
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-[var(--a-text-subtle)] mb-2">
                <span>1. Total Inbound</span>
                <span className="font-mono font-semibold text-white">100%</span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{counts.all}</div>
              <p className="text-[11px] text-[var(--a-text-subtle)]">Captured via AI & manual CRM</p>
              <div className="w-full bg-white/10 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-white h-full rounded-full w-full" />
              </div>
            </div>

            {/* Step 2: Contacted */}
            <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/[0.02] p-4 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-cyan-400/80 mb-2">
                <span>2. Outreached</span>
                <span className="font-mono font-semibold text-cyan-300">{counts.responseRate}%</span>
              </div>
              <div className="text-2xl font-bold text-cyan-300 mb-1">{counts.contacted}</div>
              <p className="text-[11px] text-[var(--a-text-subtle)]">Active conversations & audits</p>
              <div className="w-full bg-white/10 h-1.5 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-cyan-400 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, Math.max(8, counts.responseRate))}%` }}
                />
              </div>
            </div>

            {/* Step 3: Qualified */}
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.02] p-4 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-amber-400/80 mb-2">
                <span>3. Qualified Scope</span>
                <span className="font-mono font-semibold text-amber-300">{counts.qualRate}%</span>
              </div>
              <div className="text-2xl font-bold text-amber-300 mb-1">{counts.qualified}</div>
              <p className="text-[11px] text-[var(--a-text-subtle)]">Budget & scope aligned</p>
              <div className="w-full bg-white/10 h-1.5 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-amber-400 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, Math.max(8, counts.qualRate))}%` }}
                />
              </div>
            </div>

            {/* Step 4: Closed Won */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/[0.04] p-4 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-emerald-400/80 mb-2">
                <span>4. Closed Won 🏆</span>
                <span className="font-mono font-semibold text-emerald-300">{counts.closedWonRate}%</span>
              </div>
              <div className="text-2xl font-bold text-emerald-300 mb-1">{counts.won}</div>
              <p className="text-[11px] text-[var(--a-text-subtle)]">Signed contracts & paid retainers</p>
              <div className="w-full bg-white/10 h-1.5 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-emerald-400 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, Math.max(8, counts.closedWonRate))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Dedicated Win vs Lost Conversion Card ("2 of 100 Approach") */}
          <div className="rounded-xl border border-white/10 bg-black/30 p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-emerald-400" />
                <h4 className="text-xs font-semibold text-white">
                  Conversion Benchmark &quot;2 of 100 Approach&quot;
                </h4>
              </div>
              <div className="text-xs font-mono text-[var(--a-text-subtle)]">
                Acquisition Ratio: <strong className="text-emerald-400">{counts.won} of {counts.all}</strong> inquiries converted to paying clients ({counts.overallWinRate}%)
              </div>
            </div>

            {/* Split Visual Bar: Won vs Lost */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  🏆 Closed Won: {counts.won} deals · ${counts.wonRevenue.toLocaleString()}
                </span>
                <span className="text-rose-400 font-semibold flex items-center gap-1">
                  ❌ Closed Lost: {counts.lost} deals · ${counts.lostRevenue.toLocaleString()}
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-white/5 flex overflow-hidden border border-white/10">
                <div
                  className="bg-emerald-500 h-full transition-all"
                  style={{
                    width: `${counts.totalClosed > 0 ? (counts.won / counts.totalClosed) * 100 : 50}%`,
                  }}
                  title={`Won: ${counts.won}`}
                />
                <div
                  className="bg-rose-500 h-full transition-all"
                  style={{
                    width: `${counts.totalClosed > 0 ? (counts.lost / counts.totalClosed) * 100 : 50}%`,
                  }}
                  title={`Lost: ${counts.lost}`}
                />
              </div>
              <p className="text-[10.5px] text-[var(--a-text-subtle)]">
                {counts.totalClosed > 0
                  ? `Out of ${counts.totalClosed} decided deals, you closed ${counts.won} successfully (${counts.closedWonRate}% deal win rate).`
                  : "No deals have been marked as Won or Lost yet. Drag cards in Kanban or change status to track conversion."}
              </p>
            </div>
          </div>

          {/* Channel Revenue & Acquisition Breakdown */}
          <div className="border-t border-white/10 pt-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--a-text-subtle)] mb-3">
              Channel Contribution & Valuation
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(counts.channelStats).map(([channelKey, stats]) => {
                const chMeta = CHANNEL_CONFIG[channelKey] || CHANNEL_CONFIG.other;
                return (
                  <div
                    key={channelKey}
                    className="p-3 rounded-xl border border-white/5 bg-white/[0.02] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{chMeta.icon}</span>
                      <div>
                        <p className="text-xs font-medium text-white">{chMeta.label}</p>
                        <p className="text-[10px] text-[var(--a-text-subtle)]">{stats.count} prospects</p>
                      </div>
                    </div>
                    {stats.value > 0 && (
                      <span className="text-xs font-mono font-semibold text-emerald-400">
                        ${stats.value.toLocaleString()}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* Multi-channel engine badge */}
      <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-xs text-[var(--a-text-muted)] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-500/20 text-violet-300">
            <Bot className="h-3.5 w-3.5" />
          </span>
          <span>
            <strong className="text-[var(--a-text)]">Active Ingestion Engines:</strong> Website AI Companion (Zaki) + Manual CRM Capture. Click &quot;+ Add Lead&quot; to log prospects from LinkedIn or client calls.
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-[var(--a-text-subtle)] flex-wrap">
          <span className="rounded bg-violet-500/10 px-2 py-0.5 border border-violet-500/20 text-violet-300">🤖 Website AI</span>
          <span className="rounded bg-blue-500/10 px-2 py-0.5 border border-blue-500/20 text-blue-300">🔗 LinkedIn</span>
          <span className="rounded bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/20 text-emerald-300">🗺️ Google Maps</span>
          <span className="rounded bg-amber-500/10 px-2 py-0.5 border border-amber-500/20 text-amber-300">🤝 Referrals</span>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="space-y-4">
        {/* Status Pills & View Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { key: "all", label: "All Leads", count: counts.all },
                { key: "new", label: "New", count: counts.new },
                { key: "contacted", label: "Contacted", count: counts.contacted },
                { key: "qualified", label: "Qualified", count: counts.qualified },
                { key: "won", label: "Won 🏆", count: counts.won },
                { key: "lost", label: "Lost ❌", count: counts.lost },
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

          {/* View Switcher (Table vs Kanban vs Cards) */}
          <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.03] p-1 shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === "table"
                  ? "bg-white/15 text-white shadow-sm border border-white/10"
                  : "text-[var(--a-text-muted)] hover:text-white"
              }`}
            >
              <Table className="h-3.5 w-3.5 text-emerald-400" />
              <span>Table (Excel)</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === "kanban"
                  ? "bg-white/15 text-white shadow-sm border border-white/10"
                  : "text-[var(--a-text-muted)] hover:text-white"
              }`}
            >
              <FolderKanban className="h-3.5 w-3.5 text-violet-400" />
              <span>Kanban</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === "cards"
                  ? "bg-white/15 text-white shadow-sm border border-white/10"
                  : "text-[var(--a-text-muted)] hover:text-white"
              }`}
            >
              <LayoutList className="h-3.5 w-3.5 text-cyan-400" />
              <span>Cards</span>
            </button>
          </div>
        </div>

        {/* Priority & Channel Sub-filters + Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--a-text-subtle)]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by prospect name, company, email, store domain, tags, or message…"
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

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as PriorityFilter)}
            aria-label="Filter by priority"
            className="h-11 px-3 rounded-xl bg-white/[0.03] border border-[var(--a-border)] text-xs text-[var(--a-text)] outline-none hover:border-[var(--a-border-strong)]"
          >
            <option value="all" className="bg-gray-900 text-white">All Priorities</option>
            <option value="urgent" className="bg-gray-900 text-red-400">🔴 Urgent</option>
            <option value="high" className="bg-gray-900 text-orange-400">🟠 High Priority</option>
            <option value="medium" className="bg-gray-900 text-amber-400">🟡 Medium</option>
            <option value="low" className="bg-gray-900 text-emerald-400">🟢 Low Priority</option>
          </select>

          {/* Channel filter */}
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value as ChannelFilter)}
            aria-label="Filter by channel"
            className="h-11 px-3 rounded-xl bg-white/[0.03] border border-[var(--a-border)] text-xs text-[var(--a-text)] outline-none hover:border-[var(--a-border-strong)]"
          >
            <option value="all" className="bg-gray-900 text-white">All Channels</option>
            <option value="website" className="bg-gray-900 text-white">🤖 Website AI</option>
            <option value="linkedin" className="bg-gray-900 text-white">🔗 LinkedIn</option>
            <option value="google_maps" className="bg-gray-900 text-white">🗺️ Google Maps</option>
            <option value="referral" className="bg-gray-900 text-white">🤝 Referral</option>
            <option value="cold_outreach" className="bg-gray-900 text-white">📧 Cold Outreach</option>
            <option value="direct" className="bg-gray-900 text-white">📥 Direct Inbound</option>
          </select>
        </div>
      </div>

      {/* Leads View: Kanban Board vs Card List */}
      {viewMode === "kanban" ? (
        <KanbanBoard
          leads={filteredLeads}
          onStatusChange={handleStatusChange}
          onEditLead={handleOpenEditDrawer}
          onDeleteLead={handleDelete}
        />
      ) : filteredLeads.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-[var(--a-text-subtle)]">
            <Inbox className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-[var(--a-text)]">
            {search || statusFilter !== "all" || priorityFilter !== "all" || channelFilter !== "all"
              ? "No matching leads found"
              : "No leads in your CRM yet"}
          </h3>
          <p className="mt-1.5 max-w-md text-xs text-[var(--a-text-subtle)]">
            {search || statusFilter !== "all" || priorityFilter !== "all" || channelFilter !== "all"
              ? "Try adjusting your search query or reset the filter dropdowns above."
              : "Click '+ Add Lead' above to record your first prospect, or let Zaki capture them automatically from your website."}
          </p>
          <div className="mt-4 flex items-center gap-2">
            {(search || statusFilter !== "all" || priorityFilter !== "all" || channelFilter !== "all") && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                  setPriorityFilter("all");
                  setChannelFilter("all");
                }}
                className="text-xs"
              >
                Reset filters
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleOpenCreateDrawer}
              className="text-xs gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" /> Add Lead
            </Button>
          </div>
        </Card>
      ) : viewMode === "table" ? (
        /* High-Density Excel-Style Spreadsheet Table Grid */
        <div className="rounded-2xl border border-white/10 bg-[#0d0d15]/90 backdrop-blur-xl shadow-2xl overflow-hidden">
          {/* Table Top Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <Table className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-[var(--a-text)]">
                  Spreadsheet Data Grid
                </span>
                <span className="text-[11px] text-[var(--a-text-subtle)] ml-2">
                  {filteredLeads.length} {filteredLeads.length === 1 ? "lead" : "leads"} displayed · Single-row compact view
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="text-[var(--a-text-subtle)]">
                Pipeline: <strong className="text-violet-300 font-mono">${counts.pipelineValue.toLocaleString()}</strong>
              </span>
              <span className="text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Won: ${counts.wonRevenue.toLocaleString()} ({counts.won})
              </span>
              {counts.lost > 0 && (
                <span className="text-rose-400 font-mono bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                  Lost: ${counts.lostRevenue.toLocaleString()} ({counts.lost})
                </span>
              )}
            </div>
          </div>

          {/* Responsive Table Scroll Container */}
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse min-w-[1100px]">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03] text-[11px] font-semibold text-[var(--a-text-subtle)] uppercase tracking-wider select-none">
                  <th className="py-3 px-3 w-[44px] text-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                      className="rounded border-zinc-700 bg-zinc-800 text-violet-500 focus:ring-violet-500/30 cursor-pointer h-4 w-4 accent-violet-600"
                      title={isAllSelected ? "Deselect all" : "Select all visible leads"}
                    />
                  </th>
                  <th className="py-3 px-4 w-[240px]">Prospect & Contact</th>
                  <th className="py-3 px-3 w-[180px]">Company / Brand</th>
                  <th className="py-3 px-3 w-[140px]">Channel</th>
                  <th className="py-3 px-3 w-[180px]">Platform & Scope</th>
                  <th className="py-3 px-3 w-[140px]">Value & Budget</th>
                  <th className="py-3 px-3 w-[160px]">Pipeline Stage</th>
                  <th className="py-3 px-3 w-[130px]">Score / Priority</th>
                  <th className="py-3 px-3 w-[90px]">Added</th>
                  <th className="py-3 px-4 w-[140px] text-right sticky right-0 bg-[#0c0e18] shadow-[-10px_0_12px_rgba(0,0,0,0.5)] z-20">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredLeads.map((lead) => {
                  const statusMeta = STATUS_CONFIG[lead.status] || STATUS_CONFIG.new;
                  const priorityMeta = PRIORITY_CONFIG[lead.priority || "medium"] || PRIORITY_CONFIG.medium;
                  const channelMeta = CHANNEL_CONFIG[lead.channel || lead.source] || CHANNEL_CONFIG.other;
                  const leadInitial = (lead.name?.trim().charAt(0) || lead.company?.trim().charAt(0) || lead.email.charAt(0) || "?").toUpperCase();

                  return (
                    <tr
                      key={lead._id}
                      className={`group hover:bg-white/[0.04] transition-colors ${
                        selectedIds.includes(lead._id) ? "bg-violet-950/20" : ""
                      }`}
                    >
                      {/* Selection Checkbox */}
                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(lead._id)}
                          onChange={() => handleToggleSelect(lead._id)}
                          className="rounded border-zinc-700 bg-zinc-800 text-violet-500 focus:ring-violet-500/30 cursor-pointer h-4 w-4 accent-violet-600"
                          title="Select lead"
                        />
                      </td>

                      {/* Prospect */}
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <Link
                            href={`/admin/leads/${lead._id}`}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-gradient-to-br from-violet-500/20 to-blue-500/20 text-xs font-bold text-white hover:border-violet-500/50 hover:scale-105 transition-all"
                            title="View full profile"
                          >
                            {leadInitial}
                          </Link>
                          <div className="min-w-0">
                            <Link
                              href={`/admin/leads/${lead._id}`}
                              className="font-semibold text-white hover:text-violet-300 hover:underline transition-colors truncate block max-w-[170px]"
                              title={lead.name || lead.email}
                            >
                              {lead.name ? lead.name : "Prospective Client"}
                            </Link>
                            <div className="flex items-center gap-1.5 text-[11px] text-[var(--a-text-subtle)] font-mono">
                              <span className="truncate max-w-[120px]">{lead.email}</span>
                              <button
                                type="button"
                                onClick={() => handleCopyEmail(lead.email, lead._id)}
                                title="Copy email"
                                className="hover:text-white"
                              >
                                {copiedEmailId === lead._id ? (
                                  <Check className="h-3 w-3 text-emerald-400" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Company / Brand */}
                      <td className="py-2.5 px-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 font-medium text-white truncate max-w-[160px]">
                            {lead.company ? (
                              <>
                                <Building2 className="h-3 w-3 text-violet-400 shrink-0" />
                                <span className="truncate">{lead.company}</span>
                              </>
                            ) : (
                              <span className="text-[var(--a-text-subtle)] italic">—</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-[var(--a-text-subtle)] mt-0.5">
                            {lead.location && (
                              <span className="flex items-center gap-0.5 truncate max-w-[120px]">
                                <MapPin className="h-2.5 w-2.5 text-rose-400 shrink-0" />
                                <span className="truncate">{lead.location}</span>
                              </span>
                            )}
                            {lead.storeUrl && (
                              <a
                                href={lead.storeUrl.startsWith("http") ? lead.storeUrl : `https://${lead.storeUrl}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-cyan-400 hover:underline flex items-center gap-0.5 shrink-0"
                                title="Open store"
                              >
                                <Globe className="h-2.5 w-2.5" />
                                <ExternalLink className="h-2 w-2" />
                              </a>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Channel */}
                      <td className="py-2.5 px-3">
                        <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10.5px] font-medium whitespace-nowrap ${channelMeta.tone}`}>
                          <span>{channelMeta.icon}</span>
                          <span>{channelMeta.label}</span>
                        </span>
                      </td>

                      {/* Platform & Project */}
                      <td className="py-2.5 px-3">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5">
                            {lead.currentPlatform ? (
                              <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10.5px] font-medium bg-white/5 border border-white/10 text-zinc-300">
                                <Zap className="h-2.5 w-2.5 text-amber-400" />
                                {lead.currentPlatform}
                              </span>
                            ) : (
                              <span className="text-[11px] text-[var(--a-text-subtle)]">Website</span>
                            )}
                          </div>
                          {lead.projectType && (
                            <span className="text-[11px] text-violet-300 truncate max-w-[160px]">
                              {PROJECT_TYPE_LABELS[lead.projectType] || lead.projectType}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Est. Value & Budget */}
                      <td className="py-2.5 px-3">
                        <div>
                          {typeof lead.estimatedValue === "number" && lead.estimatedValue > 0 ? (
                            <span className="font-mono font-bold text-emerald-400 text-xs">
                              ${lead.estimatedValue.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-[var(--a-text-subtle)] font-mono">—</span>
                          )}
                          {lead.projectBudget && (
                            <div className="text-[10px] text-[var(--a-text-subtle)] truncate max-w-[120px]">
                              {lead.projectBudget}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-2.5 px-3">
                        <div className="relative inline-block">
                          <select
                            value={lead.status === "closed" ? "won" : lead.status}
                            onChange={(e) =>
                              handleStatusChange(lead._id, e.target.value as SerializedLead["status"])
                            }
                            aria-label="Lead status"
                            className={`cursor-pointer appearance-none rounded-lg border px-2.5 py-1 pr-6 text-[11px] font-medium outline-none transition-colors ${statusMeta.bg} ${statusMeta.border} ${statusMeta.text}`}
                          >
                            <option value="new" className="bg-[#12121a] text-emerald-300">🟢 New Inquiry</option>
                            <option value="contacted" className="bg-[#12121a] text-cyan-300">🔵 Contacted</option>
                            <option value="qualified" className="bg-[#12121a] text-amber-300">🟡 Qualified</option>
                            <option value="won" className="bg-[#12121a] text-emerald-300">🏆 Closed Won</option>
                            <option value="lost" className="bg-[#12121a] text-rose-300">❌ Closed Lost</option>
                            <option value="archived" className="bg-[#12121a] text-zinc-400">⚪ Archived</option>
                          </select>
                          <ChevronDown className={`pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 opacity-70 ${statusMeta.text}`} />
                        </div>
                      </td>

                      {/* Score / Priority */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10.5px] font-medium border ${priorityMeta.badge}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${priorityMeta.dot}`} />
                            {priorityMeta.label}
                          </span>
                          {typeof lead.leadScore === "number" && lead.leadScore > 0 && (
                            <span className="text-[10.5px] font-semibold text-violet-300 font-mono">
                              🔥{lead.leadScore}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Added Date */}
                      <td className="py-2.5 px-3">
                        <span
                          title={formatFullDateTime(lead.createdAt)}
                          className="text-[11px] text-[var(--a-text-subtle)] whitespace-nowrap"
                        >
                          {formatRelativeTime(lead.createdAt)}
                        </span>
                      </td>

                      {/* Quick Actions */}
                      {/* Actions (Sticky Right) */}
                      <td className="py-2.5 px-4 text-right sticky right-0 bg-[#0c0e18] group-hover:bg-[#121626] shadow-[-10px_0_12px_rgba(0,0,0,0.5)] z-10 transition-colors">
                        <div className="flex items-center justify-end gap-1">
                          {/* Quick Email */}
                          <button
                            type="button"
                            onClick={() => setEmailingLead(lead)}
                            title="Send proposal or outreach email"
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                          >
                            <Send className="h-3.5 w-3.5" />
                          </button>

                          {/* Edit in Drawer */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditDrawer(lead)}
                            title="Quick Edit"
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--a-text-subtle)] hover:bg-white/10 hover:text-white transition-colors"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>

                          {/* Open Profile Page */}
                          <Link
                            href={`/admin/leads/${lead._id}`}
                            title="View Timeline & Audit"
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--a-text-subtle)] hover:bg-white/10 hover:text-white transition-colors"
                          >
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </Link>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDelete(lead)}
                            title="Delete Lead"
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards View */
        <div className="space-y-4">
          {filteredLeads.map((lead) => {
            const statusMeta = STATUS_CONFIG[lead.status] || STATUS_CONFIG.new;
            const priorityMeta = PRIORITY_CONFIG[lead.priority || "medium"] || PRIORITY_CONFIG.medium;
            const channelMeta = CHANNEL_CONFIG[lead.channel || lead.source] || CHANNEL_CONFIG.other;
            const isEditingNotes = editingNotesId === lead._id;
            const leadInitial = (lead.name?.trim().charAt(0) || lead.company?.trim().charAt(0) || lead.email.charAt(0) || "?").toUpperCase();

            return (
              <Card
                key={lead._id}
                className="group relative overflow-hidden p-5 transition-all hover:border-white/20 hover:bg-white/[0.04]"
              >
                {/* Status indicator strip on left */}
                <div
                  className={`absolute bottom-0 left-0 top-0 w-1.5 ${
                    lead.status === "new"
                      ? "bg-emerald-500"
                      : lead.status === "contacted"
                      ? "bg-cyan-500"
                      : lead.status === "qualified"
                      ? "bg-amber-500"
                      : lead.status === "won" || lead.status === "closed"
                      ? "bg-emerald-500"
                      : lead.status === "lost"
                      ? "bg-rose-500"
                      : "bg-white/10"
                  }`}
                />

                <div className="space-y-4 pl-2">
                  {/* Row 1: Header - Checkbox, Avatar, Name, Company, Badges, Actions */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(lead._id)}
                        onChange={() => handleToggleSelect(lead._id)}
                        className="mt-3.5 rounded border-zinc-700 bg-zinc-800 text-violet-500 focus:ring-violet-500/30 cursor-pointer h-4 w-4 accent-violet-600"
                        title="Select lead"
                      />

                      {/* Avatar */}
                      <Link
                        href={`/admin/leads/${lead._id}`}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-violet-500/20 to-blue-500/20 text-base font-bold text-white shadow-sm hover:scale-105 hover:border-violet-500/50 transition-all"
                        title="View full lead timeline & profile"
                      >
                        {leadInitial}
                      </Link>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/admin/leads/${lead._id}`}
                            className="text-base font-semibold text-[var(--a-text)] hover:text-violet-300 hover:underline transition-colors"
                          >
                            {lead.name ? lead.name : "Prospective Client"}
                          </Link>

                          {/* Company if present */}
                          {lead.company && (
                            <span className="flex items-center gap-1 text-xs text-[var(--a-text-muted)] font-medium">
                              <Building2 className="h-3.5 w-3.5 text-violet-400" />
                              {lead.company}
                            </span>
                          )}

                          {/* Origin Channel Badge */}
                          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10.5px] font-medium ${channelMeta.tone}`}>
                            <span>{channelMeta.icon}</span>
                            <span>{channelMeta.label}</span>
                          </span>

                          {/* Priority Badge */}
                          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10.5px] font-medium ${priorityMeta.badge}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${priorityMeta.dot} ${lead.priority === "urgent" ? "animate-ping" : ""}`} />
                            <span>{priorityMeta.label}</span>
                          </span>

                          {/* Lead Score Indicator */}
                          {typeof lead.leadScore === "number" && lead.leadScore > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-violet-500/20 bg-violet-500/10 px-2 py-0.5 text-[10.5px] font-semibold text-violet-300">
                              <Flame className="h-3 w-3 text-violet-400" />
                              Score: {lead.leadScore}
                            </span>
                          )}
                        </div>

                        {/* Email & Phone row with quick copy and mailto */}
                        <div className="mt-1 flex flex-wrap items-center gap-2.5 text-xs">
                          <span className="font-mono text-zinc-300">{lead.email}</span>
                          <button
                            onClick={() => handleCopyEmail(lead.email, lead._id)}
                            title="Copy email address"
                            className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-[var(--a-text-subtle)] hover:bg-white/10 hover:text-white transition-colors"
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
                          <button
                            type="button"
                            onClick={() => setEmailingLead(lead)}
                            className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-cyan-400 hover:bg-cyan-500/10 hover:underline transition-colors"
                          >
                            <Send className="h-3 w-3" />
                            <span>Send Email</span>
                          </button>

                          {lead.phone && (
                            <a
                              href={`tel:${lead.phone}`}
                              className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-emerald-400 hover:bg-emerald-500/10 hover:underline"
                            >
                              <Phone className="h-3 w-3" />
                              <span>{lead.phone}</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status dropdown & Card Actions */}
                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      {/* Status Selector Dropdown */}
                      <div className="relative">
                        <select
                          value={lead.status === "closed" ? "won" : lead.status}
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
                          <option value="won" className="bg-[#12121a] text-emerald-300">
                            🏆 Closed Won
                          </option>
                          <option value="lost" className="bg-[#12121a] text-rose-300">
                            ❌ Closed Lost
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

                      {/* View Details Page */}
                      <Link
                        href={`/admin/leads/${lead._id}`}
                        title="View timeline & full profile"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--a-text-subtle)] hover:bg-white/10 hover:text-white transition-colors"
                      >
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>

                      {/* Edit Button */}
                      <button
                        onClick={() => handleOpenEditDrawer(lead)}
                        title="Edit lead profile"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--a-text-subtle)] hover:bg-white/10 hover:text-white transition-colors"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>

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

                  {/* Row 2: Metadata Pills (Store URL, Platform, Project, Budget, Location) */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {/* Store URL */}
                    {lead.storeUrl ? (
                      <a
                        href={lead.storeUrl.startsWith("http") ? lead.storeUrl : `https://${lead.storeUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-zinc-300 hover:border-cyan-400/40 hover:text-cyan-300 transition-colors"
                      >
                        <Globe className="h-3.5 w-3.5 text-cyan-400" />
                        <span>{lead.storeUrl.replace(/^https?:\/\//, "")}</span>
                        <ExternalLink className="h-3 w-3 opacity-60" />
                      </a>
                    ) : null}

                    {/* LinkedIn Link */}
                    {lead.linkedinUrl ? (
                      <a
                        href={lead.linkedinUrl.startsWith("http") ? lead.linkedinUrl : `https://${lead.linkedinUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-blue-300 hover:border-blue-400/40 transition-colors"
                      >
                        <LinkedInIcon className="h-3.5 w-3.5" />
                        <span>LinkedIn Profile</span>
                        <ExternalLink className="h-3 w-3 opacity-60" />
                      </a>
                    ) : null}

                    {/* Current Platform */}
                    {lead.currentPlatform && (
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-zinc-300">
                        <Zap className="h-3.5 w-3.5 text-amber-400" />
                        <span>Platform: {lead.currentPlatform}</span>
                      </span>
                    )}

                    {/* Project Type */}
                    {lead.projectType && lead.projectType !== "other" && (
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-violet-500/20 bg-violet-500/10 px-2.5 py-1 text-violet-300">
                        <Briefcase className="h-3.5 w-3.5" />
                        <span>{PROJECT_TYPE_LABELS[lead.projectType] || lead.projectType}</span>
                      </span>
                    )}

                    {/* Location */}
                    {lead.location && (
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/[0.02] px-2.5 py-1 text-zinc-400">
                        <MapPin className="h-3.5 w-3.5 text-rose-400" />
                        <span>{lead.location}</span>
                      </span>
                    )}

                    {/* Budget & Est. Deal Value */}
                    {(lead.projectBudget || lead.estimatedValue) && (
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 font-medium text-emerald-300">
                        <DollarSign className="h-3.5 w-3.5" />
                        <span>
                          {lead.projectBudget ? `Budget: ${lead.projectBudget}` : ""}
                          {lead.estimatedValue ? ` (Est: $${lead.estimatedValue.toLocaleString()})` : ""}
                        </span>
                      </span>
                    )}
                  </div>

                  {/* Row 3: Tags */}
                  {Array.isArray(lead.tags) && lead.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      {lead.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[11px] text-zinc-300"
                        >
                          <TagIcon className="h-2.5 w-2.5 text-violet-400" />
                          <span>{tag}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Row 4: Message / Inquiry Body */}
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

                  {/* Row 5: Private Admin Notes */}
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

      {/* Slide-out Lead Drawer for Create & Edit */}
      <LeadDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        lead={selectedLead}
        onSaved={handleLeadSaved}
        onDelete={handleDelete}
      />

      {/* Outreach Email Composer Modal */}
      {emailingLead && (
        <EmailModal
          open={Boolean(emailingLead)}
          onClose={() => setEmailingLead(null)}
          lead={emailingLead}
          onEmailSent={handleRefresh}
        />
      )}

      {/* AI Lead Radar Discovery Engine (Phase 6) */}
      <AiLeadRadarModal
        open={radarOpen}
        onClose={() => setRadarOpen(false)}
        onLeadsImported={handleRefresh}
      />

      {/* Floating Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-wrap items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-zinc-950/95 border border-violet-500/40 shadow-2xl shadow-violet-950/60 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-200 max-w-[95vw]">
          <div className="flex items-center gap-2 pr-3 border-r border-white/10 shrink-0">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white shadow-sm">
              {selectedIds.length}
            </span>
            <span className="text-xs font-semibold text-white whitespace-nowrap">
              Selected
            </span>
          </div>

          {/* Bulk Status Select */}
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[11px] text-[var(--a-text-subtle)] hidden sm:inline">Status:</span>
            <select
              disabled={bulkLoading}
              onChange={(e) => {
                if (e.target.value) {
                  handleBulkStatusChange(e.target.value as SerializedLead["status"]);
                  e.target.value = "";
                }
              }}
              defaultValue=""
              className="h-8 px-2.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white outline-none hover:border-violet-400 focus:border-violet-500 cursor-pointer"
            >
              <option value="" disabled className="bg-zinc-900 text-zinc-400">
                Change Status...
              </option>
              <option value="new" className="bg-zinc-900 text-emerald-400">New Inquiry</option>
              <option value="contacted" className="bg-zinc-900 text-cyan-400">Contacted / Outreach</option>
              <option value="qualified" className="bg-zinc-900 text-amber-400">Qualified Lead</option>
              <option value="won" className="bg-zinc-900 text-emerald-300">Closed Won 🏆</option>
              <option value="lost" className="bg-zinc-900 text-rose-400">Lost</option>
              <option value="closed" className="bg-zinc-900 text-zinc-300">Closed</option>
              <option value="archived" className="bg-zinc-900 text-zinc-400">Archived</option>
            </select>
          </div>

          {/* Bulk Priority Select */}
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[11px] text-[var(--a-text-subtle)] hidden sm:inline">Priority:</span>
            <select
              disabled={bulkLoading}
              onChange={(e) => {
                if (e.target.value) {
                  handleBulkPriorityChange(e.target.value as SerializedLead["priority"]);
                  e.target.value = "";
                }
              }}
              defaultValue=""
              className="h-8 px-2.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white outline-none hover:border-violet-400 focus:border-violet-500 cursor-pointer"
            >
              <option value="" disabled className="bg-zinc-900 text-zinc-400">
                Change Priority...
              </option>
              <option value="urgent" className="bg-zinc-900 text-rose-400">🔴 Urgent</option>
              <option value="high" className="bg-zinc-900 text-orange-400">🟠 High</option>
              <option value="medium" className="bg-zinc-900 text-amber-400">🟡 Medium</option>
              <option value="low" className="bg-zinc-900 text-emerald-400">🟢 Low</option>
            </select>
          </div>

          {/* Bulk Export */}
          <Button
            size="sm"
            variant="secondary"
            onClick={handleBulkExportSelected}
            className="gap-1.5 text-xs h-8 shrink-0"
          >
            <Download className="h-3 w-3" />
            <span className="hidden sm:inline">Export</span> CSV
          </Button>

          {/* Bulk Delete Button */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowBulkDeleteConfirm(true)}
            className="gap-1.5 text-xs h-8 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 shrink-0"
          >
            <Trash2 className="h-3 w-3" />
            Delete ({selectedIds.length})
          </Button>

          {/* Clear Selection */}
          <button
            onClick={() => setSelectedIds([])}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors ml-1"
            title="Clear selection"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Single Lead Delete Confirmation Modal */}
      {leadToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-rose-500/30 bg-zinc-950 p-6 shadow-2xl shadow-rose-950/50 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Lead Profile</h3>
                <p className="text-xs text-[var(--a-text-subtle)]">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed bg-white/[0.02] p-3 rounded-xl border border-white/5">
              Are you sure you want to permanently delete{" "}
              <strong className="text-white">
                {leadToDelete.name || leadToDelete.company || "this lead"}
              </strong>{" "}
              ({leadToDelete.email})? All associated timeline logs and notes will be deleted.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLeadToDelete(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmSingleDelete}
                className="bg-rose-600 hover:bg-rose-500 text-white font-semibold gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Yes, Delete Lead
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-rose-500/30 bg-zinc-950 p-6 shadow-2xl shadow-rose-950/50 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Bulk Delete {selectedIds.length} Leads</h3>
                <p className="text-xs text-[var(--a-text-subtle)]">Permanent deletion warning</p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed bg-white/[0.02] p-3 rounded-xl border border-white/5">
              Are you sure you want to permanently delete all{" "}
              <strong className="text-rose-400 font-bold">{selectedIds.length} selected leads</strong>?
              This will remove their CRM records, pitch copy, and communication timelines permanently.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBulkDeleteConfirm(false)}
                disabled={bulkLoading}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmBulkDelete}
                loading={bulkLoading}
                className="bg-rose-600 hover:bg-rose-500 text-white font-semibold gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete {selectedIds.length} Leads
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
