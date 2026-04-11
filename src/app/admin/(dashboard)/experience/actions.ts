"use server";

import dbConnect from "@/lib/mongodb";
import Experience from "@/models/Experience";
import { revalidatePath } from "next/cache";

export async function getExperiences() {
  await dbConnect();
  const exp = await Experience.find({}).sort({ order: 1 }).lean();
  return JSON.parse(JSON.stringify(exp));
}

export async function addExperience(formData: FormData) {
  await dbConnect();
  
  const title = formData.get("title") as string;
  const company = formData.get("company") as string;
  const location = formData.get("location") as string;
  const startDate = formData.get("startDate") as string;
  const endDate = formData.get("endDate") as string;
  const description = formData.get("description") as string;

  const lastExp = await Experience.findOne({}).sort({ order: -1 }).lean();
  const order = lastExp ? (lastExp as any).order + 1 : 0;

  await Experience.create({ title, company, location, startDate, endDate, description, order });
  revalidatePath("/admin/experience");
  revalidatePath("/");
  return { success: true };
}

export async function updateExperience(id: string, formData: FormData) {
  await dbConnect();

  const title = formData.get("title") as string;
  const company = formData.get("company") as string;
  const location = formData.get("location") as string;
  const startDate = formData.get("startDate") as string;
  const endDate = formData.get("endDate") as string;
  const description = formData.get("description") as string;

  await Experience.findByIdAndUpdate(id, { title, company, location, startDate, endDate, description });
  revalidatePath("/admin/experience");
  revalidatePath("/");
  return { success: true };
}

export async function deleteExperience(id: string) {
  await dbConnect();
  await Experience.findByIdAndDelete(id);
  revalidatePath("/admin/experience");
  revalidatePath("/");
  return { success: true };
}

export async function reorderExperience(id: string, direction: "up" | "down") {
  await dbConnect();
  const items = await Experience.find({}).sort({ order: 1 });
  const index = items.findIndex(p => p._id.toString() === id);
  if (index === -1) return;

  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= items.length) return;

  const tempOrder = items[index].order;
  items[index].order = items[swapIndex].order;
  items[swapIndex].order = tempOrder;

  await items[index].save();
  await items[swapIndex].save();

  revalidatePath("/admin/experience");
  revalidatePath("/");
  return { success: true };
}
