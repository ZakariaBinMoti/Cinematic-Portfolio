"use client";

import { useRef, useState } from "react";
import { addSkill } from "./actions";

export default function SkillForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setSuccess(false);
    await addSkill(formData);
    formRef.current?.reset();
    setLoading(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <form ref={formRef} action={handleSubmit} className="bg-white/[0.02] border border-white/10 p-6 rounded-xl space-y-4">
      {success && <div className="bg-green-500/20 border border-green-500/40 text-green-300 text-sm px-4 py-2 rounded-lg">Skill category added!</div>}
      <div>
        <label className="block text-sm text-gray-400 mb-1">Category (e.g. Frontend)</label>
        <input type="text" name="category" required className="w-full bg-black/20 border border-white/10 rounded p-2 text-white focus:outline-none focus:border-white/30" />
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1">Skills (comma separated)</label>
        <textarea name="items" required rows={3} placeholder="React, Next.js, Tailwind..." className="w-full bg-black/20 border border-white/10 rounded p-2 text-white focus:outline-none focus:border-white/30" />
      </div>
      <button disabled={loading} type="submit" className="w-full bg-white text-black font-semibold py-2 rounded hover:bg-gray-200 transition-colors disabled:opacity-50">
        {loading ? "Saving..." : "Add Skill Category"}
      </button>
    </form>
  );
}
