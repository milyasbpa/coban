"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getLastVisitedPage } from "@/pwa/core/lib/hooks/use-last-visited-page";

/**
 * Component that restores the last visited page on app load
 * Checks localStorage for saved URL and redirects if found
 * Uses router.push() instead of replace() to maintain browser history for swipe-back gesture
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
      // Use push() instead of replace() to add history entry
      // This allows iOS swipe-back gesture to work properly
      router.push(lastVisitedPage);
    }
  }, [router]);

  return null; // This component doesn't render anything
}
