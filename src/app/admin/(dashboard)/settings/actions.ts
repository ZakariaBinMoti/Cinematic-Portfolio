"use server";

import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import { requireAdmin } from "@/lib/admin-auth";
import User from "@/models/User";

export async function changePassword(currentPassword: string, newPassword: string) {
  const session = await requireAdmin();
  await dbConnect();

  if (!currentPassword || !newPassword) {
    return { success: false, error: "Both current and new passwords are required" };
  }

  if (newPassword.length < 6) {
    return { success: false, error: "New password must be at least 6 characters long" };
  }

  const email = session.user?.email;
  const user = await User.findOne({ email });

  if (!user) {
    return { success: false, error: "User record not found" };
  }

  const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isValid) {
    return { success: false, error: "Current password is incorrect" };
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  user.passwordHash = newHash;
  await user.save();

  return { success: true };
}

export async function getSystemStatus() {
  await requireAdmin();

  return {
    nodeEnv: process.env.NODE_ENV || "development",
    hasCloudinary: Boolean(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ),
    cloudinaryCloud: process.env.CLOUDINARY_CLOUD_NAME || "Not configured",
    hasMongo: Boolean(process.env.MONGODB_URI),
    mongoHost: process.env.MONGODB_URI?.includes("mongodb.net") ? "MongoDB Atlas (Cloud)" : "Local/Custom",
  };
}
