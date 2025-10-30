"use client";

import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/pwa/core/components/radio-group";

type FilterType = "all" | "completed" | "uncompleted";

interface FilterOption {
  id: FilterType;
  label: string;
}

const filterOptions: FilterOption[] = [
  { id: "all", label: "All" },
  { id: "completed", label: "Completed" },
  { id: "uncompleted", label: "Uncompleted" },
];

export function FilterSection() {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");

  return (
    <div className="flex w-full justify-center gap-4 mb-6 px-4">
      <RadioGroup
        value={selectedFilter}
        onValueChange={(value) => setSelectedFilter(value as FilterType)}
        className="flex gap-4"
      >
        {filterOptions.map((option) => (
          <label
            key={option.id}
            className="flex items-center gap-2 cursor-pointer"
          >
            <RadioGroupItem value={option.id} className="accent-primary" />
            <span
              className={`font-medium ${
                selectedFilter === option.id 
                  ? "text-foreground" 
                  : "text-muted-foreground"
              }`}
            >
              {option.label}
            </span>
          </label>
        ))}
      </RadioGroup>
    </div>
  );
}