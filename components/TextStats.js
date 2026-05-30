"use client";

function getStats(value) {
  const text = value || "";
  const trimmed = text.trim();
  const words = trimmed ? trimmed.split(/\s+/).length : 0;
  return {
    characters: text.length,
    words
  };
}

export default function TextStats({ value, label = "Metin" }) {
  const stats = getStats(value);

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
      <span>{label}</span>
      <span className="h-1 w-1 rounded-full bg-gray-700" />
      <span>{stats.characters} karakter</span>
      <span className="h-1 w-1 rounded-full bg-gray-700" />
      <span>{stats.words} kelime</span>
    </div>
  );
}
