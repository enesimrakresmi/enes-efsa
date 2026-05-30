"use client";

import { useMemo, useState } from "react";
import EmojiText from "@/components/EmojiText";

export default function ExpandableText({ text, limit = 260, className = "" }) {
  const [expanded, setExpanded] = useState(false);
  const safeText = typeof text === "string" ? text : "";
  const shouldClamp = safeText.length > limit;

  const visibleText = useMemo(() => {
    if (!shouldClamp || expanded) return safeText;
    return `${safeText.slice(0, limit).trimEnd()}...`;
  }, [expanded, limit, safeText, shouldClamp]);

  return (
    <div>
      <p className={`emoji-safe whitespace-pre-wrap break-words [overflow-wrap:anywhere] ${className}`}>
        <EmojiText>{visibleText}</EmojiText>
      </p>
      {shouldClamp && (
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="focus-ring mt-3 text-sm font-medium text-roseSoft transition hover:text-[#aac7ff]"
        >
          {expanded ? "Kısalt" : "Devamını oku"}
        </button>
      )}
    </div>
  );
}
