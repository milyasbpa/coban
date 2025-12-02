"use client";

import { useState, useMemo } from "react";
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
import { Edit3, Book, Users, RotateCcw } from "lucide-react";
import { Button } from "@/pwa/core/components/button";
import { Tabs, TabsList, TabsTrigger } from "@/pwa/core/components/tabs";
import { Slider } from "@/pwa/core/components/slider";
import { Checkbox } from "@/pwa/core/components/checkbox";

interface VocabularyExerciseModalData {
  categoryId: string;
  categoryName: string;
  vocabularyList: VocabularyWord[];
  level: string;
}

interface VocabularyExerciseModalProps {
  showProgress?: boolean;
}

export function VocabularyExerciseModal({ showProgress = false }: VocabularyExerciseModalProps) {
  const router = useRouter();
  const { vocabularyExerciseModal, closeVocabularyExerciseModal } = useHomeStore();
  const { getExerciseProgress, getVocabularyAccuracy } = useVocabularyScoreStore();

  // Review Mode State
  const [mode, setMode] = useState<"normal" | "review">("normal");
  const [threshold, setThreshold] = useState(70);
  const [includeNewWords, setIncludeNewWords] = useState(true);

  // Filter vocabulary based on review mode settings
  const filteredVocabularyList = useMemo(() => {
    if (!vocabularyExerciseModal || mode === "normal") {
      return vocabularyExerciseModal?.vocabularyList || [];
    }

    const { vocabularyList, level, categoryId } = vocabularyExerciseModal;

    return vocabularyList.filter((vocab) => {
      const accuracy = getVocabularyAccuracy(
        vocab.id.toString(),
        level,
        categoryId
      );

      // Include new words (never attempted)
      if (accuracy === null) {
        return includeNewWords;
      }

      // Include words below threshold
      return accuracy < threshold;
    });
  }, [vocabularyExerciseModal, mode, threshold, includeNewWords, getVocabularyAccuracy]);

  const handleExerciseStart = (exerciseType: string) => {
    if (!vocabularyExerciseModal) return;

    const { categoryId, level } = vocabularyExerciseModal;
    
    closeVocabularyExerciseModal();
    
    // Build URL params
    const params = new URLSearchParams({
      categoryId,
      level,
    });

    // Add filtered vocabulary IDs if in review mode (reuse selectedVocabulary param from lesson selection)
    if (mode === "review" && filteredVocabularyList.length > 0) {
      params.append("selectedVocabulary", filteredVocabularyList.map(v => v.id).join(","));
    }
    
    // Navigate to vocabulary exercise with selected type
    router.push(`/vocabulary/exercise/${exerciseType}?${params.toString()}`);
  };

  if (!vocabularyExerciseModal) return null;

  const { categoryName, vocabularyList, level, categoryId } = vocabularyExerciseModal;

  // Review mode statistics
  const totalWords = vocabularyList.length;
  const reviewWordsCount = filteredVocabularyList.length;
  const isReviewEmpty = mode === "review" && reviewWordsCount === 0;

  return (
    <Dialog open={!!vocabularyExerciseModal} onOpenChange={closeVocabularyExerciseModal}>
      <DialogContent className="sm:max-w-md bg-popover border-2 border-border shadow-xl backdrop-blur-sm">
        <DialogHeader className="text-center space-y-2">
          <div className="mx-auto bg-foreground text-background px-4 py-1.5 rounded-full w-fit">
            <span className="text-xs font-bold tracking-wider">EXERCISES</span>
          </div>
          <DialogTitle className="text-lg font-bold text-foreground flex items-center justify-center gap-2">
            <span>{categoryName}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-sm font-normal text-muted-foreground">{vocabularyList.length} words</span>
          </DialogTitle>
        </DialogHeader>

        {/* Mode Tabs */}
        <Tabs value={mode} onValueChange={(v) => setMode(v as "normal" | "review")} className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="normal">Normal</TabsTrigger>
            <TabsTrigger value="review" className="flex items-center gap-1">
              <RotateCcw className="w-3 h-3" />
              Review
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Review Mode Settings */}
        {mode === "review" && (
          <div className="space-y-3 p-3 bg-muted/50 rounded-lg border border-border">
            {/* Threshold Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                  Threshold
                </label>
                <span className="text-sm font-bold text-foreground bg-background px-2 py-0.5 rounded">
                  {threshold}%
                </span>
              </div>
              <Slider
                value={[threshold]}
                onValueChange={(values) => setThreshold(values[0])}
                min={50}
                max={90}
                step={5}
                className="w-full"
              />
            </div>

            {/* Include New Words Checkbox */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="includeNew"
                checked={includeNewWords}
                onCheckedChange={(checked) => setIncludeNewWords(checked === true)}
              />
              <label
                htmlFor="includeNew"
                className="text-sm font-medium text-foreground cursor-pointer"
              >
                Include new words
              </label>
            </div>

            {/* Statistics */}
            <div className="pt-2 border-t border-border">
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-foreground">
                  {reviewWordsCount} / {totalWords} words
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Empty State for Review Mode */}
        {isReviewEmpty ? (
          <div className="text-center py-8 space-y-4">
            <div className="text-4xl">🎉</div>
            <div className="space-y-2">
              <h3 className="font-bold text-lg text-foreground">
                All words above {threshold}%!
              </h3>
              <p className="text-sm text-muted-foreground">
                Try lowering the threshold or practice in Normal Mode
              </p>
            </div>
            <Button
              onClick={() => setMode("normal")}
              variant="default"
              className="mt-4"
            >
              Switch to Normal Mode
            </Button>
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            {/* Writing Exercise */}
            <ExerciseCard
              title="Writing"
              exerciseType="writing"
              Icon={Edit3}
              progress={getExerciseProgress("writing", categoryId, level)}
              onClick={handleExerciseStart}
              showProgress={showProgress && mode === "normal"}
            />

            {/* Reading Exercise */}
            <ExerciseCard
              title="Reading"
              exerciseType="reading"
              Icon={Book}
              progress={getExerciseProgress("reading", categoryId, level)}
              onClick={handleExerciseStart}
              showProgress={showProgress && mode === "normal"}
            />

            {/* Pairing Exercise */}
            <ExerciseCard
              title="Pairing"
              exerciseType="pairing"
              Icon={Users}
              progress={getExerciseProgress("pairing", categoryId, level)}
              onClick={handleExerciseStart}
              showProgress={showProgress && mode === "normal"}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}