"use client";

import { useState } from "react";
import Image from "next/image";
import { updateProject, deleteProject, reorderProject } from "./actions";

export default function ProjectList({ projects }: { projects: any[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleUpdate = async (id: string, formData: FormData) => {
    setLoadingId(id);
    await updateProject(id, formData);
    setEditingId(null);
    setLoadingId(null);
    showSuccess("Project updated");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this project? The image will also be removed from Cloudinary.")) return;
    setLoadingId(id);
    await deleteProject(id);
    setLoadingId(null);
    showSuccess("Project deleted");
  };

  const handleReorder = async (id: string, dir: "up" | "down") => {
    setLoadingId(id);
    await reorderProject(id, dir);
    setLoadingId(null);
  };

  return (
    <div>
      {success && <div className="bg-green-500/20 border border-green-500/40 text-green-300 text-sm px-4 py-2 rounded-lg mb-4">{success}</div>}
      <div className="space-y-4">
        {projects.map((project: any, idx: number) => (
          <div key={project._id} className={`bg-white/5 border border-white/10 p-4 rounded-lg transition-opacity ${loadingId === project._id ? "opacity-50 pointer-events-none" : ""}`}>
            {editingId === project._id ? (
              /* ── Edit Mode ── */
              <form action={(fd) => handleUpdate(project._id, fd)} className="space-y-3">
                <input type="text" name="title" defaultValue={project.title} required className="w-full bg-black/30 border border-white/10 rounded p-2 text-white text-sm" />
                <textarea name="description" defaultValue={project.description} required rows={2} className="w-full bg-black/30 border border-white/10 rounded p-2 text-white text-sm" />
                <input type="text" name="techStack" defaultValue={project.techStack.join(", ")} className="w-full bg-black/30 border border-white/10 rounded p-2 text-white text-sm" />
                <input type="url" name="liveLink" defaultValue={project.liveLink} className="w-full bg-black/30 border border-white/10 rounded p-2 text-white text-sm" />
                <div>
                  <label className="text-xs text-gray-500">Replace image (optional)</label>
                  <input type="file" name="image" accept="image/*" className="w-full text-xs text-gray-400 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:bg-white/10 file:text-white" />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="bg-white text-black text-sm font-semibold px-4 py-1.5 rounded hover:bg-gray-200 transition-colors">
                    {loadingId === project._id ? "Saving..." : "Save"}
                  </button>
                  <button type="button" onClick={() => setEditingId(null)} className="text-gray-400 hover:text-white text-sm px-4 py-1.5 border border-white/10 rounded transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              /* ── View Mode ── */
              <div className="flex items-start justify-between">
                <div className="flex gap-4 flex-1 min-w-0">
                  {/* Reorder Arrows */}
                  <div className="flex flex-col gap-1 pt-1">
                    <button onClick={() => handleReorder(project._id, "up")} disabled={idx === 0} className="text-gray-500 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors" title="Move up">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                    </button>
                    <button onClick={() => handleReorder(project._id, "down")} disabled={idx === projects.length - 1} className="text-gray-500 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors" title="Move down">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                  </div>

                  {project.imageUrl && (
                    <div className="w-16 h-16 relative flex-shrink-0">
                      <Image src={project.imageUrl} alt={project.title} fill className="rounded object-cover" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-bold text-lg truncate">{project.title}</h3>
                    <p className="text-sm text-gray-400 mt-1 line-clamp-2">{project.description}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {project.techStack.map((tech: string) => (
                        <span key={tech} className="text-xs bg-white/10 px-2 py-0.5 rounded">{tech}</span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4 flex-shrink-0">
                  <button onClick={() => setEditingId(project._id)} className="text-blue-400 hover:text-blue-300 text-sm border border-blue-500/30 px-3 py-1 rounded transition-colors">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(project._id)} className="text-red-400 hover:text-red-300 text-sm border border-red-500/30 px-3 py-1 rounded transition-colors">
                    {loadingId === project._id ? "..." : "Delete"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {projects.length === 0 && <p className="text-gray-500">No projects found.</p>}
      </div>
    </div>
  );
}
