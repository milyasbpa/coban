"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ArrowUp } from "lucide-react";
import { Button } from "@/pwa/core/components/button";
import { cn } from "@/pwa/core/lib/utils";

export function ScrollFloatingButton() {
  const [isAtBottom, setIsAtBottom] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Check if near bottom (within 150px)
      const isNearBottom = scrollTop + windowHeight >= documentHeight - 150;
      setIsAtBottom(isNearBottom);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = () => {
    if (isAtBottom) {
      // Scroll to top instantly
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Scroll down smoothly
      window.scrollBy({
        top: window.innerHeight * 0.8,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
      <Button
        onClick={handleClick}
        size="sm"
        className={cn(
          "rounded-full shadow-lg transition-all duration-300 flex items-center gap-1.5 px-3 py-2",
          "bg-primary hover:bg-primary/90 text-primary-foreground",
          !isAtBottom && "animate-bounce"
        )}
      >
        {isAtBottom ? (
          <>
            <ArrowUp className="h-3.5 w-3.5" />
            <span className="text-xs font-semibold">Top</span>
          </>
        ) : (
          <>
            <span className="text-xs font-semibold">More</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </>
        )}
      </Button>
    </div>
  );
}
