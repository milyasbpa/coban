"use client";

import { useEffect } from "react";

/**
 * Custom hook to automatically save and restore scroll position
 * Uses localStorage to persist scroll state across page navigations
 * 
 * @param storageKey - Unique key to identify scroll position in localStorage
 *                     Example: 'kanji-scroll-1-N5' or 'vocabulary-scroll-34-N4'
 * 
 * Usage:
 * ```typescript
 * export function LessonContainer() {
 *   const lessonId = searchParams.get("lessonId");
 *   const level = searchParams.get("level");
 *   
 *   // Auto-save and restore scroll position
 *   useScrollRestoration(`kanji-scroll-${lessonId}-${level}`);
 *   
 *   // ... rest of component
 * }
 * ```
 */
export function useScrollRestoration(storageKey: string) {
  // Save scroll position on scroll
  useEffect(() => {
    if (!storageKey) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      localStorage.setItem(storageKey, scrollY.toString());
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [storageKey]);

  // Restore scroll position on mount
  useEffect(() => {
    if (!storageKey) return;

    const savedScroll = localStorage.getItem(storageKey);
    if (savedScroll) {
      // Delay to ensure DOM is fully rendered
      // Offset to account for sticky header (56px = h-14) + selection nav (if visible)
      const offset = 180; // Adjust this value to control how much higher
      const targetScroll = Math.max(0, parseInt(savedScroll) - offset);
      
      setTimeout(() => {
        window.scrollTo(0, targetScroll);
      }, 100);
    }
  }, [storageKey]);
}

/**
 * Clear scroll position from localStorage
 * Useful when user explicitly navigates to a new lesson/category
 * 
 * @param storageKey - The key to clear from localStorage
 */
export function clearScrollPosition(storageKey: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(storageKey);
}

/**
 * Clear all scroll positions matching a pattern
 * Useful for clearing all scroll data for a specific level or category
 * 
 * @param pattern - Regex pattern to match storage keys
 * 
 * Example:
 * ```typescript
 * // Clear all N5 kanji scroll positions
 * clearScrollPositionsByPattern(/^kanji-scroll-.*-N5$/);
 * 
 * // Clear all vocabulary scroll positions
 * clearScrollPositionsByPattern(/^vocabulary-scroll-/);
 * ```
 */
export function clearScrollPositionsByPattern(pattern: RegExp): void {
  if (typeof window === "undefined") return;

  const keys = Object.keys(localStorage);
  keys.forEach((key) => {
    if (pattern.test(key)) {
      localStorage.removeItem(key);
    }
  });
}
