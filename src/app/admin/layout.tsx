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
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){try{var t=localStorage.getItem("admin-theme");if(t==="light"){var r=document.currentScript?document.currentScript.parentElement:document.querySelector(".admin-root");if(r){r.classList.add("light");r.classList.remove("dark");r.setAttribute("data-admin-theme","light");}}}catch(e){}})();`,
        }}
      />
      {children}
      <Toaster
        position="bottom-right"
        richColors
        closeButton
        toastOptions={{
          style: {
            background: "var(--a-bg-elevated)",
            border: "1px solid var(--a-border)",
            color: "var(--a-text)",
            backdropFilter: "blur(16px)",
            fontFamily: "var(--font-geist)",
          },
        }}
      />
    </div>
  );
}
