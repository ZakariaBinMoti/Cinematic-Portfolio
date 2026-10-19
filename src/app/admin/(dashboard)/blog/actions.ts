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
    .replace(/\s+/g, "-")
    .replace(/&/g, "-and-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

export async function getAdminBlogPosts() {
  await requireAdmin();
  await dbConnect();

  // Auto-seed if collection is empty for blogs
  const count = await Post.countDocuments({ type: "blog" });
  if (count === 0) {
    const seedItems = FALLBACK_POSTS.filter((p) => p.type === "blog").map((p, idx) => ({
      ...p,
      order: idx,
      isPublished: true,
    }));
    if (seedItems.length > 0) {
      await Post.insertMany(seedItems);
    }
  }

  const items = await Post.find({ type: "blog" })
    .sort({ publishedAt: -1, createdAt: -1 })
    .lean();

  return JSON.parse(JSON.stringify(items));
}

export async function addBlogPost(formData: FormData) {
  await requireAdmin();
  await dbConnect();

  const title = (formData.get("title") as string)?.trim();
  if (!title) {
    throw new Error("Article title is required");
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
  const category = (formData.get("category") as string)?.trim() || "Shopify & Liquid";
  const readingTime = (formData.get("readingTime") as string)?.trim() || "5 min read";
  const authorName = (formData.get("authorName") as string)?.trim() || "Zakaria Bin Moti";
  const authorRole = (formData.get("authorRole") as string)?.trim() || "Lead Software Engineer & Shopify Architect";
  const isPublished = formData.has("isPublished") ? formData.get("isPublished") === "true" : true;

  const publishedAtRaw = formData.get("publishedAt") as string;
  const publishedAt = publishedAtRaw ? new Date(publishedAtRaw) : new Date();

  // Tags
  const tagsRaw = (formData.get("tags") as string) || "";
  const tags = tagsRaw
    ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  // Cover image: either uploaded file or URL
  let coverImage = (formData.get("coverImageUrl") as string)?.trim() || "";
  let coverImagePublicId = "";
  const file = formData.get("image") as File | null;

  if (file && file.size > 0) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;
    const result = await uploadImage(base64, "portfolio/blog");
    coverImage = result.url;
    coverImagePublicId = result.publicId;
  }

  const lastPost = await Post.findOne({ type: "blog" }).sort({ order: -1 }).lean();
  const order = lastPost && typeof (lastPost as any).order === "number" ? (lastPost as any).order + 1 : 0;

  const created = await Post.create({
    title,
    slug,
    type: "blog",
    summary,
    content,
    coverImage,
    coverImagePublicId,
    category,
    tags,
    readingTime,
    authorName,
    authorRole,
    isPublished,
    publishedAt,
    order,
  });

  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/admin/blog");
  revalidatePath("/admin");
  revalidatePath("/sitemap.xml");
  revalidatePath("/");

  return { success: true, post: JSON.parse(JSON.stringify(created)) };
}

export async function updateBlogPost(id: string, formData: FormData) {
  await requireAdmin();
  await dbConnect();

  const existing = await Post.findById(id);
  if (!existing) {
    return { success: false, error: "Blog post not found" };
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
  const category = (formData.get("category") as string)?.trim() || existing.category || "Shopify & Liquid";
  const readingTime = (formData.get("readingTime") as string)?.trim() || existing.readingTime || "5 min read";
  const authorName = (formData.get("authorName") as string)?.trim() || existing.authorName || "Zakaria Bin Moti";
  const authorRole = (formData.get("authorRole") as string)?.trim() || existing.authorRole || "Lead Software Engineer";
  const isPublished = formData.has("isPublished") ? formData.get("isPublished") === "true" : existing.isPublished;

  const publishedAtRaw = formData.get("publishedAt") as string;
  const publishedAt = publishedAtRaw ? new Date(publishedAtRaw) : existing.publishedAt || new Date();

  const tagsRaw = (formData.get("tags") as string) || "";
  const tags = tagsRaw
    ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  const updateData: any = {
    title,
    slug,
    summary,
    content,
    category,
    tags,
    readingTime,
    authorName,
    authorRole,
    isPublished,
    publishedAt,
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
    const result = await uploadImage(base64, "portfolio/blog");
    updateData.coverImage = result.url;
    updateData.coverImagePublicId = result.publicId;
  } else if (coverImageUrl && coverImageUrl !== existing.coverImage) {
    updateData.coverImage = coverImageUrl;
  }

  const updated = await Post.findByIdAndUpdate(id, updateData, { new: true });

  revalidatePath("/blog");
  revalidatePath(`/blog/${existing.slug}`);
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/admin/blog");
  revalidatePath("/admin");
  revalidatePath("/sitemap.xml");
  revalidatePath("/");

  return { success: true, post: JSON.parse(JSON.stringify(updated)) };
}

export async function toggleBlogPostPublish(id: string, isPublished: boolean) {
  await requireAdmin();
  await dbConnect();

  const updated = await Post.findByIdAndUpdate(id, { isPublished }, { new: true });
  if (!updated) return { success: false, error: "Blog post not found" };

  revalidatePath("/blog");
  revalidatePath(`/blog/${updated.slug}`);
  revalidatePath("/admin/blog");
  revalidatePath("/admin");
  revalidatePath("/sitemap.xml");

  return { success: true, post: JSON.parse(JSON.stringify(updated)) };
}

export async function deleteBlogPost(id: string) {
  await requireAdmin();
  await dbConnect();

  const existing = await Post.findById(id);
  if (!existing) return { success: false, error: "Blog post not found" };

  if (existing.coverImagePublicId) {
    await deleteImage(existing.coverImagePublicId);
  }

  await Post.findByIdAndDelete(id);

  revalidatePath("/blog");
  revalidatePath(`/blog/${existing.slug}`);
  revalidatePath("/admin/blog");
  revalidatePath("/admin");
  revalidatePath("/sitemap.xml");
  revalidatePath("/");

  return { success: true };
}
