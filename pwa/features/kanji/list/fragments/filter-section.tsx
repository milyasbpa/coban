"use client";

import { Button } from "@/pwa/core/components/button";

interface FilterSectionProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function FilterSection({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: FilterSectionProps) {
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <span className="text-sm text-muted-foreground">Filter</span>
      
      <div className="flex gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(page)}
            className="h-8 w-8 p-0"
          >
            {page}
          </Button>
        ))}
      </div>
    </div>
  );
}