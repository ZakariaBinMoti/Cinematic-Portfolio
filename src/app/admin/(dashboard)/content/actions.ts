"use server";

import dbConnect from "@/lib/mongodb";
import Content from "@/models/Content";
import { revalidatePath } from "next/cache";

export async function getContent(section: string) {
  await dbConnect();
  const content = await Content.findOne({ section }).lean();
  return content ? JSON.parse(JSON.stringify(content.data)) : null;
}

export async function updateContent(section: string, formData: FormData) {
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
  revalidatePath("/");
}
