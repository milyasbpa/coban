import { Header } from "@/pwa/core/fragments/header";
import { LevelSection } from "@/pwa/features/home/fragments/level-section";
import { CategorySection } from "@/pwa/features/home/fragments/category-section";
import { FilterSection } from "@/pwa/features/home/fragments/filter-section";
import { KanjiListCTA } from "@/pwa/features/home/fragments/kanji-list-cta";
import { LessonsSection } from "@/pwa/features/home/fragments/lessons-section";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />

      <div className="px-4 py-6">
        {/* Level Section */}
        <LevelSection />

        {/* Category Section */}
        <CategorySection />

        {/* Filter Section */}
        <FilterSection />

        {/* Kanji List CTA */}
        <KanjiListCTA />

        {/* Lessons Section */}
        <LessonsSection />
      </div>
    </div>
  );
}
