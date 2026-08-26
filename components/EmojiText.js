"use client";

// High-performance, offline-ready native emoji wrapper
export default function EmojiText({ children }) {
  if (!children) return null;
  return <span className="emoji-safe">{children}</span>;
}
