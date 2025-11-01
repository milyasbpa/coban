"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/pwa/core/components/badge";
import { getLevelData } from "@/pwa/features/home/utils/levels";
import { CategoryButton } from "../components/category-button";
import { useHomeSettingsStore } from "../store/home-settings.store";

export function CategorySection() {
  const levelData = getLevelData();
  const { selectedCategory, setSelectedCategory } = useHomeSettingsStore();
  
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    selectedCategory || levelData.categories[0]?.id || "kanji"
  );

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedCategory(categoryId); // Persist to store
  };

  // Sync with persisted state on mount
  useEffect(() => {
    if (selectedCategory && selectedCategory !== selectedCategoryId) {
      setSelectedCategoryId(selectedCategory);
    }
  }, [selectedCategory, selectedCategoryId]);

  return (
    <div className="text-center mb-8">
      <Badge variant="secondary" className="mb-6 px-6 py-2 text-sm font-medium">
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
