"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, ExternalLink } from "lucide-react";

interface FormattedChatMessageProps {
  content: string;
  isAssistant?: boolean;
}

/**
 * Parses inline formatting: **bold**, `code`, and markdown links [text](url).
 */
function parseInline(text: string): React.ReactNode[] {
  // Regex to match markdown links: [label](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = linkRegex.exec(text)) !== null) {
    const textBefore = text.slice(lastIndex, match.index);
    if (textBefore) {
      nodes.push(...parseBoldAndCode(textBefore));
    }

    const label = match[1];
    const url = match[2];
    const isInternal = url.startsWith("/") || url.startsWith("#");

    if (isInternal) {
      nodes.push(
        <Link
          key={`link-${match.index}`}
          href={url}
          className="inline-flex items-center gap-1 mx-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-primary-600/10 dark:bg-primary-400/15 text-primary-700 dark:text-primary-300 border border-primary-300/60 dark:border-primary-700/60 hover:bg-primary-600/20 hover:scale-[1.02] transition-all shadow-xs align-middle"
        >
          <span>{label}</span>
          <ArrowUpRight className="w-3 h-3 shrink-0" />
        </Link>
      );
    } else {
      nodes.push(
        <a
          key={`ext-${match.index}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 mx-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-primary-600/10 dark:bg-primary-400/15 text-primary-700 dark:text-primary-300 border border-primary-300/60 dark:border-primary-700/60 hover:bg-primary-600/20 hover:scale-[1.02] transition-all shadow-xs align-middle"
        >
          <span>{label}</span>
          <ExternalLink className="w-3 h-3 shrink-0" />
        </a>
      );
    }

    lastIndex = linkRegex.lastIndex;
  }

  const remaining = text.slice(lastIndex);
  if (remaining) {
    nodes.push(...parseBoldAndCode(remaining));
  }

  return nodes;
}

/**
 * Parses **bold** and `code` tokens within plain text.
 */
function parseBoldAndCode(text: string): React.ReactNode[] {
  // Split by bold (**...**) and code (`...`)
  const tokenRegex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      const boldText = part.slice(2, -2);
      return (
        <strong key={`b-${index}`} className="font-bold text-text-primary dark:text-white">
          {boldText}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
      const codeText = part.slice(1, -1);
      return (
        <code
          key={`c-${index}`}
          className="px-1.5 py-0.5 rounded bg-surface border border-border text-xs font-mono text-primary-600 dark:text-primary-400"
        >
          {codeText}
        </code>
      );
    }
    return part;
  });
}

/**
 * Clean and modern formatted message component for the AI Chat widget.
 * Converts markdown syntax (headings, bullet points, bold tags, numbered items, and links)
 * into structured, polished UI elements.
 */
export function FormattedChatMessage({ content, isAssistant = true }: FormattedChatMessageProps) {
  if (!isAssistant) {
    return <span>{content}</span>;
  }

  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) {
      elements.push(<div key={`empty-${i}`} className="h-2" />);
      continue;
    }

    // Horizontal Rule
    if (line === "---" || line === "***") {
      elements.push(<hr key={`hr-${i}`} className="my-2 border-border-light dark:border-border" />);
      continue;
    }

    // Headings: ### or ## or #
    if (line.startsWith("### ") || line.startsWith("## ") || line.startsWith("# ")) {
      const headingText = line.replace(/^#+\s*/, "");
      elements.push(
        <div
          key={`h-${i}`}
          className="font-bold text-primary-700 dark:text-primary-400 text-sm mt-2 mb-1 flex items-center gap-1.5"
        >
          {parseInline(headingText)}
        </div>
      );
      continue;
    }

    // Bullet List Items (*, -, •)
    if (/^[*•-]\s+/.test(line)) {
      const itemText = line.replace(/^[*•-]\s+/, "");
      elements.push(
        <div key={`bullet-${i}`} className="flex items-start gap-2 my-1 leading-relaxed">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-500 dark:bg-primary-400 mt-2 shrink-0" />
          <div className="flex-1">{parseInline(itemText)}</div>
        </div>
      );
      continue;
    }

    // Numbered List Items (1. 2. 3.)
    const numMatch = line.match(/^(\d+)[.)]\s+(.*)$/);
    if (numMatch) {
      const num = numMatch[1];
      const itemText = numMatch[2];
      elements.push(
        <div key={`num-${i}`} className="flex items-start gap-2 my-1 leading-relaxed">
          <span className="font-bold text-xs px-1.5 py-0.5 rounded-md bg-primary-100 dark:bg-primary-900/60 text-primary-700 dark:text-primary-300 shrink-0 mt-0.5">
            {num}
          </span>
          <div className="flex-1">{parseInline(itemText)}</div>
        </div>
      );
      continue;
    }

    // Regular Paragraph
    elements.push(
      <p key={`p-${i}`} className="my-1 leading-relaxed">
        {parseInline(rawLine)}
      </p>
    );
  }

  return <div className="space-y-0.5 text-sm">{elements}</div>;
}
