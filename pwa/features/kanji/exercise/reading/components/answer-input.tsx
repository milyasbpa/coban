"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/pwa/core/components/button";
import { Input } from "@/pwa/core/components/input";
import { cn } from "@/pwa/core/lib/utils";
import * as wanakana from "wanakana";
import { ReadingOption, getCompositeId } from "../utils/reading-game";

interface AnswerInputProps {
  mode: "multiple-choice" | "direct-input";
  options: ReadingOption[];  // Changed to ReadingOption
  selectedOption: ReadingOption | null;  // Changed to ReadingOption
  directInput: string;
  onOptionSelect: (option: ReadingOption) => void;  // Changed to ReadingOption
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
  disabled = false,
}: AnswerInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Setup WanaKana for hiragana input
  useEffect(() => {
    if (mode === "direct-input" && inputRef.current) {
      // Bind WanaKana to input for automatic hiragana conversion
      wanakana.bind(inputRef.current, {
        IMEMode: true, // Enable IME mode for better Japanese input
        useObsoleteKana: false, // Don't use obsolete kana
      });

      // Cleanup on unmount
      return () => {
        if (inputRef.current) {
          wanakana.unbind(inputRef.current);
        }
      };
    }
  }, [mode]);

  if (mode === "multiple-choice") {
    return (
      <div className="space-y-3">
        {options.map((option, index) => {
          const isSelected = selectedOption && getCompositeId(selectedOption) === getCompositeId(option);
          const optionLabel = String.fromCharCode(65 + index); // A, B, C, D
          return (
            <Button
              key={`${option.word}-${option.furigana}-${index}`}
              variant="outline"
              className={cn(
                "w-full h-16 text-left justify-start text-lg transition-colors",
                isSelected 
                  ? "border-primary bg-primary/10 dark:border-primary dark:bg-primary/20" 
                  : "hover:bg-accent dark:hover:bg-accent"
              )}
              onClick={() => onOptionSelect(option)}
              disabled={disabled}
            >
              <span className={cn(
                "px-2 py-1 flex items-center justify-center mr-4 text-sm font-medium",
                "bg-muted text-foreground dark:bg-muted dark:text-foreground"
              )}>
                {optionLabel}
              </span>
              {option.furigana}
            </Button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Input
        ref={inputRef}
        placeholder="Type the reading here..."
        value={directInput}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onInputChange(e.target.value)
        }
        disabled={disabled}
        className="h-16 text-lg text-center"
        autoComplete="off"
        spellCheck={false}
      />
    </div>
  );
}
