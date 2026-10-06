"use server";

import dbConnect from "@/lib/mongodb";
import { requireAdmin } from "@/lib/admin-auth";
import Experience from "@/models/Experience";
import { revalidatePath } from "next/cache";

export async function getExperiences() {
  await requireAdmin();
  await dbConnect();
  const exp = await Experience.find({}).sort({ order: 1 }).lean();
  return JSON.parse(JSON.stringify(exp));
}

export async function addExperience(formData: FormData) {
  await requireAdmin();
  await dbConnect();

  const title = (formData.get("title") as string)?.trim();
  const company = (formData.get("company") as string)?.trim();
  const location = (formData.get("location") as string)?.trim() || "";
  const startDate = (formData.get("startDate") as string)?.trim();
  const endDate = (formData.get("endDate") as string)?.trim() || "Present";
  const description = (formData.get("description") as string)?.trim();

  if (!title || !company || !startDate) {
    throw new Error("Title, company, and start date are required");
  }

  const lastExp = await Experience.findOne({}).sort({ order: -1 }).lean();
  const order = lastExp ? (lastExp as any).order + 1 : 0;

  const created = await Experience.create({
    title,
    company,
    location,
    startDate,
    endDate,
    description,
    order,
  });

  revalidatePath("/admin/experience");
  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true, experience: JSON.parse(JSON.stringify(created)) };
}

export async function updateExperience(id: string, formData: FormData) {
  await requireAdmin();
  await dbConnect();

  const title = (formData.get("title") as string)?.trim();
  const company = (formData.get("company") as string)?.trim();
  const location = (formData.get("location") as string)?.trim() || "";
  const startDate = (formData.get("startDate") as string)?.trim();
  const endDate = (formData.get("endDate") as string)?.trim() || "Present";
  const description = (formData.get("description") as string)?.trim();

  const updated = await Experience.findByIdAndUpdate(
    id,
    { title, company, location, startDate, endDate, description },
    { new: true }
  );

  revalidatePath("/admin/experience");
  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true, experience: JSON.parse(JSON.stringify(updated)) };
}

export async function deleteExperience(id: string) {
  await requireAdmin();
  await dbConnect();
  const exp = await Experience.findById(id);
  if (!exp) return { success: false, error: "Not found" };

  const backup = JSON.parse(JSON.stringify(exp));
  await Experience.findByIdAndDelete(id);

  revalidatePath("/admin/experience");
  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true, backup };
}

export async function restoreExperience(data: any) {
  await requireAdmin();
  await dbConnect();
  const { _id, ...fields } = data;
  const restored = await Experience.create(fields);

  revalidatePath("/admin/experience");
  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true, experience: JSON.parse(JSON.stringify(restored)) };
}

export async function reorderExperiences(ids: string[]) {
  await requireAdmin();
  await dbConnect();

  if (!ids || ids.length === 0) return { success: true };

  const bulkOps = ids.map((id, index) => ({
    updateOne: {
      filter: { _id: id },
      update: { $set: { order: index } },
    },
  }));

  await Experience.bulkWrite(bulkOps);

  revalidatePath("/admin/experience");
  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true };
}
