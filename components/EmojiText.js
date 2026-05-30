"use client";

import { useMemo, useState } from "react";

const EMOJI_ASSET_BASE =
  "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg";

const emojiLikeRegex =
  /[\p{Extended_Pictographic}\p{Regional_Indicator}\u2600-\u27bf]/u;

function splitGraphemes(value) {
  if (typeof Intl !== "undefined" && Intl.Segmenter) {
    const segmenter = new Intl.Segmenter("tr", { granularity: "grapheme" });
    return Array.from(segmenter.segment(value), (part) => part.segment);
  }

  return Array.from(value);
}

function toTwemojiCodepoint(grapheme) {
  return Array.from(grapheme)
    .map((char) => char.codePointAt(0))
    .filter((codepoint) => codepoint && codepoint !== 0xfe0f)
    .map((codepoint) => codepoint.toString(16))
    .join("-");
}

function EmojiImage({ value }) {
  const [failed, setFailed] = useState(false);
  const codepoint = toTwemojiCodepoint(value);

  if (!codepoint || failed) return value;

  return (
    <img
      src={`${EMOJI_ASSET_BASE}/${codepoint}.svg`}
      alt={value}
      loading="lazy"
      decoding="async"
      draggable="false"
      onError={() => setFailed(true)}
      className="emoji-inline"
    />
  );
}

export default function EmojiText({ children }) {
  const text = typeof children === "string" ? children : String(children ?? "");

  const parts = useMemo(() => splitGraphemes(text), [text]);

  return parts.map((part, index) =>
    emojiLikeRegex.test(part) ? (
      <EmojiImage key={`${part}-${index}`} value={part} />
    ) : (
      <span key={`${part}-${index}`}>{part}</span>
    )
  );
}
