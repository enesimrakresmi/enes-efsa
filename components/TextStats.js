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
    <div className="mt-2 flex flex-wrap items-center gap-2 font-serif text-xs text-parchment-400">
      <span className="italic">{label}</span>
      <span className="h-1 w-1 rounded-full bg-amberGold/40" />
      <span>{stats.characters} karakter</span>
      <span className="h-1 w-1 rounded-full bg-amberGold/40" />
      <span>{stats.words} kelime</span>
    </div>
  );
}
