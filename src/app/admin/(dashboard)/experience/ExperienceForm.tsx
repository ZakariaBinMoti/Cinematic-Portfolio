"use client";

import { useRef, useState } from "react";
import { addExperience } from "./actions";

export default function ExperienceForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setSuccess(false);
    await addExperience(formData);
    formRef.current?.reset();
    setLoading(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <form ref={formRef} action={handleSubmit} className="bg-white/[0.02] border border-white/10 p-6 rounded-xl space-y-4">
      {success && <div className="bg-green-500/20 border border-green-500/40 text-green-300 text-sm px-4 py-2 rounded-lg">Experience added successfully!</div>}
      <div>
        <label className="block text-sm text-gray-400 mb-1">Title (Role)</label>
        <input type="text" name="title" required className="w-full bg-black/20 border border-white/10 rounded p-2 text-white focus:outline-none focus:border-white/30" />
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1">Company</label>
        <input type="text" name="company" required className="w-full bg-black/20 border border-white/10 rounded p-2 text-white focus:outline-none focus:border-white/30" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Start Date</label>
          <input type="text" name="startDate" placeholder="Oct 2025" required className="w-full bg-black/20 border border-white/10 rounded p-2 text-white focus:outline-none focus:border-white/30" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">End Date</label>
          <input type="text" name="endDate" placeholder="Present" required className="w-full bg-black/20 border border-white/10 rounded p-2 text-white focus:outline-none focus:border-white/30" />
        </div>
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1">Location</label>
        <input type="text" name="location" className="w-full bg-black/20 border border-white/10 rounded p-2 text-white focus:outline-none focus:border-white/30" />
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1">Description</label>
        <textarea name="description" required rows={4} className="w-full bg-black/20 border border-white/10 rounded p-2 text-white focus:outline-none focus:border-white/30" />
      </div>
      <button disabled={loading} type="submit" className="w-full bg-white text-black font-semibold py-2 rounded hover:bg-gray-200 transition-colors disabled:opacity-50">
        {loading ? "Saving..." : "Add Experience"}
      </button>
    </form>
  );
}
