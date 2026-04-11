"use client";

import { useRef, useState } from "react";
import { addProject } from "./actions";

export default function ProjectForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setSuccess(false);
    await addProject(formData);
    formRef.current?.reset();
    setLoading(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <form ref={formRef} action={handleSubmit} className="bg-white/[0.02] border border-white/10 p-6 rounded-xl space-y-4">
      {success && <div className="bg-green-500/20 border border-green-500/40 text-green-300 text-sm px-4 py-2 rounded-lg">Project added successfully!</div>}
      <div>
        <label className="block text-sm text-gray-400 mb-1">Title</label>
        <input type="text" name="title" required className="w-full bg-black/20 border border-white/10 rounded p-2 text-white focus:outline-none focus:border-white/30" />
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1">Description</label>
        <textarea name="description" required rows={3} className="w-full bg-black/20 border border-white/10 rounded p-2 text-white focus:outline-none focus:border-white/30" />
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1">Tech Stack (comma separated)</label>
        <input type="text" name="techStack" className="w-full bg-black/20 border border-white/10 rounded p-2 text-white focus:outline-none focus:border-white/30" />
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1">Live URL</label>
        <input type="url" name="liveLink" className="w-full bg-black/20 border border-white/10 rounded p-2 text-white focus:outline-none focus:border-white/30" />
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1">Project Image</label>
        <input type="file" name="image" accept="image/*" className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-white/10 file:text-white hover:file:bg-white/20 transition-colors cursor-pointer" />
      </div>
      <button disabled={loading} type="submit" className="w-full bg-white text-black font-semibold py-2 rounded hover:bg-gray-200 transition-colors disabled:opacity-50">
        {loading ? "Saving..." : "Add Project"}
      </button>
    </form>
  );
}
