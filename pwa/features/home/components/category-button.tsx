import { Button } from "@/pwa/core/components/button";
import { Badge } from "@/pwa/core/components/badge";
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
        variant={isActive ? "secondary" : "outline"}
        size="icon"
        className="w-16 h-16 rounded-full mb-2 border-2 shadow-lg text-2xl font-bold"
        onClick={() => onClick?.(category.id)}
      >
        {category.icon}
      </Button>
      {isActive ? (
        <Badge variant="secondary" className="text-xs font-medium">
          {category.name}
        </Badge>
      ) : (
        <span className="text-sm font-medium text-muted-foreground block">
          {category.name}
        </span>
      )}
    </div>
  );
}