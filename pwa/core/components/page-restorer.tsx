"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getLastVisitedPage } from "@/pwa/core/lib/hooks/use-last-visited-page";

/**
 * Component that restores the last visited page on app load
 * Checks localStorage for saved URL and redirects if found
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
      router.replace(lastVisitedPage);
    }
  }, [router]);

  return null; // This component doesn't render anything
}
