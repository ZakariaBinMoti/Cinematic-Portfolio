"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Check, Briefcase, Calendar, MapPin, Building2, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { Button, Input, Textarea, Label, Kbd } from "../../_ui";
import { addExperience, updateExperience } from "./actions";

interface ExperienceDrawerProps {
  open: boolean;
  onClose: () => void;
  experience: any | null;
  onSaved: (exp: any, isNew: boolean) => void;
}

export default function ExperienceDrawer({
  open,
  onClose,
  experience,
  onSaved,
}: ExperienceDrawerProps) {
  const isEditing = Boolean(experience?._id);

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("Present");
  const [isCurrent, setIsCurrent] = useState(true);
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (experience) {
      setTitle(experience.title || "");
      setCompany(experience.company || "");
      setLocation(experience.location || "");
      setStartDate(experience.startDate || "");
      const end = experience.endDate || "Present";
      setEndDate(end);
      setIsCurrent(end.toLowerCase() === "present");
      setDescription(experience.description || "");
    } else {
      setTitle("");
      setCompany("");
      setLocation("");
      setStartDate("");
      setEndDate("Present");
      setIsCurrent(true);
      setDescription("");
    }
  }, [experience, open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, title, company, location, startDate, endDate, isCurrent, description]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim() || !company.trim()) {
      toast.error("Role title and company are required");
      return;
    }

    setSaving(true);
    const toastId = toast.loading(isEditing ? "Updating role..." : "Adding role...");

    try {
      const formData = new FormData();
      formData.set("title", title);
      formData.set("company", company);
      formData.set("location", location);
      formData.set("startDate", startDate);
      formData.set("endDate", isCurrent ? "Present" : endDate);
      formData.set("description", description);

      if (isEditing) {
        const res = await updateExperience(experience._id, formData);
        if (res.success) {
          toast.success("Role updated successfully", { id: toastId });
          onSaved(res.experience, false);
          onClose();
        } else {
          toast.error("Failed to update role", { id: toastId });
        }
      } else {
        const res = await addExperience(formData);
        if (res.success) {
          toast.success("New role added to timeline", { id: toastId });
          onSaved(res.experience, true);
          onClose();
        } else {
          toast.error("Failed to add role", { id: toastId });
        }
      }
    } catch (err: any) {
      toast.error(err?.message || "An error occurred", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="relative z-10 w-full max-w-xl bg-[#0e0e14] border-l border-white/10 shadow-2xl flex flex-col h-full overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.01]">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {isEditing ? "Edit Experience" : "Add Career Milestone"}
                </h2>
                <p className="text-xs text-[var(--a-text-muted)] mt-0.5">
                  Chronicle your engineering leadership and professional trajectory
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form id="exp-drawer-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <Label htmlFor="exp-title">Role / Position Title *</Label>
                <Input
                  id="exp-title"
                  placeholder="e.g. Lead Shopify Architect"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="exp-company">Company / Agency *</Label>
                  <Input
                    id="exp-company"
                    placeholder="e.g. SM Technology"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="exp-loc">Location</Label>
                  <Input
                    id="exp-loc"
                    placeholder="e.g. Dhaka, Bangladesh · Remote"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-white flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-violet-400" /> Employment Dates
                  </span>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isCurrent}
                      onChange={(e) => {
                        setIsCurrent(e.target.checked);
                        if (e.target.checked) setEndDate("Present");
                      }}
                      className="rounded border-white/20 bg-black/40 text-violet-500 focus:ring-violet-400"
                    />
                    <span className="text-xs text-gray-300">I currently work here</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="exp-start">Start Date *</Label>
                    <Input
                      id="exp-start"
                      placeholder="e.g. May 2023"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="exp-end">End Date</Label>
                    <Input
                      id="exp-end"
                      placeholder="e.g. Dec 2024"
                      value={endDate}
                      disabled={isCurrent}
                      onChange={(e) => setEndDate(e.target.value)}
                      className={isCurrent ? "opacity-60 cursor-not-allowed" : ""}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="exp-desc">Key Contributions & Highlights</Label>
                <Textarea
                  id="exp-desc"
                  rows={6}
                  placeholder="• Spearheaded Shopify Plus theme development for international brands&#10;• Reduced Largest Contentful Paint (LCP) by 45%&#10;• Mentored a team of 4 frontend engineers"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
            </form>

            {/* Footer */}
            <div className="p-5 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
              <div className="text-xs text-[var(--a-text-subtle)] hidden sm:flex items-center gap-1">
                <Kbd>Ctrl</Kbd>
                <Kbd>Enter</Kbd> to save
              </div>

              <div className="flex items-center gap-2.5 ml-auto">
                <Button variant="ghost" size="sm" onClick={onClose} disabled={saving}>
                  Cancel
                </Button>
                <Button form="exp-drawer-form" type="submit" size="sm" loading={saving} className="gap-1.5">
                  <Check className="h-4 w-4" /> {isEditing ? "Save Changes" : "Add Role"}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
