"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Briefcase,
  Zap,
  Edit3,
  Trash2,
  Copy,
  Check,
  Send,
  ExternalLink,
  PhoneCall,
  Video,
  AlarmClock,
  Plus,
  Sparkles,
  ChevronDown,
  X,
  FileText,
  User,
  Flame,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { Card, Badge, Button, Input, Textarea, Label } from "../../../_ui";
import {
  SerializedLead,
  SerializedActivity,
  updateLeadStatus,
  updateLeadNotes,
  deleteLead,
  logCallOrMeeting,
  scheduleFollowUp,
  getLeadActivities,
} from "../actions";
import LeadDrawer from "../LeadDrawer";
import ActivityTimeline from "../ActivityTimeline";
import EmailModal from "../EmailModal";

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

interface LeadDetailClientProps {
  initialLead: SerializedLead;
  initialActivities: SerializedActivity[];
}

const STATUS_CONFIG: Record<
  SerializedLead["status"],
  { label: string; bg: string; border: string; text: string }
> = {
  new: { label: "New Inquiry", bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-300" },
  contacted: { label: "Contacted", bg: "bg-cyan-500/10", border: "border-cyan-500/30", text: "text-cyan-300" },
  qualified: { label: "Qualified", bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-300" },
  won: { label: "Closed Won 🏆", bg: "bg-emerald-500/15", border: "border-emerald-500/40", text: "text-emerald-300" },
  lost: { label: "Closed Lost ❌", bg: "bg-rose-500/15", border: "border-rose-500/40", text: "text-rose-300" },
  closed: { label: "Closed / Won", bg: "bg-emerald-500/15", border: "border-emerald-500/40", text: "text-emerald-300" },
  archived: { label: "Archived", bg: "bg-white/5", border: "border-white/10", text: "text-[var(--a-text-subtle)]" },
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

export default function LeadDetailClient({ initialLead, initialActivities }: LeadDetailClientProps) {
  const router = useRouter();
  const [lead, setLead] = useState<SerializedLead>(initialLead);
  const [activities, setActivities] = useState<SerializedActivity[]>(initialActivities);

  // Modals & Drawers
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  // Call / Meeting Modal State
  const [interactionType, setInteractionType] = useState<"call" | "meeting">("call");
  const [callTitle, setCallTitle] = useState("Discovery & Store Audit Call");
  const [callOutcome, setCallOutcome] = useState("Interested - Requested Proposal");
  const [callDuration, setCallDuration] = useState("20");
  const [callNotes, setCallNotes] = useState("");
  const [loggingInteraction, setLoggingInteraction] = useState(false);

  // Follow-up Modal State
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpNotes, setFollowUpNotes] = useState("Send tailored Shopify Liquid proposal and live demo links");
  const [schedulingFollowUp, setSchedulingFollowUp] = useState(false);

  // Notes state
  const [notes, setNotes] = useState(lead.notes || "");
  const [savingNotes, setSavingNotes] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Refresh activities
  const reloadActivities = async () => {
    const acts = await getLeadActivities(lead._id);
    setActivities(acts);
  };

  // Status Change
  const handleStatusChange = async (newStatus: SerializedLead["status"]) => {
    setLead((prev) => ({ ...prev, status: newStatus }));
    try {
      await updateLeadStatus(lead._id, newStatus);
      toast.success(`Status updated to "${STATUS_CONFIG[newStatus].label}"`);
      await reloadActivities();
    } catch {
      toast.error("Failed to update status");
    }
  };

  // Save Notes
  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      await updateLeadNotes(lead._id, notes);
      setLead((prev) => ({ ...prev, notes }));
      toast.success("Notes saved successfully");
      await reloadActivities();
    } catch {
      toast.error("Failed to save notes");
    } finally {
      setSavingNotes(false);
    }
  };

  // Copy Email
  const handleCopyEmail = () => {
    navigator.clipboard.writeText(lead.email);
    setCopiedEmail(true);
    toast.success("Email copied to clipboard");
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  // Delete Lead
  const handleDeleteLead = async () => {
    if (!confirm(`Are you sure you want to permanently delete lead ${lead.email}?`)) {
      return;
    }
    try {
      await deleteLead(lead._id);
      toast.success("Lead removed successfully");
      router.push("/admin/leads");
    } catch {
      toast.error("Failed to delete lead");
    }
  };

  // Submit Call / Meeting
  const handleLogInteraction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingInteraction(true);
    try {
      const res = await logCallOrMeeting(lead._id, {
        type: interactionType,
        title: callTitle,
        outcome: callOutcome,
        notes: callNotes,
        durationMinutes: parseInt(callDuration) || undefined,
      });

      if (!res.success) throw new Error(res.error);
      toast.success(`${interactionType === "call" ? "Call" : "Meeting"} logged to timeline`);
      setIsCallModalOpen(false);
      setCallNotes("");
      if (res.activity) {
        setActivities((prev) => [res.activity!, ...prev]);
      } else {
        await reloadActivities();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to log interaction");
    } finally {
      setLoggingInteraction(false);
    }
  };

  // Submit Follow-up
  const handleScheduleFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpDate) {
      toast.error("Please pick a follow-up date and time");
      return;
    }
    setSchedulingFollowUp(true);
    try {
      const res = await scheduleFollowUp(lead._id, followUpDate, followUpNotes);
      if (!res.success) throw new Error(res.error);
      toast.success("Follow-up reminder set");
      setLead((prev) => ({ ...prev, nextFollowUpAt: new Date(followUpDate).toISOString() }));
      setIsFollowUpModalOpen(false);
      await reloadActivities();
    } catch (err: any) {
      toast.error(err.message || "Failed to schedule follow-up");
    } finally {
      setSchedulingFollowUp(false);
    }
  };

  const statusMeta = STATUS_CONFIG[lead.status] || STATUS_CONFIG.new;
  const leadInitial = (lead.name?.trim().charAt(0) || lead.company?.trim().charAt(0) || lead.email.charAt(0) || "?").toUpperCase();

  return (
    <div className="space-y-8 pb-16">
      {/* Top Navigation & Action Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/leads"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-[var(--a-text-muted)] hover:bg-white/[0.08] hover:text-white transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-violet-400">Prospect Profile</span>
              <span className="text-zinc-600">/</span>
              <span className="text-xs text-[var(--a-text-subtle)] font-mono">{lead._id.slice(-6)}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--a-text)] mt-0.5">
              {lead.company || lead.name || lead.email}
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={lead.status}
              onChange={(e) => handleStatusChange(e.target.value as SerializedLead["status"])}
              aria-label="Lead status"
              className={`cursor-pointer appearance-none rounded-xl border px-3.5 py-2 pr-8 text-xs font-semibold outline-none transition-colors ${statusMeta.bg} ${statusMeta.border} ${statusMeta.text}`}
            >
              <option value="new" className="bg-[#12121a] text-emerald-300">🟢 New Inquiry</option>
              <option value="contacted" className="bg-[#12121a] text-cyan-300">🔵 Contacted</option>
              <option value="qualified" className="bg-[#12121a] text-amber-300">🟡 Qualified</option>
              <option value="won" className="bg-[#12121a] text-emerald-300">🏆 Closed Won</option>
              <option value="lost" className="bg-[#12121a] text-rose-300">❌ Closed Lost</option>
              <option value="archived" className="bg-[#12121a] text-zinc-400">⚪ Archived</option>
            </select>
            <ChevronDown className={`pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 opacity-70 ${statusMeta.text}`} />
          </div>

          {/* Log Call / Meeting */}
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setIsCallModalOpen(true)}
            className="gap-1.5 text-xs"
          >
            <PhoneCall className="h-3.5 w-3.5 text-rose-400" />
            Log Call / Meeting
          </Button>

          {/* Schedule Follow-up */}
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setIsFollowUpModalOpen(true)}
            className="gap-1.5 text-xs"
          >
            <AlarmClock className="h-3.5 w-3.5 text-emerald-400" />
            Follow-up
          </Button>

          {/* Edit Lead */}
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setIsEditDrawerOpen(true)}
            className="gap-1.5 text-xs"
          >
            <Edit3 className="h-3.5 w-3.5 text-amber-400" />
            Edit Profile
          </Button>

          {/* Send Email */}
          <Button
            size="sm"
            onClick={() => setIsEmailModalOpen(true)}
            className="gap-1.5 text-xs font-semibold shadow-lg shadow-violet-500/20"
          >
            <Send className="h-3.5 w-3.5" />
            Send Email
          </Button>

          {/* Delete */}
          <button
            onClick={handleDeleteLead}
            title="Delete prospect"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-300 hover:bg-red-500/20 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Main Grid: Left = Info & Notes, Right = Follow-up & Timeline */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column (7 cols) */}
        <div className="space-y-6 lg:col-span-7">
          {/* Lead Profile Summary Card */}
          <Card className="p-6 relative overflow-hidden">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/20 to-blue-500/20 text-xl font-bold text-white shadow-lg">
                {leadInitial}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-semibold text-[var(--a-text)]">
                    {lead.name || "Client Prospect"}
                  </h2>
                  {lead.company && (
                    <span className="flex items-center gap-1 text-sm font-medium text-violet-300">
                      <Building2 className="h-4 w-4" />
                      {lead.company}
                    </span>
                  )}
                </div>

                {/* Email & Phone */}
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5 font-mono text-zinc-300 bg-white/[0.03] px-2.5 py-1 rounded-lg border border-white/5">
                    <Mail className="h-3.5 w-3.5 text-cyan-400" />
                    <span>{lead.email}</span>
                    <button
                      onClick={handleCopyEmail}
                      title="Copy email"
                      className="text-[var(--a-text-subtle)] hover:text-white ml-1"
                    >
                      {copiedEmail ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>

                  {lead.phone && (
                    <a
                      href={`tel:${lead.phone}`}
                      className="flex items-center gap-1.5 text-zinc-300 bg-white/[0.03] px-2.5 py-1 rounded-lg border border-white/5 hover:text-emerald-300 transition-colors"
                    >
                      <Phone className="h-3.5 w-3.5 text-emerald-400" />
                      <span>{lead.phone}</span>
                    </a>
                  )}

                  {lead.location && (
                    <span className="flex items-center gap-1.5 text-zinc-400 bg-white/[0.02] px-2.5 py-1 rounded-lg border border-white/5">
                      <MapPin className="h-3.5 w-3.5 text-rose-400" />
                      <span>{lead.location}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 border-t border-white/10 pt-5">
              <div className="space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-[var(--a-text-subtle)]">Priority</span>
                <p className="text-xs font-semibold capitalize text-zinc-200">
                  {lead.priority || "Medium"}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-[var(--a-text-subtle)]">Lead Score</span>
                <p className="text-xs font-semibold text-violet-300 flex items-center gap-1">
                  <Flame className="h-3 w-3 text-violet-400" />
                  {lead.leadScore ?? 20} / 100
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-[var(--a-text-subtle)]">Deal Est. Value</span>
                <p className="text-xs font-semibold text-emerald-300">
                  {lead.estimatedValue ? `$${lead.estimatedValue.toLocaleString()}` : lead.projectBudget || "TBD"}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-[var(--a-text-subtle)]">Channel</span>
                <p className="text-xs font-semibold capitalize text-cyan-300">
                  {lead.channel || lead.source}
                </p>
              </div>
            </div>

            {/* Online Links & Stack Details */}
            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs border-t border-white/10 pt-4">
              {lead.storeUrl && (
                <a
                  href={lead.storeUrl.startsWith("http") ? lead.storeUrl : `https://${lead.storeUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/25 bg-cyan-500/10 px-3 py-1.5 text-cyan-300 hover:bg-cyan-500/20 transition-all"
                >
                  <Globe className="h-3.5 w-3.5" />
                  <span>Store: {lead.storeUrl.replace(/^https?:\/\//, "")}</span>
                  <ExternalLink className="h-3 w-3 opacity-70" />
                </a>
              )}

              {lead.website && (
                <a
                  href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-zinc-300 hover:text-white transition-all"
                >
                  <Globe className="h-3.5 w-3.5" />
                  <span>Website</span>
                  <ExternalLink className="h-3 w-3 opacity-70" />
                </a>
              )}

              {lead.linkedinUrl && (
                <a
                  href={lead.linkedinUrl.startsWith("http") ? lead.linkedinUrl : `https://${lead.linkedinUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-blue-300 hover:border-blue-400/40 transition-all"
                >
                  <LinkedInIcon className="h-3.5 w-3.5" />
                  <span>LinkedIn</span>
                  <ExternalLink className="h-3 w-3 opacity-70" />
                </a>
              )}

              {lead.currentPlatform && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-amber-300">
                  <Zap className="h-3.5 w-3.5" />
                  <span>Stack: {lead.currentPlatform}</span>
                </span>
              )}

              {lead.projectType && lead.projectType !== "other" && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 text-violet-300">
                  <Briefcase className="h-3.5 w-3.5" />
                  <span>{PROJECT_TYPE_LABELS[lead.projectType] || lead.projectType}</span>
                </span>
              )}
            </div>

            {/* Tags */}
            {Array.isArray(lead.tags) && lead.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {lead.tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-xs text-zinc-300"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </Card>

          {/* Prospect Inquiry & Context Card */}
          {lead.message && (
            <Card className="p-6">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-violet-300 mb-3">
                <FileText className="h-4 w-4" />
                <span>Original Inquiry & Requirements</span>
              </div>
              <div className="rounded-xl border border-white/5 bg-black/40 p-4">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-200">
                  {lead.message}
                </p>
              </div>
            </Card>
          )}

          {/* Internal Strategy & Admin Notes Card */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-300">
                <Edit3 className="h-4 w-4" />
                <span>Private Deal Notes & Next Strategy</span>
              </div>
              <span className="text-[11px] text-[var(--a-text-subtle)]">Visible only to Zakaria</span>
            </div>
            <Textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record private context: price discussed, client pain points, objections, next steps, Liquid codebase notes..."
              className="mb-3"
            />
            <div className="flex items-center justify-end">
              <Button
                size="sm"
                onClick={handleSaveNotes}
                loading={savingNotes}
                className="gap-1.5 text-xs"
              >
                <Check className="h-3.5 w-3.5" /> Save Strategy Note
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column (5 cols): Follow-up Banner + Activity Timeline */}
        <div className="space-y-6 lg:col-span-5">
          {/* Follow-up Reminder Banner */}
          {lead.nextFollowUpAt ? (
            <Card className="p-5 border-emerald-500/30 bg-emerald-500/[0.04]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  <AlarmClock className="h-4 w-4" />
                  <span>Scheduled Follow-up</span>
                </div>
                <button
                  onClick={() => setIsFollowUpModalOpen(true)}
                  className="text-xs text-emerald-300 hover:underline"
                >
                  Reschedule
                </button>
              </div>
              <p className="mt-2 text-base font-bold text-white">
                {new Date(lead.nextFollowUpAt).toLocaleString("en-US", {
                  dateStyle: "full",
                  timeStyle: "short",
                })}
              </p>
            </Card>
          ) : (
            <Card className="p-4 border-dashed border-white/10 bg-white/[0.01] flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-xs text-[var(--a-text-subtle)]">
                <AlarmClock className="h-4 w-4 text-gray-500" />
                <span>No follow-up reminder scheduled</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsFollowUpModalOpen(true)}
                className="text-xs h-7"
              >
                Set Follow-up
              </Button>
            </Card>
          )}

          {/* Activity Timeline Section */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-5 border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-400" />
                <h3 className="text-sm font-semibold text-[var(--a-text)]">Interaction History</h3>
              </div>
              <span className="text-xs text-[var(--a-text-subtle)] font-mono">
                {activities.length} {activities.length === 1 ? "event" : "events"}
              </span>
            </div>

            <ActivityTimeline activities={activities} />
          </Card>
        </div>
      </div>

      {/* Edit Lead Drawer */}
      <LeadDrawer
        open={isEditDrawerOpen}
        onClose={() => setIsEditDrawerOpen(false)}
        lead={lead}
        onSaved={(updated) => {
          setLead(updated);
          reloadActivities();
        }}
      />

      {/* Log Call / Meeting Modal */}
      {isCallModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[var(--a-surface)] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center">
                  <PhoneCall className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Log Call or Meeting</h3>
                  <p className="text-xs text-[var(--a-text-subtle)]">Record notes and outcome from your conversation</p>
                </div>
              </div>
              <button
                onClick={() => setIsCallModalOpen(false)}
                className="text-[var(--a-text-muted)] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleLogInteraction} className="space-y-4">
              {/* Type Switch */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-white/[0.03] border border-white/10">
                <button
                  type="button"
                  onClick={() => setInteractionType("call")}
                  className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-colors ${
                    interactionType === "call" ? "bg-white/15 text-white" : "text-[var(--a-text-muted)] hover:text-white"
                  }`}
                >
                  <PhoneCall className="h-3.5 w-3.5" /> Phone / WhatsApp Call
                </button>
                <button
                  type="button"
                  onClick={() => setInteractionType("meeting")}
                  className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-colors ${
                    interactionType === "meeting" ? "bg-white/15 text-white" : "text-[var(--a-text-muted)] hover:text-white"
                  }`}
                >
                  <Video className="h-3.5 w-3.5" /> Google Meet / Zoom
                </button>
              </div>

              <div>
                <Label htmlFor="call-title">Call Subject / Topic</Label>
                <Input
                  id="call-title"
                  value={callTitle}
                  onChange={(e) => setCallTitle(e.target.value)}
                  placeholder="e.g. Discovery Call & Shopify Liquid Walkthrough"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="call-duration">Duration (Minutes)</Label>
                  <Input
                    id="call-duration"
                    type="number"
                    value={callDuration}
                    onChange={(e) => setCallDuration(e.target.value)}
                    placeholder="25"
                  />
                </div>
                <div>
                  <Label htmlFor="call-outcome">Conversation Outcome</Label>
                  <select
                    id="call-outcome"
                    value={callOutcome}
                    onChange={(e) => setCallOutcome(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-white/[0.03] border border-[var(--a-border)] text-xs text-[var(--a-text)] outline-none"
                  >
                    <option value="Interested - Requested Proposal" className="bg-gray-900 text-white">Interested - Proposal Requested</option>
                    <option value="Scheduled Follow-up Demo" className="bg-gray-900 text-white">Scheduled Follow-up Demo</option>
                    <option value="Ready to Close / Sent Invoice" className="bg-gray-900 text-white">Ready to Close / Sent Invoice</option>
                    <option value="Left Voicemail / Follow-up Needed" className="bg-gray-900 text-white">Left Voicemail</option>
                    <option value="Budget Mismatch / Unqualified" className="bg-gray-900 text-white">Budget Mismatch</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="call-notes">Key Discussion Points & Next Steps</Label>
                <Textarea
                  id="call-notes"
                  rows={3}
                  value={callNotes}
                  onChange={(e) => setCallNotes(e.target.value)}
                  placeholder="Client wants custom product filtering and Dawn theme overhaul. Budget approved around $4k..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-white/10 pt-4">
                <Button variant="ghost" size="sm" onClick={() => setIsCallModalOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" type="submit" loading={loggingInteraction}>
                  Save to Timeline
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Follow-up Modal */}
      {isFollowUpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[var(--a-surface)] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                  <AlarmClock className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Schedule Follow-up</h3>
                  <p className="text-xs text-[var(--a-text-subtle)]">Set date & reminder note for this prospect</p>
                </div>
              </div>
              <button
                onClick={() => setIsFollowUpModalOpen(false)}
                className="text-[var(--a-text-muted)] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleFollowUp} className="space-y-4">
              <div>
                <Label htmlFor="follow-up-date">Date & Time *</Label>
                <Input
                  id="follow-up-date"
                  type="datetime-local"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  required
                />
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: "Tomorrow 10 AM", offsetDays: 1, hour: 10 },
                  { label: "In 3 Days", offsetDays: 3, hour: 14 },
                  { label: "Next Monday", offsetDays: 7, hour: 11 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + preset.offsetDays);
                      d.setHours(preset.hour, 0, 0, 0);
                      // Format to YYYY-MM-DDTHH:MM
                      const pad = (n: number) => String(n).padStart(2, "0");
                      const formatted = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
                      setFollowUpDate(formatted);
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-gray-300 hover:text-white border border-white/5 transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <div>
                <Label htmlFor="follow-up-notes">Follow-up Goal / Reminder Note</Label>
                <Textarea
                  id="follow-up-notes"
                  rows={3}
                  value={followUpNotes}
                  onChange={(e) => setFollowUpNotes(e.target.value)}
                  placeholder="e.g. Check if store owner reviewed Loom video proposal..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-white/10 pt-4">
                <Button variant="ghost" size="sm" onClick={() => setIsFollowUpModalOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" type="submit" loading={schedulingFollowUp}>
                  Confirm Follow-up
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Email Outreach Composer Modal */}
      <EmailModal
        open={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        lead={lead}
        onEmailSent={reloadActivities}
      />
    </div>
  );
}
