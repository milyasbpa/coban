import React from "react";

interface VocabularyPairingSectionProgressProps {
  currentSection: number;
  totalSections: number;
  matchedPairs: number;
  totalPairs: number;
}

export const VocabularyPairingSectionProgress: React.FC<VocabularyPairingSectionProgressProps> = ({
  currentSection,
  totalSections,
  matchedPairs,
  totalPairs,
}) => {
  const sectionProgress = totalPairs > 0 ? (matchedPairs / totalPairs) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">
          Section {currentSection} of {totalSections}
        </h2>
        <div className="text-sm text-gray-600">
          {matchedPairs}/{totalPairs} pairs matched
        </div>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${sectionProgress}%` }}
        />
      </div>
      
      <div className="text-center text-sm text-gray-600">
        Match the vocabulary words with their meanings
      </div>
    </div>
  );
};