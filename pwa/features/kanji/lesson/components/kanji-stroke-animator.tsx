"use client";

import { useEffect, useRef, useState } from "react";
import HanziWriter from "hanzi-writer";
import { cn } from "@/pwa/core/lib/utils";

interface KanjiStrokeAnimatorProps {
  character: string;
  isAnimating: boolean;
  onAnimationComplete?: () => void;
  showStrokeOrder?: boolean;
  animationSpeed?: "slow" | "normal" | "fast";
  isSelected?: boolean;
  className?: string;
}

export function KanjiStrokeAnimator({
  character,
  isAnimating,
  onAnimationComplete,
  showStrokeOrder = true,
  animationSpeed = "fast",
  isSelected = false,
  className,
}: KanjiStrokeAnimatorProps) {
  const svgRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<any>(null);
  const [hasError, setHasError] = useState(false);

  // Speed configuration
  const getAnimationSpeed = () => {
    switch (animationSpeed) {
      case "slow": return 2000;
      case "normal": return 1200;
      case "fast": return 800;
      default: return 800;
    }
  };

  const getDelayBetweenStrokes = () => {
    switch (animationSpeed) {
      case "slow": return 600;
      case "normal": return 400;
      case "fast": return 200;
      default: return 200;
    }
  };

  // Color configuration based on selection state
  const getColors = () => {
    if (isSelected) {
      return {
        strokeColor: 'hsl(var(--primary))',
        radicalColor: 'hsl(var(--primary))',
        highlightColor: 'hsl(var(--primary) / 0.3)',
        outlineColor: 'hsl(var(--primary) / 0.2)',
      };
    }
    
    // Check if we're in dark mode by checking body classes or CSS variables
    const isDarkMode = document.documentElement.classList.contains('dark');
    
    if (isDarkMode) {
      return {
        strokeColor: '#fbbf24', // amber-400 (same as dark:text-amber-100)
        radicalColor: '#fbbf24',
        highlightColor: '#f59e0b', // amber-500
        outlineColor: '#374151', // gray-700 for dark mode
      };
    }
    
    return {
      strokeColor: '#b45309', // amber-700 (same as text-amber-900 in light mode)
      radicalColor: '#b45309',
      highlightColor: '#fbbf24', // amber-400
      outlineColor: '#e5e7eb', // gray-200
    };
  };

  useEffect(() => {
    if (!svgRef.current || !character) return;

    // Clear previous writer
    if (writerRef.current) {
      writerRef.current = null;
    }

    // Clear the container
    svgRef.current.innerHTML = '';

    try {
      const colors = getColors();
      
      // Create new HanziWriter instance
      const writer = HanziWriter.create(svgRef.current, character, {
        width: 48, // Slightly smaller to match text-2xl better
        height: 48,
        padding: 2,
        strokeAnimationSpeed: getAnimationSpeed(),
        delayBetweenStrokes: getDelayBetweenStrokes(),
        showOutline: true,
        showCharacter: false,
        strokeColor: colors.strokeColor,
        radicalColor: colors.radicalColor,
        highlightColor: colors.highlightColor,
        drawingColor: colors.strokeColor,
        outlineColor: colors.outlineColor,
        showHintAfterMisses: false,
        highlightOnComplete: true,
        highlightCompleteColor: colors.highlightColor,
        leniency: 1,
        strokeFadeDuration: 400,
      });

      writerRef.current = writer;
      setHasError(false);

      // Start animation when isAnimating becomes true
      if (isAnimating) {
        // Show outline first
        writer.showOutline();
        
        // Show stroke order numbers briefly before animation
        if (showStrokeOrder) {
          writer.showCharacter({
            duration: getAnimationSpeed() * 0.2,
          });
        }

        // Start stroke animation after a brief delay
        setTimeout(() => {
          writer.animateCharacter({
            onComplete: () => {
              // Highlight the completed character briefly
              if (showStrokeOrder) {
                writer.showCharacter({
                  duration: 300,
                });
              }
              // Delay before calling completion callback to show final result
              setTimeout(() => {
                onAnimationComplete?.();
              }, 800);
            }
          });
        }, showStrokeOrder ? getAnimationSpeed() * 0.3 : 100);
      }

    } catch (error) {
      console.warn(`Failed to create stroke animation for character: ${character}`, error);
      setHasError(true);
      // Call completion immediately if there's an error
      setTimeout(() => {
        onAnimationComplete?.();
      }, 100);
    }

    // Cleanup function
    return () => {
      if (writerRef.current) {
        try {
          // HanziWriter doesn't have a formal destroy method, 
          // but we can clear the reference
          writerRef.current = null;
        } catch (error) {
          // Ignore cleanup errors
        }
      }
    };
  }, [character, isAnimating, isSelected, animationSpeed, showStrokeOrder]);

  // If there's an error or character is not supported, show fallback
  if (hasError) {
    return (
      <span
        className={cn(
          "text-2xl font-bold select-none transition-colors",
          isSelected
            ? "text-primary"
            : "text-amber-900 dark:text-amber-100",
          className
        )}
      >
        {character}
      </span>
    );
  }

  return (
    <div
      ref={svgRef}
      className={cn(
        "flex items-center justify-center w-16 h-16",
        className
      )}
      style={{
        // Ensure the SVG fills the container properly and matches text size
        lineHeight: 1,
      }}
    />
  );
}