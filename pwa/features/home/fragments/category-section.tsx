"use client";

import { useState } from "react";
import { Badge } from "@/pwa/core/components/badge";
import { getLevelData } from "@/pwa/features/home/utils/levels";
import { CategoryButton } from "../components/category-button";

export function CategorySection() {
  const levelData = getLevelData();
  const [selectedCategoryId, setSelectedCategoryId] = useState(levelData.categories[0]?.id || "kanji");

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
  };

  return (
    <div className="text-center mb-8">
      <Badge
        variant="secondary"
        className="mb-6 px-6 py-2 text-sm font-medium"
        style={{
          backgroundColor: "var(--character-dark)",
          color: "var(--foreground)",
        }}
      >
        Category
      </Badge>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {levelData.categories.map((category) => (
          <CategoryButton
            key={category.id}
            category={category}
            isActive={selectedCategoryId === category.id}
            onClick={handleCategoryClick}
          />
        ))}
      </div>
    </div>
  );
}