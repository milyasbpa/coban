"use client";

import { useEffect, useState } from "react";
import { useWindowSize } from "usehooks-ts";
import ReactConfetti from "react-confetti";

interface ConfettiProps {
  isPerfectScore: boolean;
  duration?: number; // Duration in milliseconds, default 5000ms
}

export function Confetti({ isPerfectScore, duration = 5000 }: ConfettiProps) {
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Show confetti for perfect scores
    if (isPerfectScore) {
      setShowConfetti(true);
      // Stop confetti after specified duration
      const timer = setTimeout(() => setShowConfetti(false), duration);
      return () => clearTimeout(timer);
    } else {
      setShowConfetti(false);
    }
  }, [isPerfectScore, duration]);

  if (!showConfetti) return null;

  return (
    <ReactConfetti
      width={width}
      height={height}
      numberOfPieces={200}
      recycle={false}
      gravity={0.1}
    />
  );
}