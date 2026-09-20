"use client";
import React from "react";

interface FormattedTextProps {
  content: string;
  className?: string;
}

export function FormattedText({ content, className = "" }: FormattedTextProps) {
  if (!content) return null;

  // Pre-process text to fix common math/currency raw dollar unescaped artifacts
  // e.g. converting "$71$" or "$71.50$" to "$71" or "$71.50"
  let cleanText = content.replace(/\$(\d+(?:\.\d+)?)\$/g, "$$$1");
  
  // Clean up LaTeX single-dollar unescaped math expressions to clean inline math text if needed
  cleanText = cleanText.replace(/\\mathbb\{E\}/g, "E");
  cleanText = cleanText.replace(/\\sigma_p/g, "σ_p");
  cleanText = cleanText.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "($1 / $2)");
  cleanText = cleanText.replace(/\\sqrt\{([^}]+)\}/g, "√($1)");

  // Split into lines
  const lines = cleanText.split("\n");

  const renderFormattedLine = (line: string, index: number) => {
    // Header 3
    if (line.startsWith("### ")) {
      return (
        <h3 key={index} className="font-bold text-amber-950 text-sm mt-3 mb-1.5 flex items-center gap-1.5">
          {renderInlineFormatting(line.slice(4))}
        </h3>
      );
    }
    // Header 4
    if (line.startsWith("#### ")) {
      return (
        <h4 key={index} className="font-semibold text-amber-900 text-xs mt-2 mb-1">
          {renderInlineFormatting(line.slice(5))}
        </h4>
      );
    }
    // Bullet list items
    if (line.trim().startsWith("* ") || line.trim().startsWith("- ")) {
      const itemContent = line.trim().slice(2);
      return (
        <div key={index} className="flex items-start gap-2 my-1 pl-1">
          <span className="text-amber-600 font-bold text-sm leading-none mt-0.5">•</span>
          <span className="flex-1 text-xs text-[#1E1915] leading-relaxed">
            {renderInlineFormatting(itemContent)}
          </span>
        </div>
      );
    }
    // Numbered list items (e.g. 1. , 2. )
    const numMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      return (
        <div key={index} className="flex items-start gap-2 my-1 pl-1">
          <span className="text-amber-700 font-bold text-xs font-mono">{numMatch[1]}.</span>
          <span className="flex-1 text-xs text-[#1E1915] leading-relaxed">
            {renderInlineFormatting(numMatch[2])}
          </span>
        </div>
      );
    }
    // Empty lines
    if (!line.trim()) {
      return <div key={index} className="h-2" />;
    }
    // Standard paragraph
    return (
      <p key={index} className="my-1 text-xs leading-relaxed text-[#1E1915]">
        {renderInlineFormatting(line)}
      </p>
    );
  };

  const renderInlineFormatting = (text: string) => {
    if (!text) return null;
    const tokenRegex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\$[^$]+\$)/g;
    const tokens = text.split(tokenRegex);

    return tokens.map((part, idx) => {
      if (!part) return null;

      // Bold **text**
      if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
        return (
          <strong key={idx} className="font-extrabold text-amber-950">
            {part.slice(2, -2)}
          </strong>
        );
      }

      // Italic *text*
      if (part.startsWith("*") && part.endsWith("*") && part.length >= 2 && !part.startsWith("**")) {
        return (
          <em key={idx} className="italic text-stone-800">
            {part.slice(1, -1)}
          </em>
        );
      }

      // Code `code`
      if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
        return (
          <code
            key={idx}
            className="px-1.5 py-0.5 mx-0.5 rounded bg-amber-100/90 text-amber-900 font-mono text-[11px] border border-amber-300/60 font-semibold"
          >
            {part.slice(1, -1)}
          </code>
        );
      }

      // Math or currency $expr$
      if (part.startsWith("$") && part.endsWith("$") && part.length >= 2) {
        const expr = part.slice(1, -1);
        if (/^\d+(?:\.\d+)?$/.test(expr)) {
          return (
            <span key={idx} className="font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-1 py-0.5 rounded text-[11px] font-mono">
              ${expr}
            </span>
          );
        }
        return (
          <span key={idx} className="font-mono bg-amber-50 text-amber-900 px-1 py-0.5 rounded border border-amber-200 text-[11px]">
            {expr}
          </span>
        );
      }

      return <span key={idx}>{part}</span>;
    });
  };

  return <div className={`formatted-text-container ${className}`}>{lines.map(renderFormattedLine)}</div>;
}
