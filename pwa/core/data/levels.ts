import levelsData from "@/data/levels/levels.json";
import type { Level, Category } from "@/types/kanji";

export const levels: Level[] = levelsData.levels;
export const categories: Category[] = levelsData.categories;

// Helper functions
export const getLevelData = () => levelsData;
