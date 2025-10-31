"use client";

import { Button } from "@/pwa/core/components/button";
import { Input } from "@/pwa/core/components/input";
import { cn } from "@/pwa/core/lib/utils";

interface AnswerInputProps {
  mode: "multiple-choice" | "direct-input";
  options: string[];
  selectedOption: string;
  directInput: string;
  onOptionSelect: (option: string) => void;
  onInputChange: (value: string) => void;
  disabled?: boolean;
}

export function AnswerInput({
  mode,
  options,
  selectedOption,
  directInput,
  onOptionSelect,
  onInputChange,
  disabled = false
}: AnswerInputProps) {
  if (mode === "multiple-choice") {
    return (
      <div className="space-y-3">
        {options.map((option, index) => (
          <Button
            key={option}
            variant="outline"
            className={cn(
              "w-full h-16 text-left justify-start text-lg",
              selectedOption === option && "border-primary bg-primary/10"
            )}
            onClick={() => onOptionSelect(option)}
            disabled={disabled}
          >
            <span className="bg-yellow-400 text-black rounded-full w-8 h-8 flex items-center justify-center mr-4 text-sm font-bold">
              {index + 1}
            </span>
            {option}
          </Button>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Type the reading here..."
        value={directInput}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onInputChange(e.target.value)}
        disabled={disabled}
        className="h-16 text-lg text-center"
      />
    </div>
  );
}