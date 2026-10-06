"use server";

import dbConnect from "@/lib/mongodb";
import { requireAdmin } from "@/lib/admin-auth";
import Content from "@/models/Content";
import { revalidatePath } from "next/cache";

export async function getContent(section: string) {
  await requireAdmin();
  await dbConnect();
  const content = await Content.findOne({ section }).lean();
  return content ? JSON.parse(JSON.stringify(content.data)) : null;
}

export async function getAllContent() {
  await requireAdmin();
  await dbConnect();
  const contents = await Content.find({}).lean();
  const map: Record<string, any> = {};
  contents.forEach((c: any) => {
    map[c.section] = c.data;
  });
  return JSON.parse(JSON.stringify(map));
}

export async function updateContent(section: string, formData: FormData) {
  await requireAdmin();
  await dbConnect();

  const data: Record<string, string> = {};
  formData.forEach((value, key) => {
    if (typeof value === "string" && !key.startsWith("$")) {
      data[key] = value;
    }
  });

  await Content.findOneAndUpdate(
    { section },
    { section, data },
    { upsert: true, new: true }
  );

  revalidatePath("/admin/content");
  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true, data };
}

export async function updateContentDirect(section: string, data: Record<string, any>) {
  await requireAdmin();
  await dbConnect();

  await Content.findOneAndUpdate(
    { section },
    { section, data },
    { upsert: true, new: true }
  );

  revalidatePath("/admin/content");
  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true, data };
}
