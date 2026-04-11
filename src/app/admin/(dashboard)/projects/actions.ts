"use server";

import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";
import { uploadImage, deleteImage } from "@/lib/cloudinary";
import { revalidatePath } from "next/cache";

export async function getProjects() {
  await dbConnect();
  const projects = await Project.find({}).sort({ order: 1 }).lean();
  return JSON.parse(JSON.stringify(projects));
}

export async function addProject(formData: FormData) {
  await dbConnect();
  
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const techStack = (formData.get("techStack") as string).split(",").map(s => s.trim());
  const liveLink = formData.get("liveLink") as string;
  const file = formData.get("image") as File | null;

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

  await Project.create({ title, description, techStack, liveLink, order, imageUrl, imagePublicId });
  revalidatePath("/admin/projects");
  revalidatePath("/");
  return { success: true };
}

export async function updateProject(id: string, formData: FormData) {
  await dbConnect();
  
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const techStack = (formData.get("techStack") as string).split(",").map(s => s.trim());
  const liveLink = formData.get("liveLink") as string;
  const file = formData.get("image") as File | null;

  const existing = await Project.findById(id);
  if (!existing) return { success: false };

  const updateData: any = { title, description, techStack, liveLink };

  if (file && file.size > 0) {
    // Delete old image from Cloudinary
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

  await Project.findByIdAndUpdate(id, updateData);
  revalidatePath("/admin/projects");
  revalidatePath("/");
  return { success: true };
}

export async function deleteProject(id: string) {
  await dbConnect();
  const project = await Project.findById(id);
  if (!project) return { success: false };
  
  if (project.imagePublicId) {
    await deleteImage(project.imagePublicId);
  }
  
  await Project.findByIdAndDelete(id);
  revalidatePath("/admin/projects");
  revalidatePath("/");
  return { success: true };
}

export async function reorderProject(id: string, direction: "up" | "down") {
  await dbConnect();
  const projects = await Project.find({}).sort({ order: 1 });
  const index = projects.findIndex(p => p._id.toString() === id);
  if (index === -1) return;

  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= projects.length) return;

  // Swap orders
  const tempOrder = projects[index].order;
  projects[index].order = projects[swapIndex].order;
  projects[swapIndex].order = tempOrder;

  await projects[index].save();
  await projects[swapIndex].save();

  revalidatePath("/admin/projects");
  revalidatePath("/");
  return { success: true };
}
