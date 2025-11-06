"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/pwa/core/components/button";
import { Input } from "@/pwa/core/components/input";
import { cn } from "@/pwa/core/lib/utils";
import * as wanakana from "wanakana";
import { KanjiExample } from "@/pwa/core/services/kanji";

interface AnswerInputProps {
  mode: "multiple-choice" | "direct-input";
  options: KanjiExample[];  // Changed from string[] to KanjiExample[]
  selectedOption: KanjiExample | null;  // Changed from string to KanjiExample | null
  directInput: string;
  onOptionSelect: (option: KanjiExample) => void;  // Changed parameter type
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
        {options.map((option, index) => (
          <Button
            key={option.id}
            variant="outline"
            className={cn(
              "w-full h-16 text-left justify-start text-lg",
              selectedOption?.id === option.id && "border-primary bg-primary/10"
            )}
            onClick={() => onOptionSelect(option)}
            disabled={disabled}
          >
            <span className="bg-yellow-400 text-black rounded-full w-8 h-8 flex items-center justify-center mr-4 text-sm font-bold">
              {index + 1}
            </span>
            {option.furigana}
          </Button>
        ))}
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
