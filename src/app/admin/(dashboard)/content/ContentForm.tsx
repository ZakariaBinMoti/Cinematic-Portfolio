"use client";

import { useState } from "react";
import { updateContent } from "./actions";

export default function ContentForm({ section, title, fields, initialData }: {
  section: string;
  title: string;
  fields: { name: string; label: string; rows?: number }[];
  initialData: any;
}) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setSuccess(false);
    await updateContent(section, formData);
    setLoading(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <section className="bg-white/5 border border-white/10 p-8 rounded-xl">
      <h2 className="text-xl font-semibold mb-6">{title}</h2>
      {success && <div className="bg-green-500/20 border border-green-500/40 text-green-300 text-sm px-4 py-2 rounded-lg mb-4">{title} saved successfully!</div>}
      <form action={handleSubmit} className="space-y-4">
        {fields.map((field) => (
          <div key={field.name}>
            <label className="block text-sm text-gray-400 mb-1">{field.label}</label>
            {(field.rows || 1) > 1 ? (
              <textarea name={field.name} defaultValue={initialData?.[field.name] || ""} required rows={field.rows} className="w-full bg-black/20 border border-white/10 rounded p-2 text-white focus:outline-none focus:border-white/30" />
            ) : (
              <input type="text" name={field.name} defaultValue={initialData?.[field.name] || ""} required className="w-full bg-black/20 border border-white/10 rounded p-2 text-white focus:outline-none focus:border-white/30" />
            )}
          </div>
        ))}
        <button disabled={loading} type="submit" className="bg-white text-black font-semibold py-2 px-6 rounded hover:bg-gray-200 transition-colors disabled:opacity-50">
          {loading ? "Saving..." : `Save ${title}`}
        </button>
      </form>
    </section>
  );
}
