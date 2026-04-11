"use client";

import { useState } from "react";
import { updateSkill, deleteSkill, reorderSkill } from "./actions";

export default function SkillList({ skills }: { skills: any[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleUpdate = async (id: string, formData: FormData) => {
    setLoadingId(id);
    await updateSkill(id, formData);
    setEditingId(null);
    setLoadingId(null);
    showSuccess("Skills updated");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this skill category?")) return;
    setLoadingId(id);
    await deleteSkill(id);
    setLoadingId(null);
    showSuccess("Skill category deleted");
  };

  const handleReorder = async (id: string, dir: "up" | "down") => {
    setLoadingId(id);
    await reorderSkill(id, dir);
    setLoadingId(null);
  };

  return (
    <div>
      {success && <div className="bg-green-500/20 border border-green-500/40 text-green-300 text-sm px-4 py-2 rounded-lg mb-4">{success}</div>}
      <div className="space-y-4">
        {skills.map((skillGroup: any, idx: number) => (
          <div key={skillGroup._id} className={`bg-white/5 border border-white/10 p-4 rounded-lg transition-opacity ${loadingId === skillGroup._id ? "opacity-50 pointer-events-none" : ""}`}>
            {editingId === skillGroup._id ? (
              <form action={(fd) => handleUpdate(skillGroup._id, fd)} className="space-y-3">
                <input type="text" name="category" defaultValue={skillGroup.category} required className="w-full bg-black/30 border border-white/10 rounded p-2 text-white text-sm" placeholder="Category name" />
                <textarea name="items" defaultValue={skillGroup.items.join(", ")} required rows={3} className="w-full bg-black/30 border border-white/10 rounded p-2 text-white text-sm" placeholder="Skill 1, Skill 2, ..." />
                <div className="flex gap-2">
                  <button type="submit" className="bg-white text-black text-sm font-semibold px-4 py-1.5 rounded hover:bg-gray-200 transition-colors">
                    {loadingId === skillGroup._id ? "Saving..." : "Save"}
                  </button>
                  <button type="button" onClick={() => setEditingId(null)} className="text-gray-400 hover:text-white text-sm px-4 py-1.5 border border-white/10 rounded transition-colors">Cancel</button>
                </div>
              </form>
            ) : (
              <div className="flex items-start justify-between">
                <div className="flex gap-4 flex-1 min-w-0">
                  <div className="flex flex-col gap-1 pt-1">
                    <button onClick={() => handleReorder(skillGroup._id, "up")} disabled={idx === 0} className="text-gray-500 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                    </button>
                    <button onClick={() => handleReorder(skillGroup._id, "down")} disabled={idx === skills.length - 1} className="text-gray-500 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">{skillGroup.category}</h3>
                    <div className="flex flex-wrap gap-2">
                      {skillGroup.items.map((item: string) => (
                        <span key={item} className="text-xs bg-white/10 px-2 py-1 rounded-full">{item}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 ml-4 flex-shrink-0">
                  <button onClick={() => setEditingId(skillGroup._id)} className="text-blue-400 hover:text-blue-300 text-sm border border-blue-500/30 px-3 py-1 rounded transition-colors">Edit</button>
                  <button onClick={() => handleDelete(skillGroup._id)} className="text-red-400 hover:text-red-300 text-sm border border-red-500/30 px-3 py-1 rounded transition-colors">
                    {loadingId === skillGroup._id ? "..." : "Delete"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {skills.length === 0 && <p className="text-gray-500">No skills found.</p>}
      </div>
    </div>
  );
}
