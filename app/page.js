import RelationshipChronometer from "@/components/RelationshipChronometer";

const COUPLE_NAMES = "Enes & Efsa";

export default function HomePage() {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-6.5rem)] w-full max-w-5xl flex-col justify-center py-1 sm:py-4 md:min-h-[calc(100vh-4rem)]">
      {/* 1. Hero Title & Quote */}
      <div className="relative text-center px-3 pt-2 pb-5 sm:pt-4 sm:pb-7">
        {/* Ambient Glow */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-72 w-72 rounded-full bg-amberGold/10 blur-[100px]" />

        {/* Main Serif Heading */}
        <h1 className="font-serif text-5xl font-normal tracking-tight text-parchment-50 sm:text-7xl lg:text-8xl">
          {COUPLE_NAMES}
        </h1>

        {/* Poetic Romantic Quote */}
        <p className="mx-auto mt-3 max-w-2xl font-handwriting text-2xl leading-relaxed text-amberGold-light sm:mt-4 sm:text-3xl">
          “Seninle konuşabilecek kadar heybetli değildi belki kelimelerim; ama ruhunu yerinden sallayacak kadar derindi hissettiklerim.”
        </p>
      </div>

      {/* 2. Unified Master Chronometer Card (Isolated Leaf Timer) */}
      <RelationshipChronometer />
    </section>
  );
}
