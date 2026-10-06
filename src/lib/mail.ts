import nodemailer from "nodemailer";

interface SendRecoveryEmailResult {
  sent: boolean;
  isDevMock?: boolean;
  error?: string;
}

export async function sendPasswordRecoveryEmail(
  toEmail: string,
  code: string
): Promise<SendRecoveryEmailResult> {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT) || 465;
  const user = process.env.SMTP_USER || process.env.ADMIN_EMAIL;
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;
  const from = process.env.SMTP_FROM || `"Zakaria Portfolio" <${user}>`;

  const hasCredentials = Boolean(user && pass);

  // If SMTP is fully configured, attempt real email delivery
  if (hasCredentials) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user,
          pass,
        },
      });

      const html = `
        <div style="background-color: #0d0e12; color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px 20px; text-align: center;">
          <div style="max-width: 480px; margin: 0 auto; background-color: #171821; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); padding: 32px 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
            <div style="display: inline-block; width: 44px; height: 44px; line-height: 44px; border-radius: 12px; background: linear-gradient(135deg, #8b5cf6, #3b82f6); color: white; font-weight: bold; font-size: 20px; margin-bottom: 20px;">
              Z
            </div>
            <h2 style="margin: 0 0 12px; font-size: 22px; color: #ffffff; font-weight: 700;">Admin Password Reset</h2>
            <p style="margin: 0 0 24px; color: #9ca3af; font-size: 14px; line-height: 1.5;">
              A request was made to reset the password for your administrator account. Use the 6-digit verification code below:
            </p>
            <div style="background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 12px; padding: 16px; margin-bottom: 24px;">
              <span style="font-family: monospace; font-size: 32px; letter-spacing: 6px; font-weight: 800; color: #c4b5fd;">
                ${code}
              </span>
            </div>
            <p style="margin: 0 0 8px; font-size: 12px; color: #6b7280;">
              This code will expire in 15 minutes. If you did not request this, you can safely ignore this email.
            </p>
          </div>
        </div>
      `;

      await transporter.sendMail({
        from,
        to: toEmail,
        subject: `Your Admin Verification Code: ${code}`,
        text: `Your administrator verification code is: ${code}. It expires in 15 minutes.`,
        html,
      });

      return { sent: true };
    } catch (err: any) {
      console.error("[Mail Error] Failed to send email via SMTP:", err);
      // In production, report delivery failure
      if (process.env.NODE_ENV === "production") {
        return {
          sent: false,
          error: "Failed to dispatch recovery email. Please check server SMTP credentials or use 'Continue with Google'.",
        };
      }
    }
  }

  // If no SMTP credentials are configured:
  // In development, log code to terminal stdout for local developer convenience
  if (process.env.NODE_ENV === "development") {
    console.log("\n=======================================================");
    console.log(`[DEV OTP] Password recovery code for ${toEmail}: ${code}`);
    console.log("=======================================================\n");
    return { sent: true, isDevMock: true };
  }

  // In live production, NEVER expose the code! Notify user to configure email or use Google
  return {
    sent: false,
    error: "Outgoing email service is not configured on the live server. Please sign in directly using 'Continue with Google', or configure SMTP in your server environment variables.",
  };
}
