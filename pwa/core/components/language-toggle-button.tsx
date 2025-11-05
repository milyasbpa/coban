"use client";

import { Button } from "@/pwa/core/components/button";
import { useLanguage } from "@/pwa/core/lib/hooks/use-language";
import { cn } from "@/pwa/core/lib/utils";
import ReactCountryFlag from "react-country-flag";

interface LanguageToggleButtonProps {
  /**
   * Additional CSS classes to apply to the button
   */
  className?: string;
  /**
   * Button size variant
   * @default "icon"
   */
  size?: "default" | "sm" | "lg" | "icon";
  /**
   * Button variant
   * @default "ghost"
   */
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
}

/**
 * Reusable language toggle button component
 * Switches between Indonesian and English using country flags
 */
export function LanguageToggleButton({
  className,
  size = "icon",
  variant = "ghost",
}: LanguageToggleButtonProps) {
  const { language, toggleLanguage } = useLanguage();

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        "rounded-full h-8 w-8 p-0 hover:bg-accent/20 transition-colors",
        className
      )}
      onClick={toggleLanguage}
      aria-label={`Switch to ${language === "en" ? "English" : "Indonesian"}`}
    >
      <div className="border border-border rounded-sm overflow-hidden">
        <ReactCountryFlag
          countryCode={language === "id" ? "ID" : "US"}
          svg
          className="w-[20px] h-[15px] block"
        />
      </div>
    </Button>
  );
}
