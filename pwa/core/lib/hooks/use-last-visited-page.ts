"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const LAST_VISITED_KEY = "coban_last_visited_page";

/**
 * Hook to automatically save the current page URL to localStorage
 * This enables the app to restore the last visited page after restart/refresh
 * 
 * Usage:
 * ```typescript
 * export function LessonContainer() {
 *   useLastVisitedPage(); // Auto-saves current URL
 *   // ... rest of component
 * }
 * ```
 */
export function useLastVisitedPage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Build full URL with search params
    const params = searchParams.toString();
    const fullPath = params ? `${pathname}?${params}` : pathname;

    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(LAST_VISITED_KEY, fullPath);
    }
  }, [pathname, searchParams]);
}

/**
 * Get the last visited page URL from localStorage
 * Returns null if no saved page exists
 */
export function getLastVisitedPage(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(LAST_VISITED_KEY);
}

/**
 * Clear the saved last visited page from localStorage
 * Call this when user explicitly navigates to home or logs out
 */
export function clearLastVisitedPage(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LAST_VISITED_KEY);
}
