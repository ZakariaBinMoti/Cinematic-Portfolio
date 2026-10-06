import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "sonner";
import "./admin.css";

const geist = localFont({
  src: "../fonts/GeistVF.woff",
  variable: "--font-geist",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: "Admin · Zakaria's Portfolio",
    template: "%s · Admin",
  },
  description: "Content management console for Zakaria Bin Moti's portfolio.",
  robots: { index: false, follow: false },
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`admin-root ${geist.variable}`}>
      {children}
      <Toaster
        theme="dark"
        position="bottom-right"
        richColors
        closeButton
        toastOptions={{
          style: {
            background: "rgba(16,16,24,0.92)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(16px)",
            fontFamily: "var(--font-geist)",
          },
        }}
      />
    </div>
  );
}
