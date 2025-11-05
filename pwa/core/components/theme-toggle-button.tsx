"use client";

import { Sun, Moon } from "lucide-react";
import { Button } from "@/pwa/core/components/button";
import { useTheme } from "@/pwa/core/lib/hooks/use-theme";
import { cn } from "@/pwa/core/lib/utils";

interface ThemeToggleButtonProps {
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
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

/**
 * Reusable theme toggle button component
 * Switches between light and dark mode using Sun/Moon icons
 */
export function ThemeToggleButton({ 
  className,
  size = "icon",
  variant = "ghost"
}: ThemeToggleButtonProps) {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        "rounded-full h-8 w-8 p-0 hover:bg-accent/20 transition-colors",
        className
      )}
      onClick={() => toggleTheme()}
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      {isDarkMode ? (
        <Sun className="w-5 h-5 text-foreground" />
      ) : (
        <Moon className="w-5 h-5 text-foreground" />
      )}
    </Button>
  );
}