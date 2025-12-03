"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getLastVisitedPage, clearLastVisitedPage } from "@/pwa/core/lib/hooks/use-last-visited-page";

/**
 * Component that restores the last visited page on app load
 * Checks localStorage for saved URL and redirects if found
 * Uses router.push() instead of replace() to maintain browser history for swipe-back gesture
 * Detects back navigation to prevent redirect loops when user swipes back
 */
export function PageRestorer() {
  const router = useRouter();

  useEffect(() => {
    const lastVisitedPage = getLastVisitedPage();
    
    // Only redirect if:
    // 1. There is a saved page
    // 2. The saved page is not the home page (/)
    // 3. We're currently on the home page
    if (lastVisitedPage && lastVisitedPage !== "/" && window.location.pathname === "/") {
      // Check navigation type to detect if user came from back button/swipe gesture
      const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      const navigationType = navigationEntries[0]?.type;
      
      // If user came from back/forward navigation (swipe back), don't redirect
      // Clear saved page to prevent redirect loop
      if (navigationType === 'back_forward') {
        clearLastVisitedPage();
        return;
      }
      
      // Otherwise, it's a fresh load/reload, so restore the last page
      // Use push() instead of replace() to add history entry
      // This allows iOS swipe-back gesture to work properly
      router.push(lastVisitedPage);
    }
  }, [router]);

  return null; // This component doesn't render anything
}
