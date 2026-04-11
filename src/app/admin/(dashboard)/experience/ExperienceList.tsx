"use client";

import { useState } from "react";
import { updateExperience, deleteExperience, reorderExperience } from "./actions";

export default function ExperienceList({ experiences }: { experiences: any[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleUpdate = async (id: string, formData: FormData) => {
    setLoadingId(id);
    await updateExperience(id, formData);
    setEditingId(null);
    setLoadingId(null);
    showSuccess("Experience updated");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this experience entry?")) return;
    setLoadingId(id);
    await deleteExperience(id);
    setLoadingId(null);
    showSuccess("Experience deleted");
  };

  const handleReorder = async (id: string, dir: "up" | "down") => {
    setLoadingId(id);
    await reorderExperience(id, dir);
    setLoadingId(null);
  };

  return (
    <div>
      {success && <div className="bg-green-500/20 border border-green-500/40 text-green-300 text-sm px-4 py-2 rounded-lg mb-4">{success}</div>}
      <div className="space-y-4">
        {experiences.map((exp: any, idx: number) => (
          <div key={exp._id} className={`bg-white/5 border border-white/10 p-4 rounded-lg transition-opacity ${loadingId === exp._id ? "opacity-50 pointer-events-none" : ""}`}>
            {editingId === exp._id ? (
              <form action={(fd) => handleUpdate(exp._id, fd)} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" name="title" defaultValue={exp.title} required placeholder="Role" className="bg-black/30 border border-white/10 rounded p-2 text-white text-sm" />
                  <input type="text" name="company" defaultValue={exp.company} required placeholder="Company" className="bg-black/30 border border-white/10 rounded p-2 text-white text-sm" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <input type="text" name="startDate" defaultValue={exp.startDate} required placeholder="Start" className="bg-black/30 border border-white/10 rounded p-2 text-white text-sm" />
                  <input type="text" name="endDate" defaultValue={exp.endDate} required placeholder="End" className="bg-black/30 border border-white/10 rounded p-2 text-white text-sm" />
                  <input type="text" name="location" defaultValue={exp.location} placeholder="Location" className="bg-black/30 border border-white/10 rounded p-2 text-white text-sm" />
                </div>
                <textarea name="description" defaultValue={exp.description} required rows={3} className="w-full bg-black/30 border border-white/10 rounded p-2 text-white text-sm" />
                <div className="flex gap-2">
                  <button type="submit" className="bg-white text-black text-sm font-semibold px-4 py-1.5 rounded hover:bg-gray-200 transition-colors">
                    {loadingId === exp._id ? "Saving..." : "Save"}
                  </button>
                  <button type="button" onClick={() => setEditingId(null)} className="text-gray-400 hover:text-white text-sm px-4 py-1.5 border border-white/10 rounded transition-colors">Cancel</button>
                </div>
              </form>
            ) : (
              <div className="flex items-start justify-between">
                <div className="flex gap-4 flex-1 min-w-0">
                  <div className="flex flex-col gap-1 pt-1">
                    <button onClick={() => handleReorder(exp._id, "up")} disabled={idx === 0} className="text-gray-500 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                    </button>
                    <button onClick={() => handleReorder(exp._id, "down")} disabled={idx === experiences.length - 1} className="text-gray-500 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-lg">{exp.title}</h3>
                    <div className="text-sm text-gray-400 mt-1 mb-2">
                      {exp.company} &bull; {exp.location} <br/>
                      <span className="text-gray-500">{exp.startDate} - {exp.endDate}</span>
                    </div>
                    <p className="text-sm text-gray-300 line-clamp-3">{exp.description}</p>
                  </div>
                </div>
                <div className="flex gap-2 ml-4 flex-shrink-0">
                  <button onClick={() => setEditingId(exp._id)} className="text-blue-400 hover:text-blue-300 text-sm border border-blue-500/30 px-3 py-1 rounded transition-colors">Edit</button>
                  <button onClick={() => handleDelete(exp._id)} className="text-red-400 hover:text-red-300 text-sm border border-red-500/30 px-3 py-1 rounded transition-colors">
                    {loadingId === exp._id ? "..." : "Delete"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {experiences.length === 0 && <p className="text-gray-500">No experience records found.</p>}
      </div>
    </div>
  );
}
