"use client";

import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/pwa/core/components/dialog";
import { VocabularyWord } from "@/pwa/core/services/vocabulary";
import { useHomeStore } from "../store/home-store";
import { useVocabularyScoreStore } from "@/pwa/features/score/store/vocabulary-score.store";
import { ExerciseCard } from "../components/exercise-card";
import { Edit3, Book, Users } from "lucide-react";

interface VocabularyExerciseModalData {
  categoryId: string;
  categoryName: string;
  vocabularyList: VocabularyWord[];
  level: string;
}

export function VocabularyExerciseModal() {
  const router = useRouter();
  const { vocabularyExerciseModal, closeVocabularyExerciseModal } = useHomeStore();
  const { getExerciseProgress } = useVocabularyScoreStore();

  const handleExerciseStart = (exerciseType: string) => {
    if (!vocabularyExerciseModal) return;

    const { categoryId, level } = vocabularyExerciseModal;
    
    closeVocabularyExerciseModal();
    
    // Navigate to vocabulary exercise with selected type
    router.push(
      `/vocabulary/exercise/${exerciseType}?categoryId=${categoryId}&level=${level}`
    );
  };

  if (!vocabularyExerciseModal) return null;

  const { categoryName, vocabularyList, level, categoryId } = vocabularyExerciseModal;

  // Get first 5 vocabulary words to display
  const displayWords = vocabularyList.slice(0, 5).map(v => v.kanji || v.hiragana);

  return (
    <Dialog open={!!vocabularyExerciseModal} onOpenChange={closeVocabularyExerciseModal}>
      <DialogContent className="sm:max-w-md bg-popover border-2 border-border shadow-xl backdrop-blur-sm">
        <DialogHeader className="text-center space-y-2">
          <div className="mx-auto bg-foreground text-background px-4 py-1.5 rounded-full w-fit">
            <span className="text-xs font-bold tracking-wider">EXERCISES</span>
          </div>
          <DialogTitle className="text-lg font-bold text-foreground">
            {categoryName}
          </DialogTitle>
          <div className="text-center">
            <div className="text-xl font-bold text-foreground mb-1 tracking-wider">
              {displayWords.join("、")}
              {vocabularyList.length > 5 && "..."}
            </div>
            <div className="text-sm text-muted-foreground">
              {vocabularyList.length} words
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {/* Writing Exercise */}
          <ExerciseCard
            title="Writing"
            exerciseType="writing"
            Icon={Edit3}
            progress={getExerciseProgress("writing", categoryId, level)}
            onClick={handleExerciseStart}
          />

          {/* Reading Exercise */}
          <ExerciseCard
            title="Reading"
            exerciseType="reading"
            Icon={Book}
            progress={getExerciseProgress("reading", categoryId, level)}
            onClick={handleExerciseStart}
          />

          {/* Pairing Exercise */}
          <ExerciseCard
            title="Pairing"
            exerciseType="pairing"
            Icon={Users}
            progress={getExerciseProgress("pairing", categoryId, level)}
            onClick={handleExerciseStart}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}