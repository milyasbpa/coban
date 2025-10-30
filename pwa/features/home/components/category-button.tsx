import { Button } from "@/pwa/core/components/button";
import type { Category } from "@/types/kanji";

interface CategoryButtonProps {
  category: Category;
  isActive?: boolean;
  onClick?: (categoryId: string) => void;
}

export function CategoryButton({ category, isActive = false, onClick }: CategoryButtonProps) {
  return (
    <div className="text-center">
      <Button
        variant={isActive ? "default" : "outline"}
        size="icon"
        className="w-16 h-16 rounded-full mb-2 border-2 shadow-lg text-2xl font-bold"
        onClick={() => onClick?.(category.id)}
      >
        {category.icon}
      </Button>
      <span 
        className={`text-sm font-medium block ${
          isActive ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        {category.name}
      </span>
    </div>
  );
}