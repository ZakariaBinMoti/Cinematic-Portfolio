"use server";

import dbConnect from "@/lib/mongodb";
import { requireAdmin } from "@/lib/admin-auth";
import Post from "@/models/Post";
import { FALLBACK_POSTS } from "@/lib/posts";
import { uploadImage, deleteImage } from "@/lib/cloudinary";
import { revalidatePath } from "next/cache";

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/&/g, "-and-") // Replace & with 'and'
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-"); // Replace multiple - with single -
}

export async function getAdminCaseStudies() {
  await requireAdmin();
  await dbConnect();

  // Auto-seed if collection is empty for case studies
  const count = await Post.countDocuments({ type: "case-study" });
  if (count === 0) {
    const seedItems = FALLBACK_POSTS.filter((p) => p.type === "case-study").map((p, idx) => ({
      ...p,
      order: idx,
      isPublished: true,
    }));
    if (seedItems.length > 0) {
      await Post.insertMany(seedItems);
    }
  }

  const items = await Post.find({ type: "case-study" })
    .sort({ order: 1, createdAt: -1 })
    .lean();

  return JSON.parse(JSON.stringify(items));
}

export async function addCaseStudy(formData: FormData) {
  await requireAdmin();
  await dbConnect();

  const title = (formData.get("title") as string)?.trim();
  if (!title) {
    throw new Error("Title is required");
  }

  let slug = (formData.get("slug") as string)?.trim();
  if (!slug) {
    slug = slugify(title);
  } else {
    slug = slugify(slug);
  }

  // Ensure unique slug
  const existingWithSlug = await Post.findOne({ slug });
  if (existingWithSlug) {
    slug = `${slug}-${Date.now().toString().slice(-4)}`;
  }

  const summary = (formData.get("summary") as string)?.trim() || "";
  const content = (formData.get("content") as string)?.trim() || "";
  const clientName = (formData.get("clientName") as string)?.trim() || "";
  const clientUrl = (formData.get("clientUrl") as string)?.trim() || "";
  const projectYear = (formData.get("projectYear") as string)?.trim() || new Date().getFullYear().toString();
  const category = (formData.get("category") as string)?.trim() || "Shopify OS 2.0";
  const readingTime = (formData.get("readingTime") as string)?.trim() || "5 min read";
  const authorName = (formData.get("authorName") as string)?.trim() || "Zakaria Bin Moti";
  const authorRole = (formData.get("authorRole") as string)?.trim() || "Lead Software Engineer & Shopify Architect";
  const isPublished = formData.has("isPublished") ? formData.get("isPublished") === "true" : true;

  // Tags
  const tagsRaw = (formData.get("tags") as string) || "";
  const tags = tagsRaw
    ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  // Services
  const servicesRaw = (formData.get("services") as string) || "";
  const services = servicesRaw
    ? servicesRaw.split("\n").map((s) => s.trim()).filter(Boolean)
    : [];

  // Metrics
  const metricsRaw = (formData.get("metrics") as string) || "";
  let metrics: { label: string; value: string }[] = [];
  if (metricsRaw) {
    try {
      metrics = JSON.parse(metricsRaw);
    } catch {
      metrics = [];
    }
  }

  // Cover image: either uploaded file or URL
  let coverImage = (formData.get("coverImageUrl") as string)?.trim() || "";
  let coverImagePublicId = "";
  const file = formData.get("image") as File | null;

  if (file && file.size > 0) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;
    const result = await uploadImage(base64, "portfolio/case-studies");
    coverImage = result.url;
    coverImagePublicId = result.publicId;
  }

  // Calculate order
  const lastPost = await Post.findOne({ type: "case-study" }).sort({ order: -1 }).lean();
  const order = lastPost && typeof (lastPost as any).order === "number" ? (lastPost as any).order + 1 : 0;

  const created = await Post.create({
    title,
    slug,
    type: "case-study",
    summary,
    content,
    coverImage,
    coverImagePublicId,
    clientName,
    clientUrl,
    projectYear,
    category,
    tags,
    services,
    metrics,
    readingTime,
    authorName,
    authorRole,
    isPublished,
    publishedAt: new Date(),
    order,
  });

  revalidatePath("/case-studies");
  revalidatePath(`/case-studies/${slug}`);
  revalidatePath("/admin/case-studies");
  revalidatePath("/admin");
  revalidatePath("/sitemap.xml");
  revalidatePath("/");

  return { success: true, caseStudy: JSON.parse(JSON.stringify(created)) };
}

export async function updateCaseStudy(id: string, formData: FormData) {
  await requireAdmin();
  await dbConnect();

  const existing = await Post.findById(id);
  if (!existing) {
    return { success: false, error: "Case study not found" };
  }

  const title = (formData.get("title") as string)?.trim();
  if (!title) {
    return { success: false, error: "Title is required" };
  }

  let slug = (formData.get("slug") as string)?.trim();
  if (!slug) {
    slug = slugify(title);
  } else {
    slug = slugify(slug);
  }

  // Ensure slug uniqueness among other documents
  const duplicate = await Post.findOne({ slug, _id: { $ne: id } });
  if (duplicate) {
    slug = `${slug}-${Date.now().toString().slice(-4)}`;
  }

  const summary = (formData.get("summary") as string)?.trim() || "";
  const content = (formData.get("content") as string)?.trim() || "";
  const clientName = (formData.get("clientName") as string)?.trim() || "";
  const clientUrl = (formData.get("clientUrl") as string)?.trim() || "";
  const projectYear = (formData.get("projectYear") as string)?.trim() || existing.projectYear || "";
  const category = (formData.get("category") as string)?.trim() || existing.category || "Shopify OS 2.0";
  const readingTime = (formData.get("readingTime") as string)?.trim() || existing.readingTime || "5 min read";
  const authorName = (formData.get("authorName") as string)?.trim() || existing.authorName || "Zakaria Bin Moti";
  const authorRole = (formData.get("authorRole") as string)?.trim() || existing.authorRole || "Lead Software Engineer";
  const isPublished = formData.has("isPublished") ? formData.get("isPublished") === "true" : existing.isPublished;

  const tagsRaw = (formData.get("tags") as string) || "";
  const tags = tagsRaw
    ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  const servicesRaw = (formData.get("services") as string) || "";
  const services = servicesRaw
    ? servicesRaw.split("\n").map((s) => s.trim()).filter(Boolean)
    : [];

  const metricsRaw = (formData.get("metrics") as string) || "";
  let metrics: { label: string; value: string }[] = [];
  if (metricsRaw) {
    try {
      metrics = JSON.parse(metricsRaw);
    } catch {
      metrics = existing.metrics || [];
    }
  }

  const updateData: any = {
    title,
    slug,
    summary,
    content,
    clientName,
    clientUrl,
    projectYear,
    category,
    tags,
    services,
    metrics,
    readingTime,
    authorName,
    authorRole,
    isPublished,
  };

  const file = formData.get("image") as File | null;
  const removeImage = formData.get("removeImage") === "true";
  const coverImageUrl = (formData.get("coverImageUrl") as string)?.trim();

  if (removeImage && existing.coverImagePublicId) {
    await deleteImage(existing.coverImagePublicId);
    updateData.coverImage = "";
    updateData.coverImagePublicId = "";
  } else if (file && file.size > 0) {
    if (existing.coverImagePublicId) {
      await deleteImage(existing.coverImagePublicId);
    }
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;
    const result = await uploadImage(base64, "portfolio/case-studies");
    updateData.coverImage = result.url;
    updateData.coverImagePublicId = result.publicId;
  } else if (coverImageUrl && coverImageUrl !== existing.coverImage) {
    updateData.coverImage = coverImageUrl;
  }

  const updated = await Post.findByIdAndUpdate(id, updateData, { new: true });

  revalidatePath("/case-studies");
  revalidatePath(`/case-studies/${existing.slug}`);
  revalidatePath(`/case-studies/${slug}`);
  revalidatePath("/admin/case-studies");
  revalidatePath("/admin");
  revalidatePath("/sitemap.xml");
  revalidatePath("/");

  return { success: true, caseStudy: JSON.parse(JSON.stringify(updated)) };
}

export async function toggleCaseStudyPublish(id: string, isPublished: boolean) {
  await requireAdmin();
  await dbConnect();

  const updated = await Post.findByIdAndUpdate(id, { isPublished }, { new: true });
  if (!updated) return { success: false, error: "Case study not found" };

  revalidatePath("/case-studies");
  revalidatePath(`/case-studies/${updated.slug}`);
  revalidatePath("/admin/case-studies");
  revalidatePath("/admin");
  revalidatePath("/sitemap.xml");

  return { success: true, caseStudy: JSON.parse(JSON.stringify(updated)) };
}

export async function deleteCaseStudy(id: string) {
  await requireAdmin();
  await dbConnect();

  const existing = await Post.findById(id);
  if (!existing) return { success: false, error: "Case study not found" };

  if (existing.coverImagePublicId) {
    await deleteImage(existing.coverImagePublicId);
  }

  await Post.findByIdAndDelete(id);

  revalidatePath("/case-studies");
  revalidatePath(`/case-studies/${existing.slug}`);
  revalidatePath("/admin/case-studies");
  revalidatePath("/admin");
  revalidatePath("/sitemap.xml");
  revalidatePath("/");

  return { success: true };
}

export async function reorderCaseStudies(ids: string[]) {
  await requireAdmin();
  await dbConnect();

  if (!ids || ids.length === 0) return { success: true };

  const bulkOps = ids.map((id, index) => ({
    updateOne: {
      filter: { _id: id },
      update: { $set: { order: index } },
    },
  }));

  await Post.bulkWrite(bulkOps);

  revalidatePath("/case-studies");
  revalidatePath("/admin/case-studies");
  revalidatePath("/");
  return { success: true };
}
