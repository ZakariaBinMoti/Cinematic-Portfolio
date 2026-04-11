"use server";

import dbConnect from "@/lib/mongodb";
import Skill from "@/models/Skill";
import { revalidatePath } from "next/cache";

export async function getSkills() {
  await dbConnect();
  const skills = await Skill.find({}).sort({ order: 1 }).lean();
  return JSON.parse(JSON.stringify(skills));
}

export async function addSkill(formData: FormData) {
  await dbConnect();
  
  const category = formData.get("category") as string;
  const items = (formData.get("items") as string).split(",").map(s => s.trim());

  const lastSkill = await Skill.findOne({}).sort({ order: -1 }).lean();
  const order = lastSkill ? (lastSkill as any).order + 1 : 0;

  await Skill.create({ category, items, order });
  revalidatePath("/admin/skills");
  revalidatePath("/");
  return { success: true };
}

export async function updateSkill(id: string, formData: FormData) {
  await dbConnect();

  const category = formData.get("category") as string;
  const items = (formData.get("items") as string).split(",").map(s => s.trim());

  await Skill.findByIdAndUpdate(id, { category, items });
  revalidatePath("/admin/skills");
  revalidatePath("/");
  return { success: true };
}

export async function deleteSkill(id: string) {
  await dbConnect();
  await Skill.findByIdAndDelete(id);
  revalidatePath("/admin/skills");
  revalidatePath("/");
  return { success: true };
}

export async function reorderSkill(id: string, direction: "up" | "down") {
  await dbConnect();
  const items = await Skill.find({}).sort({ order: 1 });
  const index = items.findIndex(p => p._id.toString() === id);
  if (index === -1) return;

  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= items.length) return;

  const tempOrder = items[index].order;
  items[index].order = items[swapIndex].order;
  items[swapIndex].order = tempOrder;

  await items[index].save();
  await items[swapIndex].save();

  revalidatePath("/admin/skills");
  revalidatePath("/");
  return { success: true };
}
