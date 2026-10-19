"use client";

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CodeBlockProps {
  language?: string;
  code: string;
}

function CodeBlock({ language, code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="relative my-6 rounded-2xl overflow-hidden border border-white/10 bg-[#06080d] shadow-2xl group">
      <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.04] border-b border-white/[0.06] text-xs font-mono text-gray-400">
        <span className="uppercase tracking-wider text-[11px] text-gray-500 font-semibold">
          {language || "code"}
        </span>
        <button
          onClick={handleCopy}
          type="button"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.06] hover:bg-white/[0.12] text-gray-300 hover:text-white transition-all text-[11px]"
          title="Copy to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-xs sm:text-sm font-mono text-gray-200 leading-relaxed scrollbar-thin scrollbar-thumb-white/10">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function MarkdownRenderer({ content }: { content: string }) {
  if (!content) return null;

  // Split into lines to parse markdown blocks
  const lines = content.trim().split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced Code Block
    if (line.trim().startsWith("```")) {
      const language = line.trim().replace(/^```/, "").trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <CodeBlock
          key={`code-${i}`}
          language={language}
          code={codeLines.join("\n")}
        />
      );
      i++;
      continue;
    }

    // Image: ![alt](url)
    const imgMatch = line.trim().match(/^!\[(.*?)\]\((.*?)\)$/);
    if (imgMatch) {
      const alt = imgMatch[1];
      const src = imgMatch[2];
      elements.push(
        <figure
          key={`img-${i}`}
          className="my-8 rounded-2xl overflow-hidden border border-white/10 bg-black/40 p-2 sm:p-3 shadow-2xl group"
        >
          <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-xl overflow-hidden bg-black/60">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt || "Article graphic"}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
          </div>
          {alt && (
            <figcaption className="mt-2.5 text-center text-xs font-mono text-gray-400">
              {alt}
            </figcaption>
          )}
        </figure>
      );
      i++;
      continue;
    }

    // Markdown Table
    if (line.includes("|") && line.trim().startsWith("|") && line.trim().endsWith("|")) {
      const tableLines: string[] = [];
      while (
        i < lines.length &&
        lines[i].includes("|") &&
        lines[i].trim().startsWith("|") &&
        lines[i].trim().endsWith("|")
      ) {
        tableLines.push(lines[i]);
        i++;
      }

      if (tableLines.length >= 2) {
        const headerRow = tableLines[0]
          .split("|")
          .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
          .map((c) => c.trim());

        const bodyRows = tableLines
          .slice(2) // skip separator row (---)
          .map((row) =>
            row
              .split("|")
              .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
              .map((c) => c.trim())
          );

        elements.push(
          <div
            key={`table-${i}`}
            className="my-8 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02]"
          >
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-white/[0.04] text-xs uppercase tracking-wider text-gray-400 font-mono border-b border-white/10">
                <tr>
                  {headerRow.map((h, hIdx) => (
                    <th key={hIdx} className="px-5 py-3 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {bodyRows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-white/[0.02] transition-colors">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-5 py-3.5 leading-normal">
                        {renderInline(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        continue;
      }
    }

    // Horizontal Rule
    if (line.trim() === "---") {
      elements.push(
        <hr
          key={`hr-${i}`}
          className="my-10 border-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent"
        />
      );
      i++;
      continue;
    }

    // Headings
    if (line.startsWith("## ")) {
      elements.push(
        <h2
          key={`h2-${i}`}
          className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-12 mb-4 pt-4 border-t border-white/[0.06] first:border-none first:pt-0"
        >
          {renderInline(line.replace("## ", ""))}
        </h2>
      );
      i++;
      continue;
    }

    if (line.startsWith("### ")) {
      elements.push(
        <h3
          key={`h3-${i}`}
          className="text-xl sm:text-2xl font-semibold tracking-tight text-white mt-8 mb-3 text-gray-100"
        >
          {renderInline(line.replace("### ", ""))}
        </h3>
      );
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      elements.push(
        <blockquote
          key={`quote-${i}`}
          className="my-6 pl-5 border-l-2 border-[#3594bd] bg-[#3594bd]/[0.04] py-3 pr-4 rounded-r-xl text-gray-300 italic text-sm sm:text-base leading-relaxed"
        >
          {renderInline(line.replace("> ", ""))}
        </blockquote>
      );
      i++;
      continue;
    }

    // Bullet List
    if (line.trim().startsWith("* ") || line.trim().startsWith("- ")) {
      const listItems: string[] = [];
      while (
        i < lines.length &&
        (lines[i].trim().startsWith("* ") || lines[i].trim().startsWith("- "))
      ) {
        listItems.push(lines[i].trim().replace(/^[\*\-]\s+/, ""));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="my-5 space-y-2.5 text-gray-300 text-sm sm:text-base">
          {listItems.map((item, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3594bd] mt-2 shrink-0 shadow-[0_0_8px_rgba(53,148,189,0.8)]" />
              <span className="leading-relaxed">{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Numbered List
    if (/^\d+\.\s/.test(line.trim())) {
      const listItems: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        listItems.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="my-5 space-y-3 text-gray-300 text-sm sm:text-base">
          {listItems.map((item, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-white/[0.06] text-[#3594bd] shrink-0 mt-0.5 border border-white/10">
                0{idx + 1}
              </span>
              <span className="leading-relaxed">{renderInline(item)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Standard Paragraph
    if (line.trim().length > 0) {
      elements.push(
        <p
          key={`p-${i}`}
          className="text-gray-300 text-base sm:text-lg leading-relaxed mb-5 font-light"
        >
          {renderInline(line)}
        </p>
      );
    }

    i++;
  }

  return <div className="markdown-body space-y-2">{elements}</div>;
}

// Inline helper for bold, code, links
function renderInline(text: string): React.ReactNode {
  // Regex parsing for inline code, bold, italic
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith("**") && token.endsWith("**")) {
      parts.push(
        <strong key={match.index} className="text-white font-semibold">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("`") && token.endsWith("`")) {
      parts.push(
        <code
          key={match.index}
          className="font-mono text-xs sm:text-sm px-1.5 py-0.5 rounded bg-white/[0.08] text-[#93c5fd] border border-white/10"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith("*") && token.endsWith("*")) {
      parts.push(
        <em key={match.index} className="text-gray-200 italic">
          {token.slice(1, -1)}
        </em>
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length === 0 ? text : parts;
}
