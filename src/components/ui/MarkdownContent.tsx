"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, Info, AlertCircle, Quote, Film, Music2 } from "lucide-react";
import { YouTubeEmbed } from "./YouTubeEmbed";
import { SmartLinkPreview } from "./SmartLinkPreview";
import { RichImageEmbed } from "./RichImageEmbed";

interface MarkdownContentProps {
  content: string;
  className?: string;
  isRtl?: boolean;
}

// ─── URL & Media Detection Helpers ─────────────────────────────────────
function extractYouTubeId(url: string): string | null {
  try {
    const reg = /(?:youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;
    const match = url.match(reg);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

function isImageUrl(url: string): boolean {
  return /\.(jpeg|jpg|png|webp|gif|svg)(\?.*)?$/i.test(url);
}

function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
}

function isAudioUrl(url: string): boolean {
  return /\.(mp3|wav|m4a|aac)(\?.*)?$/i.test(url);
}

function isStandaloneUrl(text: string): boolean {
  return /^https?:\/\/[^\s]+$/i.test(text.trim());
}

// ─── Inline Formatter ──────────────────────────────────────────────────
function renderInline(text: string): React.ReactNode[] {
  // Pattern to match:
  // 1. Links: [text](url)
  // 2. Bold: **text** or __text__
  // 3. Italic: *text* or _text_
  // 4. Inline code: `code`
  // 5. Strikethrough: ~~text~~
  const regex = /(\[.*?\]\(.*?\)|\*\*.*?\*\*|__.*?__|(?<!\*)\*.*?\*(?!\*)|(?<!_)_.*?_(?!_)|`.*?`|~~.*?~~)/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Link: [text](url)
    const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
    if (linkMatch) {
      const [, linkText, url] = linkMatch;
      return (
        <a
          key={index}
          href={url}
          target={url.startsWith("http") ? "_blank" : undefined}
          rel={url.startsWith("http") ? "noopener noreferrer" : undefined}
          className="text-amber-600 dark:text-amber-400 font-semibold underline underline-offset-4 decoration-amber-500/40 hover:decoration-amber-500 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
        >
          {linkText}
        </a>
      );
    }

    // Bold: **text** or __text__
    if ((part.startsWith("**") && part.endsWith("**")) || (part.startsWith("__") && part.endsWith("__"))) {
      const inner = part.slice(2, -2);
      return (
        <strong
          key={index}
          className="font-bold text-slate-900 dark:text-white px-0.5 tracking-tight"
        >
          {inner}
        </strong>
      );
    }

    // Inline code: `code`
    if (part.startsWith("`") && part.endsWith("`")) {
      const inner = part.slice(1, -1);
      return (
        <code
          key={index}
          className="px-2 py-0.5 rounded-lg bg-amber-500/10 dark:bg-amber-400/10 text-amber-700 dark:text-amber-300 font-mono text-xs border border-amber-500/20"
        >
          {inner}
        </code>
      );
    }

    // Strikethrough: ~~text~~
    if (part.startsWith("~~") && part.endsWith("~~")) {
      const inner = part.slice(2, -2);
      return (
        <del key={index} className="line-through text-slate-400 dark:text-slate-500">
          {inner}
        </del>
      );
    }

    // Italic: *text* or _text_
    if ((part.startsWith("*") && part.endsWith("*")) || (part.startsWith("_") && part.endsWith("_"))) {
      const inner = part.slice(1, -1);
      return (
        <em key={index} className="italic text-slate-800 dark:text-slate-200">
          {inner}
        </em>
      );
    }

    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

// ─── Block Parser ──────────────────────────────────────────────────────
type Block =
  | { type: "h1"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "h4"; text: string }
  | { type: "blockquote"; text: string; alertType?: "info" | "tip" | "warning" }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "hr" }
  | { type: "code"; code: string; lang?: string }
  | { type: "youtube"; videoId: string; url: string }
  | { type: "image"; src: string; alt?: string; caption?: string }
  | { type: "video"; src: string }
  | { type: "audio"; src: string }
  | { type: "link-preview"; url: string }
  | { type: "p"; text: string };

function parseBlocks(markdown: string): Block[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];

  let i = 0;
  while (i < lines.length) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // Skip empty lines
    if (!line) {
      i++;
      continue;
    }

    // Code blocks: ```language
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      blocks.push({ type: "code", code: codeLines.join("\n"), lang });
      i++;
      continue;
    }

    // Horizontal Rule: --- or ***
    if (/^(\*{3,}|-{3,}|_{3,})$/.test(line)) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }

    // Headers
    if (line.startsWith("#### ")) {
      blocks.push({ type: "h4", text: line.slice(5).trim() });
      i++;
      continue;
    }
    if (line.startsWith("### ")) {
      blocks.push({ type: "h3", text: line.slice(4).trim() });
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      blocks.push({ type: "h2", text: line.slice(3).trim() });
      i++;
      continue;
    }
    if (line.startsWith("# ")) {
      blocks.push({ type: "h1", text: line.slice(2).trim() });
      i++;
      continue;
    }

    // Blockquote: > text
    if (line.startsWith(">")) {
      const quoteLines: string[] = [];
      let alertType: "info" | "tip" | "warning" | undefined = undefined;

      while (i < lines.length && lines[i].trim().startsWith(">")) {
        let content = lines[i].trim().slice(1).trim();
        if (content.startsWith("[!NOTE]") || content.startsWith("[!INFO]")) {
          alertType = "info";
          content = content.replace(/^\[!(NOTE|INFO)\]/i, "").trim();
        } else if (content.startsWith("[!TIP]")) {
          alertType = "tip";
          content = content.replace(/^\[!TIP\]/i, "").trim();
        } else if (content.startsWith("[!WARNING]") || content.startsWith("[!CAUTION]")) {
          alertType = "warning";
          content = content.replace(/^\[!(WARNING|CAUTION)\]/i, "").trim();
        }
        if (content) quoteLines.push(content);
        i++;
      }
      blocks.push({ type: "blockquote", text: quoteLines.join(" "), alertType });
      continue;
    }

    // Markdown Image: ![alt](url)
    const imgMatch = line.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (imgMatch) {
      blocks.push({ type: "image", alt: imgMatch[1], src: imgMatch[2], caption: imgMatch[1] });
      i++;
      continue;
    }

    // Standalone URL on its own line: YouTube, Image, Video, Audio, or Smart Link Preview
    const cleanUrl = line.replace(/^<|>$/g, "").trim();
    if (isStandaloneUrl(cleanUrl)) {
      const ytId = extractYouTubeId(cleanUrl);
      if (ytId) {
        blocks.push({ type: "youtube", videoId: ytId, url: cleanUrl });
        i++;
        continue;
      }
      if (isImageUrl(cleanUrl)) {
        blocks.push({ type: "image", src: cleanUrl });
        i++;
        continue;
      }
      if (isVideoUrl(cleanUrl)) {
        blocks.push({ type: "video", src: cleanUrl });
        i++;
        continue;
      }
      if (isAudioUrl(cleanUrl)) {
        blocks.push({ type: "audio", src: cleanUrl });
        i++;
        continue;
      }
      // Any other website link -> Rich WhatsApp/Twitter style Link Preview Card
      blocks.push({ type: "link-preview", url: cleanUrl });
      i++;
      continue;
    }

    // Unordered List: - item or * item
    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ""));
        i++;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    // Ordered List: 1. item
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
        i++;
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    // Normal Paragraph — group subsequent lines until empty line or special block
    const pLines: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith("#") &&
      !lines[i].trim().startsWith(">") &&
      !lines[i].trim().startsWith("```") &&
      !lines[i].trim().startsWith("![") &&
      !isStandaloneUrl(lines[i].trim().replace(/^<|>$/g, "")) &&
      !/^[-*]\s+/.test(lines[i].trim()) &&
      !/^\d+\.\s+/.test(lines[i].trim()) &&
      !/^(\*{3,}|-{3,}|_{3,})$/.test(lines[i].trim())
    ) {
      pLines.push(lines[i].trim());
      i++;
    }
    blocks.push({ type: "p", text: pLines.join(" ") });
  }

  return blocks;
}

// ─── Component ─────────────────────────────────────────────────────────
export function MarkdownContent({ content, className, isRtl = true }: MarkdownContentProps) {
  const blocks = useMemo(() => parseBlocks(content || ""), [content]);

  return (
    <div
      className={cn(
        "space-y-6 text-slate-700 dark:text-slate-300 font-normal leading-relaxed text-base sm:text-lg transition-colors duration-200",
        isRtl ? "text-right" : "text-left",
        className
      )}
    >
      {blocks.map((block, idx) => {
        switch (block.type) {
          case "h1":
            return (
              <h1
                key={idx}
                className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white pt-6 pb-2 border-b border-slate-200 dark:border-white/10 tracking-tight"
              >
                {renderInline(block.text)}
              </h1>
            );

          case "h2":
            return (
              <h2
                key={idx}
                className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white pt-6 pb-1 flex items-center gap-3 tracking-tight group"
              >
                <span className="w-2.5 h-7 rounded-full bg-gradient-to-b from-amber-500 to-amber-600 shadow-sm shrink-0" />
                <span>{renderInline(block.text)}</span>
              </h2>
            );

          case "h3":
            return (
              <div
                key={idx}
                className="pt-6 pb-2"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-5 rounded-full bg-amber-500 dark:bg-amber-400 shrink-0" />
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {renderInline(block.text)}
                  </h3>
                </div>
              </div>
            );

          case "h4":
            return (
              <h4
                key={idx}
                className="text-base sm:text-lg font-bold text-slate-900 dark:text-white pt-4 pb-1"
              >
                {renderInline(block.text)}
              </h4>
            );

          case "ul":
            return (
              <ul key={idx} className="space-y-3 my-4 ps-2">
                {block.items.map((item, itemIdx) => (
                  <li
                    key={itemIdx}
                    className="flex items-start gap-3 group"
                  >
                    <span className="mt-2 w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400 shrink-0 shadow-xs group-hover:scale-125 transition-transform" />
                    <span className="flex-1 leading-relaxed text-slate-800 dark:text-slate-200">
                      {renderInline(item)}
                    </span>
                  </li>
                ))}
              </ul>
            );

          case "ol":
            return (
              <ol key={idx} className="space-y-3.5 my-4 ps-2">
                {block.items.map((item, itemIdx) => (
                  <li
                    key={itemIdx}
                    className="flex items-start gap-3 group"
                  >
                    <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-amber-500/10 dark:bg-amber-400/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 font-bold text-xs shrink-0 mt-0.5 shadow-xs">
                      {itemIdx + 1}
                    </span>
                    <span className="flex-1 leading-relaxed text-slate-800 dark:text-slate-200">
                      {renderInline(item)}
                    </span>
                  </li>
                ))}
              </ol>
            );

          case "blockquote": {
            const isAlert = Boolean(block.alertType);
            return (
              <div
                key={idx}
                className={cn(
                  "relative my-6 p-5 sm:p-6 rounded-2xl border transition-all shadow-xs",
                  isAlert && block.alertType === "info" && "bg-blue-500/5 dark:bg-blue-500/10 border-blue-500/30 text-blue-900 dark:text-blue-200",
                  isAlert && block.alertType === "tip" && "bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200",
                  isAlert && block.alertType === "warning" && "bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200",
                  !isAlert && "bg-slate-100/70 dark:bg-white/[0.04] border-slate-200 dark:border-white/10 border-s-4 border-s-amber-500 dark:border-s-amber-400"
                )}
              >
                <div className="flex items-start gap-3">
                  {!isAlert ? (
                    <Quote className="w-5 h-5 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5 opacity-80" />
                  ) : block.alertType === "tip" ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  ) : block.alertType === "warning" ? (
                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  ) : (
                    <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 italic font-medium leading-relaxed">
                    {renderInline(block.text)}
                  </div>
                </div>
              </div>
            );
          }

          case "youtube":
            return (
              <YouTubeEmbed
                key={idx}
                videoId={block.videoId}
                url={block.url}
                isRtl={isRtl}
              />
            );

          case "image":
            return (
              <RichImageEmbed
                key={idx}
                src={block.src}
                alt={block.alt}
                caption={block.caption}
                isRtl={isRtl}
              />
            );

          case "link-preview":
            return (
              <SmartLinkPreview
                key={idx}
                url={block.url}
                isRtl={isRtl}
              />
            );

          case "video":
            return (
              <div
                key={idx}
                className="my-8 rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-xl bg-slate-950"
              >
                <div className="p-3 bg-slate-900 border-b border-slate-800 text-xs text-white/80 flex items-center gap-2">
                  <Film className="w-4 h-4 text-amber-500" />
                  <span>{isRtl ? "مقطع فيديو" : "Video"}</span>
                </div>
                <video
                  src={block.src}
                  controls
                  preload="metadata"
                  className="w-full max-h-[500px]"
                />
              </div>
            );

          case "audio":
            return (
              <div
                key={idx}
                className="my-6 p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] shadow-md flex items-center gap-4"
              >
                <span className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Music2 className="w-5 h-5" />
                </span>
                <audio src={block.src} controls className="w-full" />
              </div>
            );

          case "code":
            return (
              <div
                key={idx}
                className="my-5 rounded-2xl overflow-hidden bg-slate-900 text-slate-100 dark:bg-[#060b18] border border-slate-800 dark:border-white/10 shadow-lg"
              >
                {block.lang && (
                  <div className="px-4 py-2 bg-slate-800/80 dark:bg-white/5 text-xs font-mono text-slate-400 flex items-center justify-between border-b border-slate-700/50">
                    <span>{block.lang}</span>
                  </div>
                )}
                <pre className="p-4 sm:p-5 font-mono text-xs sm:text-sm overflow-x-auto leading-relaxed">
                  <code>{block.code}</code>
                </pre>
              </div>
            );

          case "hr":
            return (
              <hr
                key={idx}
                className="my-8 border-slate-200 dark:border-white/10"
              />
            );

          case "p":
          default:
            return (
              <p
                key={idx}
                className="leading-relaxed text-slate-700 dark:text-slate-300 text-base sm:text-lg"
              >
                {renderInline(block.text)}
              </p>
            );
        }
      })}
    </div>
  );
}
