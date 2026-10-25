"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Check,
  Plus,
  Sparkles,
  LoaderCircle,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  ShoppingBag,
  DollarSign,
  Tag as TagIcon,
  Layers,
  Flag,
  FileText,
  User,
  Sliders,
  Copy,
  ExternalLink,
  Send,
  AlertTriangle,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button, Input, Textarea, Label, Kbd } from "../../_ui";
import { SerializedLead, createLead, updateLead } from "./actions";

interface LeadDrawerProps {
  open: boolean;
  onClose: () => void;
  lead: SerializedLead | null;
  onSaved: (lead: SerializedLead, isNew: boolean) => void;
  onDelete?: (lead: SerializedLead) => void;
}

const COMMON_TAGS = [
  "Shopify Plus",
  "High Ticket",
  "Store Redesign",
  "Shopify Migration",
  "Custom Next.js",
  "Quick Close",
  "Warm Intro",
  "Fashion & Apparel",
  "Local Business",
  "Health & Beauty",
  "B2B Wholesale",
  "CRO Overhaul",
];

const BUDGET_PRESETS = [
  "$1,000 - $3,000",
  "$3,000 - $5,000",
  "$5,000 - $10,000",
  "$10,000+",
  "Retainer ($1,500/mo)",
  "Negotiable",
];

const PLATFORM_OPTIONS = [
  "Shopify",
  "WooCommerce / WordPress",
  "Wix",
  "Squarespace",
  "Custom / Next.js",
  "Webflow",
  "Magento",
  "None / Starting Fresh",
  "Other",
];

const PROJECT_TYPE_OPTIONS = [
  { value: "new_shopify_store", label: "New Shopify Store" },
  { value: "shopify_redesign", label: "Shopify Redesign & CRO" },
  { value: "shopify_migration", label: "Shopify Migration (from Woo/Wix)" },
  { value: "custom_website", label: "Custom Website / Next.js" },
  { value: "landing_page", label: "High-Converting Landing Page" },
  { value: "maintenance", label: "Maintenance & Retainer" },
  { value: "consultation", label: "Technical Consultation" },
  { value: "other", label: "Other" },
];

const CHANNEL_OPTIONS = [
  { value: "website", label: "Website AI (Zaki)", icon: "🤖" },
  { value: "linkedin", label: "LinkedIn Outreach", icon: "🔗" },
  { value: "google_maps", label: "Google Maps Prospecting", icon: "🗺️" },
  { value: "referral", label: "Referral / Word of Mouth", icon: "🤝" },
  { value: "cold_outreach", label: "Cold Email / DM", icon: "📧" },
  { value: "direct", label: "Direct Inbound / Contact Form", icon: "📥" },
  { value: "other", label: "Other Channel", icon: "🌐" },
];

export default function LeadDrawer({ open, onClose, lead, onSaved, onDelete }: LeadDrawerProps) {
  const isEditing = Boolean(lead?._id);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("");
  const [storeUrl, setStoreUrl] = useState("");
  const [website, setWebsite] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [currentPlatform, setCurrentPlatform] = useState("");
  const [projectType, setProjectType] = useState("new_shopify_store");
  const [projectBudget, setProjectBudget] = useState("");
  const [estimatedValue, setEstimatedValue] = useState<string>("");
  const [channel, setChannel] = useState("direct");
  const [status, setStatus] = useState<SerializedLead["status"]>("new");
  const [priority, setPriority] = useState<SerializedLead["priority"]>("medium");
  const [leadScore, setLeadScore] = useState<number>(20);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [message, setMessage] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  // Sync state when lead changes or drawer opens
  useEffect(() => {
    if (lead) {
      setName(lead.name || "");
      setEmail(lead.email || "");
      setPhone(lead.phone || "");
      setCompany(lead.company || "");
      setIndustry(lead.industry || "");
      setLocation(lead.location || "");
      setStoreUrl(lead.storeUrl || "");
      setWebsite(lead.website || "");
      setLinkedinUrl(lead.linkedinUrl || "");
      setCurrentPlatform(lead.currentPlatform || "");
      setProjectType(lead.projectType || "new_shopify_store");
      setProjectBudget(lead.projectBudget || "");
      setEstimatedValue(lead.estimatedValue ? String(lead.estimatedValue) : "");
      setChannel(lead.channel || "website");
      setStatus(lead.status || "new");
      setPriority(lead.priority || "medium");
      setLeadScore(lead.leadScore ?? 20);
      setTags(Array.isArray(lead.tags) ? [...lead.tags] : []);
      setMessage(lead.message || "");
      setNotes(lead.notes || "");
    } else {
      setName("");
      setEmail("");
      setPhone("");
      setCompany("");
      setIndustry("");
      setLocation("");
      setStoreUrl("");
      setWebsite("");
      setLinkedinUrl("");
      setCurrentPlatform("Shopify");
      setProjectType("new_shopify_store");
      setProjectBudget("$3,000 - $5,000");
      setEstimatedValue("3500");
      setChannel("direct");
      setStatus("new");
      setPriority("medium");
      setLeadScore(25);
      setTags(["Shopify"]);
      setMessage("");
      setNotes("");
    }
  }, [lead, open]);

  // Handle escape & Ctrl+Enter
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, name, email, phone, company, status, priority, tags, projectBudget, estimatedValue]);

  const handleAddTag = (tagToAdd: string) => {
    const trimmed = tagToAdd.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag(tagInput);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }

    setSaving(true);
    try {
      const payload: Partial<SerializedLead> = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        company: company.trim(),
        industry: industry.trim(),
        location: location.trim(),
        storeUrl: storeUrl.trim(),
        website: website.trim(),
        linkedinUrl: linkedinUrl.trim(),
        currentPlatform: currentPlatform.trim(),
        projectType,
        projectBudget: projectBudget.trim(),
        estimatedValue: estimatedValue ? parseFloat(estimatedValue) : undefined,
        channel,
        status,
        priority,
        leadScore: Number(leadScore) || 0,
        tags,
        message: message.trim(),
        notes: notes.trim(),
      };

      if (isEditing && lead?._id) {
        const res = await updateLead(lead._id, payload);
        if (!res.success || !res.lead) {
          throw new Error(res.error || "Failed to update lead");
        }
        toast.success("Lead profile updated successfully");
        onSaved(res.lead, false);
      } else {
        const res = await createLead(payload);
        if (!res.success || !res.lead) {
          throw new Error(res.error || "Failed to create lead");
        }
        toast.success("New lead created successfully");
        onSaved(res.lead, true);
      }
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong saving the lead");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Slide-out Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="absolute right-0 top-0 bottom-0 w-full max-w-2xl bg-[var(--a-surface)] border-l border-white/10 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/30 flex items-center justify-center text-violet-300">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-[var(--a-text)]">
                    {isEditing ? `Edit Prospect: ${company || name || email}` : "Add New Client Prospect"}
                  </h2>
                  <p className="text-xs text-[var(--a-text-subtle)] mt-0.5">
                    {isEditing
                      ? "Update client details, pipeline status, and commercial scope"
                      : "Record a manual inbound lead, LinkedIn prospect, or outreach target"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="h-9 w-9 rounded-lg hover:bg-white/10 text-[var(--a-text-muted)] hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form
              id="lead-drawer-form"
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto p-6 space-y-7 custom-scrollbar"
            >
              {/* Section 1: Contact & Identity */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-violet-300 border-b border-white/10 pb-2">
                  <User className="h-3.5 w-3.5" />
                  <span>Contact & Company Information</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="lead-name">Contact Person Name</Label>
                    <Input
                      id="lead-name"
                      placeholder="e.g. Sarah Jenkins"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lead-email">Email Address *</Label>
                    <Input
                      id="lead-email"
                      type="email"
                      placeholder="sarah@brandname.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="lead-company">Company / Brand Name</Label>
                    <Input
                      id="lead-company"
                      placeholder="e.g. Lumina Apparel Co."
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lead-phone">Phone / WhatsApp</Label>
                    <Input
                      id="lead-phone"
                      placeholder="+1 (555) 019-2834"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="lead-location">Location (City, Country)</Label>
                    <Input
                      id="lead-location"
                      placeholder="e.g. Austin, TX (USA)"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lead-industry">Industry / Niche</Label>
                    <Input
                      id="lead-industry"
                      placeholder="e.g. Fashion, Luxury Goods, Health"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Online Presence & Current Platform */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-300 border-b border-white/10 pb-2">
                  <Globe className="h-3.5 w-3.5" />
                  <span>Online Presence & Current Stack</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="lead-store-url">Current Store URL</Label>
                    <Input
                      id="lead-store-url"
                      type="url"
                      placeholder="https://brandstore.com"
                      value={storeUrl}
                      onChange={(e) => setStoreUrl(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lead-platform">Current Platform</Label>
                    <select
                      id="lead-platform"
                      value={currentPlatform}
                      onChange={(e) => setCurrentPlatform(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl bg-white/[0.03] border border-[var(--a-border)] text-sm text-[var(--a-text)] outline-none hover:border-[var(--a-border-strong)] focus:border-violet-400/60 focus:bg-white/[0.05]"
                    >
                      <option value="" className="bg-gray-900 text-gray-400">Select current platform...</option>
                      {PLATFORM_OPTIONS.map((opt) => (
                        <option key={opt} value={opt} className="bg-gray-900 text-white">
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="lead-website">Brand / Founder Website</Label>
                    <Input
                      id="lead-website"
                      type="url"
                      placeholder="https://luminabrand.com"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lead-linkedin">LinkedIn / Social Profile</Label>
                    <Input
                      id="lead-linkedin"
                      type="url"
                      placeholder="https://linkedin.com/in/prospect"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Project Scope & Financials */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-300 border-b border-white/10 pb-2">
                  <DollarSign className="h-3.5 w-3.5" />
                  <span>Project Scope & Financials</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="lead-project-type">Project Type</Label>
                    <select
                      id="lead-project-type"
                      value={projectType}
                      onChange={(e) => setProjectType(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl bg-white/[0.03] border border-[var(--a-border)] text-sm text-[var(--a-text)] outline-none hover:border-[var(--a-border-strong)] focus:border-violet-400/60 focus:bg-white/[0.05]"
                    >
                      {PROJECT_TYPE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-gray-900 text-white">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="lead-deal-value">Estimated Deal Value (USD)</Label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[var(--a-text-subtle)]">$</span>
                      <Input
                        id="lead-deal-value"
                        type="number"
                        placeholder="3500"
                        value={estimatedValue}
                        onChange={(e) => setEstimatedValue(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Label htmlFor="lead-budget">Budget Indication</Label>
                    <span className="text-[11px] text-[var(--a-text-subtle)]">Click preset or type</span>
                  </div>
                  <Input
                    id="lead-budget"
                    placeholder="e.g. $3,000 - $5,000 or Retainer"
                    value={projectBudget}
                    onChange={(e) => setProjectBudget(e.target.value)}
                  />
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {BUDGET_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setProjectBudget(preset)}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-gray-300 hover:text-white border border-white/5 transition-colors"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 4: Acquisition Channel & Pipeline Status */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-300 border-b border-white/10 pb-2">
                  <Flag className="h-3.5 w-3.5" />
                  <span>Pipeline & Lead Scoring</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Channel */}
                  <div>
                    <Label htmlFor="lead-channel">Acquisition Channel</Label>
                    <select
                      id="lead-channel"
                      value={channel}
                      onChange={(e) => setChannel(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl bg-white/[0.03] border border-[var(--a-border)] text-sm text-[var(--a-text)] outline-none hover:border-[var(--a-border-strong)] focus:border-violet-400/60 focus:bg-white/[0.05]"
                    >
                      {CHANNEL_OPTIONS.map((ch) => (
                        <option key={ch.value} value={ch.value} className="bg-gray-900 text-white">
                          {ch.icon} {ch.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <Label htmlFor="lead-status">Pipeline Status</Label>
                    <select
                      id="lead-status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as SerializedLead["status"])}
                      className="w-full h-11 px-3.5 rounded-xl bg-white/[0.03] border border-[var(--a-border)] text-sm text-[var(--a-text)] outline-none hover:border-[var(--a-border-strong)] focus:border-violet-400/60 focus:bg-white/[0.05]"
                    >
                      <option value="new" className="bg-gray-900 text-emerald-400">🟢 New Inquiry</option>
                      <option value="contacted" className="bg-gray-900 text-cyan-400">🔵 Contacted</option>
                      <option value="qualified" className="bg-gray-900 text-amber-400">🟡 Qualified</option>
                      <option value="won" className="bg-gray-900 text-emerald-400">🏆 Closed Won</option>
                      <option value="lost" className="bg-gray-900 text-rose-400">❌ Closed Lost</option>
                      <option value="archived" className="bg-gray-900 text-gray-400">⚪ Archived</option>
                    </select>
                  </div>

                  {/* Priority */}
                  <div>
                    <Label htmlFor="lead-priority">Priority Level</Label>
                    <select
                      id="lead-priority"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as SerializedLead["priority"])}
                      className="w-full h-11 px-3.5 rounded-xl bg-white/[0.03] border border-[var(--a-border)] text-sm text-[var(--a-text)] outline-none hover:border-[var(--a-border-strong)] focus:border-violet-400/60 focus:bg-white/[0.05]"
                    >
                      <option value="urgent" className="bg-gray-900 text-red-400">🔴 Urgent (24h)</option>
                      <option value="high" className="bg-gray-900 text-orange-400">🟠 High Priority</option>
                      <option value="medium" className="bg-gray-900 text-amber-400">🟡 Medium</option>
                      <option value="low" className="bg-gray-900 text-emerald-400">🟢 Low Priority</option>
                    </select>
                  </div>
                </div>

                {/* Lead Score Slider */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Label htmlFor="lead-score" className="mb-0">
                      Lead Score Quality Rating
                    </Label>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-white/10 text-violet-300">
                      {leadScore} / 100
                    </span>
                  </div>
                  <input
                    id="lead-score"
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={leadScore}
                    onChange={(e) => setLeadScore(Number(e.target.value))}
                    className="w-full accent-violet-500 bg-white/10 h-1.5 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[var(--a-text-subtle)] mt-1">
                    <span>Cold (0)</span>
                    <span>Warm (50)</span>
                    <span>Ready to Close (100)</span>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <Label>Classification Tags</Label>
                  <div className="p-2.5 rounded-xl border border-white/10 bg-white/[0.02] focus-within:border-violet-500/50 transition-colors">
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-500/15 border border-violet-500/25 text-xs font-medium text-violet-200"
                        >
                          <TagIcon className="h-3 w-3 opacity-70" />
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="text-violet-300 hover:text-white ml-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>

                    <input
                      type="text"
                      placeholder={tags.length === 0 ? "Type tag and press Enter (e.g. Shopify Plus)..." : "Add another tag..."}
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagInputKeyDown}
                      className="w-full bg-transparent text-sm text-white placeholder:text-[var(--a-text-subtle)] outline-none px-1 py-0.5"
                    />
                  </div>

                  {/* Suggestions */}
                  <div className="mt-2.5">
                    <p className="text-[11px] text-[var(--a-text-subtle)] mb-1.5 flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-violet-400" /> Quick add tags:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {COMMON_TAGS.filter((t) => !tags.includes(t)).slice(0, 8).map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => handleAddTag(suggestion)}
                          className="text-[11px] px-2 py-0.5 rounded-md bg-white/[0.03] hover:bg-white/[0.08] text-gray-400 hover:text-white border border-white/5 transition-colors flex items-center gap-1"
                        >
                          <Plus className="h-2.5 w-2.5" /> {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 5: Inquiry & Notes */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-violet-300 border-b border-white/10 pb-2">
                  <FileText className="h-3.5 w-3.5" />
                  <span>Prospect Message & Admin Strategy</span>
                </div>

                <div>
                  <Label htmlFor="lead-message">Prospect Message / Problem Statement</Label>
                  <Textarea
                    id="lead-message"
                    rows={3}
                    placeholder="Details about what the client needs, pain points, store requirements..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="lead-notes">Internal Admin Notes & Next Steps</Label>
                  <Textarea
                    id="lead-notes"
                    rows={3}
                    placeholder="e.g. Sent personalized Loom video, waiting on response for Monday call..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                {/* AI Discovery & Outreach Strategy (If Generated by Phase 6 AI Lead Radar) */}
                {lead?.metadata?.pitchEmailBody && (
                  <div className="mt-6 rounded-2xl border border-violet-500/30 bg-gradient-to-b from-violet-950/20 via-black/40 to-black/60 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-violet-400" />
                        <span className="text-xs font-bold uppercase tracking-wider text-violet-300">
                          AI Outreach Kit & Diagnosed Pain Points
                        </span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-medium">
                        Autonomous Radar
                      </span>
                    </div>

                    {/* Diagnosed Pain Points */}
                    {Array.isArray(lead.metadata.painPoints) && lead.metadata.painPoints.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[11px] font-semibold text-rose-300 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" /> Diagnosed Bottlenecks:
                        </span>
                        <ul className="text-xs text-rose-200/90 list-disc list-inside space-y-0.5 pl-1">
                          {lead.metadata.painPoints.map((pt: string, idx: number) => (
                            <li key={idx}>{pt}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Proposed Solution */}
                    {lead.metadata.proposedSolution && (
                      <div className="text-xs text-[var(--a-text)] bg-white/[0.03] p-2.5 rounded-xl border border-white/5">
                        <span className="font-semibold text-cyan-300 block mb-0.5">Proposed High-Impact Architecture:</span>
                        {lead.metadata.proposedSolution}
                      </div>
                    )}

                    {/* Email Pitch Preview */}
                    <div className="rounded-xl border border-white/10 bg-black/40 p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white">
                          Subject: {lead.metadata.pitchEmailSubject || "Transforming your online store"}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(lead.metadata?.pitchEmailBody || "");
                            toast.success("AI Email Pitch copied to clipboard!");
                          }}
                          className="text-[11px] font-medium text-violet-300 hover:text-white flex items-center gap-1 bg-violet-500/10 px-2 py-1 rounded-md"
                        >
                          <Copy className="h-3 w-3" /> Copy Email
                        </button>
                      </div>
                      <pre className="text-xs text-gray-300 whitespace-pre-wrap font-sans max-h-36 overflow-y-auto leading-relaxed border-t border-white/5 pt-2">
                        {lead.metadata.pitchEmailBody}
                      </pre>
                      <div className="pt-2 flex justify-end">
                        <a
                          href={`mailto:${lead.email}?subject=${encodeURIComponent(lead.metadata.pitchEmailSubject || "Quick question regarding your online store")}&body=${encodeURIComponent(lead.metadata.pitchEmailBody || "")}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium transition-colors"
                        >
                          <Send className="h-3 w-3" /> Open in Mail Client
                        </a>
                      </div>
                    </div>

                    {/* LinkedIn / IG DM Pitch */}
                    {lead.metadata.pitchDmMessage && (
                      <div className="rounded-xl border border-white/10 bg-black/40 p-3 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-cyan-300">
                            LinkedIn / Instagram DM Pitch
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(lead.metadata?.pitchDmMessage || "");
                              toast.success("AI DM copied to clipboard!");
                            }}
                            className="text-[11px] font-medium text-cyan-300 hover:text-white flex items-center gap-1 bg-cyan-500/10 px-2 py-1 rounded-md"
                          >
                            <Copy className="h-3 w-3" /> Copy DM
                          </button>
                        </div>
                        <p className="text-xs text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
                          {lead.metadata.pitchDmMessage}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </form>

            {/* Footer with Actions */}
            <div className="p-5 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isEditing && lead && onDelete && (
                  <button
                    type="button"
                    onClick={() => {
                      onDelete(lead);
                      onClose();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete Lead</span>
                  </button>
                )}
                <div className="text-xs text-[var(--a-text-subtle)] hidden sm:flex items-center gap-1">
                  <Kbd>Ctrl</Kbd>
                  <Kbd>Enter</Kbd> to save
                </div>
              </div>

              <div className="flex items-center gap-2.5 ml-auto">
                <Button variant="ghost" size="sm" onClick={onClose} disabled={saving}>
                  Cancel
                </Button>
                <Button
                  form="lead-drawer-form"
                  type="submit"
                  size="sm"
                  loading={saving}
                  className="gap-1.5 shadow-lg"
                >
                  {saving ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" /> {isEditing ? "Save Lead Profile" : "Create Lead"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
