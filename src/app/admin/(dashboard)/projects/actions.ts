"use server";

import dbConnect from "@/lib/mongodb";
import { requireAdmin } from "@/lib/admin-auth";
import Project from "@/models/Project";
import { uploadImage, deleteImage } from "@/lib/cloudinary";
import { revalidatePath } from "next/cache";

export async function getProjects() {
  await requireAdmin();
  await dbConnect();
  const projects = await Project.find({}).sort({ order: 1 }).lean();
  return JSON.parse(JSON.stringify(projects));
}

export async function addProject(formData: FormData) {
  await requireAdmin();
  await dbConnect();

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const techStackRaw = formData.get("techStack") as string;
  const techStack = techStackRaw
    ? techStackRaw.split(",").map((s) => s.trim()).filter(Boolean)
    : [];
  const liveLink = (formData.get("liveLink") as string)?.trim() || "";
  const file = formData.get("image") as File | null;

  if (!title) {
    throw new Error("Title is required");
  }

  // Auto-assign order to end
  const lastProject = await Project.findOne({}).sort({ order: -1 }).lean();
  const order = lastProject ? (lastProject as any).order + 1 : 0;

  let imageUrl = "";
  let imagePublicId = "";

  if (file && file.size > 0) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;
    const result = await uploadImage(base64);
    imageUrl = result.url;
    imagePublicId = result.publicId;
  }

  const created = await Project.create({
    title,
    description,
    techStack,
    liveLink,
    order,
    imageUrl,
    imagePublicId,
  });

  revalidatePath("/admin/projects");
  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true, project: JSON.parse(JSON.stringify(created)) };
}

export async function updateProject(id: string, formData: FormData) {
  await requireAdmin();
  await dbConnect();

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const techStackRaw = formData.get("techStack") as string;
  const techStack = techStackRaw
    ? techStackRaw.split(",").map((s) => s.trim()).filter(Boolean)
    : [];
  const liveLink = (formData.get("liveLink") as string)?.trim() || "";
  const file = formData.get("image") as File | null;
  const removeImage = formData.get("removeImage") === "true";

  const existing = await Project.findById(id);
  if (!existing) return { success: false, error: "Project not found" };

  const updateData: any = { title, description, techStack, liveLink };

  if (removeImage && existing.imagePublicId) {
    await deleteImage(existing.imagePublicId);
    updateData.imageUrl = "";
    updateData.imagePublicId = "";
  } else if (file && file.size > 0) {
    if (existing.imagePublicId) {
      await deleteImage(existing.imagePublicId);
    }
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;
    const result = await uploadImage(base64);
    updateData.imageUrl = result.url;
    updateData.imagePublicId = result.publicId;
  }

  const updated = await Project.findByIdAndUpdate(id, updateData, { new: true });
  revalidatePath("/admin/projects");
  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true, project: JSON.parse(JSON.stringify(updated)) };
}

export async function deleteProject(id: string) {
  await requireAdmin();
  await dbConnect();
  const project = await Project.findById(id);
  if (!project) return { success: false, error: "Project not found" };

  const backupData = JSON.parse(JSON.stringify(project));

  if (project.imagePublicId) {
    await deleteImage(project.imagePublicId);
  }

  await Project.findByIdAndDelete(id);
  revalidatePath("/admin/projects");
  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true, backup: backupData };
}

export async function restoreProject(data: any) {
  await requireAdmin();
  await dbConnect();
  const { _id, ...fields } = data;
  const restored = await Project.create(fields);
  revalidatePath("/admin/projects");
  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true, project: JSON.parse(JSON.stringify(restored)) };
}

export async function reorderProjects(ids: string[]) {
  await requireAdmin();
  await dbConnect();

  if (!ids || ids.length === 0) return { success: true };

  const bulkOps = ids.map((id, index) => ({
    updateOne: {
      filter: { _id: id },
      update: { $set: { order: index } },
    },
  }));

  await Project.bulkWrite(bulkOps);

  revalidatePath("/admin/projects");
  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true };
}
