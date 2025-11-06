import React from "react";
import { Progress } from "@/pwa/core/components/progress";

interface ProgressBarProps {
  progress: number;
  maxProgress: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, maxProgress }) => {
  const progressPercentage = (progress / maxProgress) * 100;

  return (
    <div className="w-full">
      <Progress value={progressPercentage} className="w-full h-2" />
      <div className="flex justify-between items-center mt-1 text-xs text-gray-600">
        <span>{progress}/{maxProgress}</span>
        <span>{Math.round(progressPercentage)}%</span>
      </div>
    </div>
  );
};