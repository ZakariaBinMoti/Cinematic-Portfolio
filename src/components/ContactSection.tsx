"use client";

import { useState } from "react";
import { Copy, Check, Mail, FileText, ArrowUpRight } from "lucide-react";

export default function ContactSection({ contactData }: { contactData?: any }) {
  const [copied, setCopied] = useState(false);

  const headline = contactData?.headline || "Let's build something exceptional.";
  const description =
    contactData?.description ||
    "Whether you need a Shopify expert, custom frontend architecture, or a full-scale eCommerce solution.";
  const email = contactData?.email || "zakaria.binmoti@gmail.com";
  const linkedin = contactData?.linkedin || "https://www.linkedin.com/in/zakariabinmoti";
  const github = contactData?.github || "https://github.com/ZakariaBinMoti";
  const twitter = contactData?.twitter;
  const calendly = contactData?.calendly;

  const handleCopyEmail = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <section id="contact" className="bg-[#080a10] py-36 px-6 md:px-20 relative z-20 overflow-hidden">
      <div className="max-w-4xl mx-auto text-center relative z-10 p-10 sm:p-14 md:p-16 rounded-3xl bg-white/[0.025] border border-white/[0.09] backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.6)] relative overflow-hidden">
        {/* 3D Spatial Dual Rim Top Highlight */}
        <div
          aria-hidden="true"
          className="absolute top-0 inset-x-12 h-[1px] bg-gradient-to-r from-transparent via-[#3594bd]/50 via-white/20 to-[#f6602d]/50 opacity-80"
        />

        <div className="mb-6">
          <span className="text-xs font-mono uppercase tracking-widest text-gray-500">
            06 // Get in Touch
          </span>
        </div>

        <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white mb-6">
          {headline.includes("exceptional") ? (
            <>
              Let&apos;s build<br />something <span className="text-gray-500">exceptional.</span>
            </>
          ) : (
            headline
          )}
        </h2>

        <p className="text-base sm:text-lg text-gray-400 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
          {description}
        </p>

        {/* Spatial Action Buttons with Professional Hierarchy */}
        <div className="flex flex-col items-center gap-5">
          {/* Primary Row: High-Intent Actions (Direct Contact) */}
          <div className="flex flex-wrap items-center justify-center gap-3.5">
            {/* Email with 1-Click Copy */}
            {email && (
              <div className="inline-flex items-center bg-white text-black pl-6 pr-2 py-1.5 rounded-full font-medium text-sm shadow-xl hover:shadow-white/10 transition-all group">
                <a
                  href={`mailto:${email}`}
                  className="hover:underline flex items-center gap-2 pr-2"
                  title="Send email via mail client"
                >
                  <Mail className="w-4 h-4 text-gray-700" />
                  <span>{email}</span>
                </a>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="w-9 h-9 rounded-full bg-black/[0.06] hover:bg-black/[0.12] flex items-center justify-center text-black transition-all active:scale-90 relative"
                  title="Copy email to clipboard"
                  aria-label="Copy email address"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-700 group-hover:scale-105 transition-transform" />
                  )}
                  {copied && (
                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[11px] font-mono px-2.5 py-1 rounded-md shadow-2xl whitespace-nowrap pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                      Copied to clipboard!
                    </span>
                  )}
                </button>
              </div>
            )}

            {/* Book Call (Calendly if set) */}
            {calendly && (
              <a
                href={calendly}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 border border-white/15 bg-white/[0.04] hover:bg-white/10 text-white px-6 py-3.5 rounded-full font-medium text-sm transition-all hover:scale-105"
              >
                <span>Book Call</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-gray-400" />
              </a>
            )}
          </div>

          {/* Secondary Row: Social Profiles & Resume */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
            {/* Resume Button matching LinkedIn/GitHub style */}
            <a
              href="/Zakaria_Bin_Moti_Resume.pdf"
              target="_blank"
              rel="noreferrer"
              className="border border-white/10 bg-white/[0.03] text-gray-400 hover:text-white hover:bg-white/[0.08] hover:border-white/20 px-5 py-2.5 rounded-full font-medium text-xs transition-all flex items-center gap-1.5"
              title="Open or download Zakaria Bin Moti's Resume"
            >
              <FileText className="w-3 h-3 opacity-60" />
              <span>Resume</span>
              <ArrowUpRight className="w-3 h-3 opacity-60" />
            </a>

            {linkedin && (
              <a
                href={linkedin}
                target="_blank"
                rel="noreferrer"
                className="border border-white/10 bg-white/[0.03] text-gray-400 hover:text-white hover:bg-white/[0.08] hover:border-white/20 px-5 py-2.5 rounded-full font-medium text-xs transition-all flex items-center gap-1.5"
              >
                <span>LinkedIn</span>
                <ArrowUpRight className="w-3 h-3 opacity-60" />
              </a>
            )}
            {github && (
              <a
                href={github}
                target="_blank"
                rel="noreferrer"
                className="border border-white/10 bg-white/[0.03] text-gray-400 hover:text-white hover:bg-white/[0.08] hover:border-white/20 px-5 py-2.5 rounded-full font-medium text-xs transition-all flex items-center gap-1.5"
              >
                <span>GitHub</span>
                <ArrowUpRight className="w-3 h-3 opacity-60" />
              </a>
            )}
            {twitter && (
              <a
                href={twitter}
                target="_blank"
                rel="noreferrer"
                className="border border-white/10 bg-white/[0.03] text-gray-400 hover:text-white hover:bg-white/[0.08] hover:border-white/20 px-5 py-2.5 rounded-full font-medium text-xs transition-all flex items-center gap-1.5"
              >
                <span>X / Twitter</span>
                <ArrowUpRight className="w-3 h-3 opacity-60" />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="mt-28 text-center text-gray-600 text-xs">
        <p>© {new Date().getFullYear()} Zakaria Bin Moti. All rights reserved.</p>
        <a
          href="/admin/login"
          rel="nofollow"
          className="hover:text-gray-400 transition-colors mt-2 inline-block opacity-60 hover:opacity-100"
        >
          Admin Studio
        </a>
      </div>
    </section>
  );
}
