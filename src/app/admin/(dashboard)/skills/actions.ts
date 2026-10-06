"use server";

import dbConnect from "@/lib/mongodb";
import { requireAdmin } from "@/lib/admin-auth";
import Skill from "@/models/Skill";
import { revalidatePath } from "next/cache";

export async function getSkills() {
  await requireAdmin();
  await dbConnect();
  const skills = await Skill.find({}).sort({ order: 1 }).lean();
  return JSON.parse(JSON.stringify(skills));
}

export async function addSkill(formData: FormData) {
  await requireAdmin();
  await dbConnect();

  const category = (formData.get("category") as string)?.trim();
  const itemsRaw = formData.get("items") as string;
  const items = itemsRaw
    ? itemsRaw.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  if (!category) {
    throw new Error("Category name is required");
  }

  const lastSkill = await Skill.findOne({}).sort({ order: -1 }).lean();
  const order = lastSkill ? (lastSkill as any).order + 1 : 0;

  const created = await Skill.create({ category, items, order });
  revalidatePath("/admin/skills");
  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true, skill: JSON.parse(JSON.stringify(created)) };
}

export async function updateSkill(id: string, formData: FormData) {
  await requireAdmin();
  await dbConnect();

  const category = (formData.get("category") as string)?.trim();
  const itemsRaw = formData.get("items") as string;
  const items = itemsRaw
    ? itemsRaw.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const updated = await Skill.findByIdAndUpdate(
    id,
    { category, items },
    { new: true }
  );

  revalidatePath("/admin/skills");
  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true, skill: JSON.parse(JSON.stringify(updated)) };
}

export async function updateSkillDirect(id: string, category: string, items: string[]) {
  await requireAdmin();
  await dbConnect();

  const updated = await Skill.findByIdAndUpdate(
    id,
    { category, items },
    { new: true }
  );

  revalidatePath("/admin/skills");
  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true, skill: JSON.parse(JSON.stringify(updated)) };
}

export async function deleteSkill(id: string) {
  await requireAdmin();
  await dbConnect();
  const skill = await Skill.findById(id);
  if (!skill) return { success: false, error: "Not found" };

  const backup = JSON.parse(JSON.stringify(skill));
  await Skill.findByIdAndDelete(id);

  revalidatePath("/admin/skills");
  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true, backup };
}

export async function restoreSkill(data: any) {
  await requireAdmin();
  await dbConnect();
  const { _id, ...fields } = data;
  const restored = await Skill.create(fields);

  revalidatePath("/admin/skills");
  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true, skill: JSON.parse(JSON.stringify(restored)) };
}

export async function reorderSkills(ids: string[]) {
  await requireAdmin();
  await dbConnect();

  if (!ids || ids.length === 0) return { success: true };

  const bulkOps = ids.map((id, index) => ({
    updateOne: {
      filter: { _id: id },
      update: { $set: { order: index } },
    },
  }));

  await Skill.bulkWrite(bulkOps);

  revalidatePath("/admin/skills");
  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true };
}
