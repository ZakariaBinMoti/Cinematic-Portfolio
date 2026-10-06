"use server";

import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

import { sendPasswordRecoveryEmail } from "@/lib/mail";

export async function getAuthCapabilities() {
  const adminEmail = (process.env.ADMIN_EMAIL || "zakaria.binmoti@gmail.com").toLowerCase().trim();
  const googleConfigured = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
  );
  const smtpConfigured = Boolean(
    (process.env.SMTP_USER || process.env.ADMIN_EMAIL) &&
    (process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD)
  );

  return {
    googleConfigured,
    smtpConfigured,
    adminEmail,
  };
}

export async function requestPasswordReset(rawEmail: string) {
  try {
    await dbConnect();
    const email = rawEmail.toLowerCase().trim();

    if (!email) {
      return { success: false, error: "Please enter your email address." };
    }

    // Check if DB is empty, seed if needed
    const adminEmail = (process.env.ADMIN_EMAIL || "zakaria.binmoti@gmail.com").toLowerCase().trim();
    const count = await User.countDocuments({ email: adminEmail });
    if (count === 0) {
      const initialPasswordHash = await bcrypt.hash("789878", 10);
      await User.create({ email: adminEmail, passwordHash: initialPasswordHash });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return {
        success: false,
        error: `No registered account found for ${email}.`,
      };
    }

    // Generate secure 6-digit OTP code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    user.resetToken = code;
    user.resetTokenExpiry = expiry;
    await user.save();

    // Dispatch recovery code via email (or dev terminal log in local development)
    const mailResult = await sendPasswordRecoveryEmail(email, code);

    if (!mailResult.sent) {
      return {
        success: false,
        error: mailResult.error || "Failed to dispatch recovery email.",
      };
    }

    return {
      success: true,
      message: mailResult.isDevMock
        ? `[Dev Mode] Recovery code printed to your local server terminal.`
        : `A 6-digit recovery code has been dispatched to ${email}.`,
    };
  } catch (error: any) {
    console.error("requestPasswordReset error:", error);
    return {
      success: false,
      error: error?.message || "Failed to process password recovery.",
    };
  }
}

export async function resetPasswordWithCode(
  rawEmail: string,
  code: string,
  newPassword: string
) {
  try {
    await dbConnect();
    const email = rawEmail.toLowerCase().trim();

    if (!email || !code || !newPassword) {
      return { success: false, error: "Please provide email, verification code, and new password." };
    }

    if (newPassword.length < 6) {
      return { success: false, error: "New password must be at least 6 characters long." };
    }

    const user = await User.findOne({ email });

    if (!user) {
      return { success: false, error: "No account found with this email." };
    }

    if (!user.resetToken || user.resetToken !== code.trim()) {
      return { success: false, error: "Invalid verification code. Please check and try again." };
    }

    if (!user.resetTokenExpiry || new Date(user.resetTokenExpiry).getTime() < Date.now()) {
      return { success: false, error: "Verification code has expired. Please request a new code." };
    }

    // Hash new password and clear token
    const newHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = newHash;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    return {
      success: true,
      message: "Password reset successful! You can now sign in with your new credentials.",
    };
  } catch (error: any) {
    console.error("resetPasswordWithCode error:", error);
    return {
      success: false,
      error: error?.message || "Failed to reset password.",
    };
  }
}
