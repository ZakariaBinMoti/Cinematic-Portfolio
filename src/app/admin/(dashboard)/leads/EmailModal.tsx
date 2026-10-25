"use client";

import { useState } from "react";
import {
  X,
  Mail,
  Send,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { Button, Input, Textarea, Label } from "../../_ui";
import { CRM_TEMPLATES, CRMTemplate, fillTemplateVariables } from "@/lib/crm-templates";
import { SerializedLead, logActivity } from "./actions";

interface EmailModalProps {
  open: boolean;
  onClose: () => void;
  lead: SerializedLead;
  onEmailSent?: () => void;
}

export default function EmailModal({
  open,
  onClose,
  lead,
  onEmailSent,
}: EmailModalProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("initial_response");

  const initialFilled = fillTemplateVariables(
    CRM_TEMPLATES[0],
    lead
  );

  const [subject, setSubject] = useState(initialFilled.subject);
  const [body, setBody] = useState(initialFilled.body);
  const [copied, setCopied] = useState(false);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const tmpl = CRM_TEMPLATES.find((t) => t.id === templateId);
    if (tmpl) {
      const filled = fillTemplateVariables(tmpl, lead);
      setSubject(filled.subject);
      setBody(filled.body);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
    setCopied(true);
    toast.success("Email copied to clipboard (ready for LinkedIn or Gmail)");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenEmailClient = async () => {
    // Generate mailto link
    const mailtoUrl = `mailto:${lead.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Log activity
    try {
      await logActivity(lead._id, {
        type: "email_sent",
        description: `Outreach email prepared: "${subject}"`,
      });
      toast.success("Activity logged & opening email client");
      if (onEmailSent) onEmailSent();
    } catch {
      // Non-blocking
    }

    window.open(mailtoUrl, "_blank");
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[var(--a-surface)] p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-violet-500/20 text-violet-300 flex items-center justify-center border border-violet-500/30">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                Outreach & Email Composer
              </h3>
              <p className="text-xs text-[var(--a-text-subtle)]">
                To: <span className="text-cyan-300 font-mono">{lead.email}</span> ({lead.company || lead.name})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--a-text-muted)] hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
          {/* Template Selector Pills */}
          <div>
            <Label className="flex items-center gap-1.5 text-xs">
              <Sparkles className="h-3.5 w-3.5 text-violet-400" />
              Choose Pre-Built Template:
            </Label>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {CRM_TEMPLATES.map((tmpl) => {
                const isSelected = selectedTemplateId === tmpl.id;
                return (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => handleTemplateSelect(tmpl.id)}
                    className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                      isSelected
                        ? "bg-violet-500/20 text-violet-200 border-violet-500/40 shadow-sm"
                        : "bg-white/[0.03] text-gray-300 border-white/5 hover:bg-white/[0.06] hover:text-white"
                    }`}
                  >
                    {tmpl.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subject Line */}
          <div>
            <Label htmlFor="email-subject">Subject Line</Label>
            <Input
              id="email-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject..."
            />
          </div>

          {/* Body */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label htmlFor="email-body">Email Body (Variables Pre-Filled)</Label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-[11px] text-violet-300 hover:text-white flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied!" : "Copy for LinkedIn / DM"}
              </button>
            </div>
            <Textarea
              id="email-body"
              rows={11}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="font-sans text-xs leading-relaxed"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-4">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopy}
              className="gap-1.5 text-xs"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              Copy Text
            </Button>
            <Button
              size="sm"
              onClick={handleOpenEmailClient}
              className="gap-1.5 text-xs font-semibold shadow-lg shadow-violet-500/20"
            >
              <Send className="h-3.5 w-3.5" />
              Open in Gmail / Mail App
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
