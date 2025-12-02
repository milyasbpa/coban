"use client";

import { useEffect, useState, useRef } from "react";
import { cn } from "@/pwa/core/lib/utils";

interface ExerciseTimerProps {
  /** Timer duration in seconds */
  duration: number;
  /** Callback when timer reaches 0 */
  onTimeUp: () => void;
  /** Whether timer is paused (e.g., during review state) */
  isPaused?: boolean;
  /** Additional className for positioning */
  className?: string;
}

export function ExerciseTimer({
  duration,
  onTimeUp,
  isPaused = false,
  className,
}: ExerciseTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isVisible, setIsVisible] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasCalledTimeUp = useRef(false);

  // Calculate progress percentage (0-100)
  const progress = (timeLeft / duration) * 100;

  // Determine color based on time left
  const getTimerColor = () => {
    if (timeLeft > 15) return "text-green-600 dark:text-green-400";
    if (timeLeft > 5) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getRingColor = () => {
    if (timeLeft > 15) return "stroke-green-500";
    if (timeLeft > 5) return "stroke-yellow-500";
    return "stroke-red-500";
  };

  // Page Visibility API - pause timer when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Main timer countdown logic
  useEffect(() => {
    // Reset time when duration changes (new question/section)
    setTimeLeft(duration);
    hasCalledTimeUp.current = false;
  }, [duration]); // Only reset when duration changes, not visibility

  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Don't start timer if paused or not visible
    if (isPaused || !isVisible) {
      return;
    }

    // Start countdown interval
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up!
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          
          // Call onTimeUp only once
          if (!hasCalledTimeUp.current) {
            hasCalledTimeUp.current = true;
            onTimeUp();
          }
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPaused, isVisible, onTimeUp]); // Removed duration from dependencies

  // If timer is 0, don't show (already handled by onTimeUp)
  if (duration === 0) return null;

  // Calculate SVG circle properties
  const size = 48; // Increased slightly for better visibility
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div
      className={cn(
        "flex items-center justify-center",
        timeLeft <= 5 && "animate-pulse", // Pulse animation when critical
        className
      )}
    >
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background circle */}
        <svg
          className="absolute inset-0 -rotate-90"
          width={size}
          height={size}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted opacity-20"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={cn(
              "transition-all duration-1000 ease-linear",
              getRingColor()
            )}
          />
        </svg>

        {/* Timer text in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={cn(
              "text-sm font-bold tabular-nums transition-colors duration-300",
              getTimerColor()
            )}
          >
            {timeLeft}
          </span>
        </div>
      </div>

      {/* Paused indicator */}
      {isPaused && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <span className="text-[10px] font-medium text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded">
            Paused
          </span>
        </div>
      )}
    </div>
  );
}
