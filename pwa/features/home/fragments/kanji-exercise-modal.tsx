"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/pwa/core/components/dialog";
import { KanjiDetail } from "@/pwa/core/services/kanji";
import { useHomeStore } from "../store/home-store";
import { useHomeSettingsStore } from "../store/home-settings.store";
import { useKanjiScoreStore } from "@/pwa/features/score/store/kanji-score.store";
import { ExerciseCard } from "../components/exercise-card";
import { Edit3, Book, Users, RotateCcw, Clock } from "lucide-react";
import { Button } from "@/pwa/core/components/button";
import { Tabs, TabsList, TabsTrigger } from "@/pwa/core/components/tabs";
import { Slider } from "@/pwa/core/components/slider";
import { Checkbox } from "@/pwa/core/components/checkbox";
import { useTimerPreferenceStore } from "@/pwa/core/stores/timer-preference.store";

interface KanjiExerciseModalProps {
  showProgress?: boolean;
}

export function KanjiExerciseModal({
  showProgress = false,
}: KanjiExerciseModalProps) {
  const { selectedLevel } = useHomeSettingsStore();
  const { kanjiExerciseModal, closeKanjiExerciseModal } = useHomeStore();
  const { getExerciseProgress, getKanjiAccuracy } = useKanjiScoreStore();
  const { timerEnabled, timerValue, setTimerEnabled, setTimerValue } =
    useTimerPreferenceStore();
  const { isOpen, lessonName, lessonId, topicId, lessonType, kanjiList } =
    kanjiExerciseModal;

  // Review Mode State
  const [mode, setMode] = useState<"normal" | "review">("normal");
  const [threshold, setThreshold] = useState(70);
  const [includeNewKanji, setIncludeNewKanji] = useState(true);

  // Filter kanji based on review mode settings
  const filteredKanjiList = useMemo(() => {
    if (mode === "normal") {
      return kanjiList;
    }

    return kanjiList.filter((kanji) => {
      const accuracy = getKanjiAccuracy(kanji.id.toString(), selectedLevel);

      // Include new kanji (never attempted)
      if (accuracy === null) {
        return includeNewKanji;
      }

      // Include kanji below threshold
      return accuracy < threshold;
    });
  }, [
    kanjiList,
    mode,
    threshold,
    includeNewKanji,
    getKanjiAccuracy,
    selectedLevel,
  ]);

  const handleExerciseStart = (exerciseType: string) => {
    closeKanjiExerciseModal();

    // Build URL based on lesson type
    const buildExerciseUrl = (exercise: string) => {
      const baseUrl = `/kanji/exercise/${exercise}`;
      const level = selectedLevel; // Use selected level from settings

      const params = new URLSearchParams({ level });

      // Add lesson/topic params
      if (lessonType === "stroke" && lessonId) {
        params.append("lessonId", lessonId.toString());
      } else if (lessonType === "topic" && topicId) {
        params.append("topicId", topicId);
      }

      // Add filtered kanji IDs if in review mode
      if (mode === "review" && filteredKanjiList.length > 0) {
        params.append(
          "selectedKanji",
          filteredKanjiList.map((k) => k.id).join(",")
        );
      }

      return `${baseUrl}?${params.toString()}`;
    };

    if (exerciseType === "pairing") {
      window.location.href = buildExerciseUrl("pairing");
    } else if (exerciseType === "reading") {
      window.location.href = buildExerciseUrl("reading");
    } else if (exerciseType === "writing") {
      window.location.href = buildExerciseUrl("writing");
    }
  };

  // Review mode statistics
  const totalKanji = kanjiList.length;
  const reviewKanjiCount = filteredKanjiList.length;
  const isReviewEmpty = mode === "review" && reviewKanjiCount === 0;

  return (
    <Dialog open={isOpen} onOpenChange={closeKanjiExerciseModal}>
      <DialogContent className="sm:max-w-md bg-popover border-2 border-border shadow-xl backdrop-blur-sm">
        <DialogHeader className="text-center space-y-2">
          <div className="mx-auto bg-foreground text-background px-4 py-1.5 rounded-full w-fit">
            <span className="text-xs font-bold tracking-wider">EXERCISES</span>
          </div>
          <DialogTitle className="text-lg font-bold text-foreground flex items-center justify-center gap-2">
            <span>{lessonName}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-sm font-normal text-muted-foreground">
              {totalKanji} kanji
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* Mode Tabs */}
        <Tabs
          value={mode}
          onValueChange={(v) => setMode(v as "normal" | "review")}
          className="w-full mt-4"
        >
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

            {/* Include New Kanji Checkbox */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="includeNewKanji"
                checked={includeNewKanji}
                onCheckedChange={(checked) =>
                  setIncludeNewKanji(checked === true)
                }
              />
              <label
                htmlFor="includeNewKanji"
                className="text-sm font-medium text-foreground cursor-pointer"
              >
                Include new kanji
              </label>
            </div>

            {/* Statistics */}
            <div className="pt-2 border-t border-border">
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-foreground">
                  {reviewKanjiCount} / {totalKanji} kanji
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Timer Settings - Always visible */}
        <div className="space-y-3 p-3 bg-muted/50 rounded-lg border border-border">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-foreground" />
            <label className="text-sm font-semibold text-foreground">
              Timer
            </label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="timer-enable-kanji"
              checked={timerEnabled}
              onCheckedChange={(checked) => setTimerEnabled(checked === true)}
            />
            <label
              htmlFor="timer-enable-kanji"
              className="text-sm font-medium text-foreground cursor-pointer"
            >
              {timerEnabled ? `${timerValue}s per question` : "No time limit"}
            </label>
          </div>

          {timerEnabled && (
            <div className="space-y-1.5">
              <Slider
                value={[timerValue]}
                onValueChange={(values) => setTimerValue(values[0])}
                min={10}
                max={60}
                step={5}
                className="w-full"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>10s</span>
                <span>60s</span>
              </div>
            </div>
          )}
        </div>

        {/* Empty State for Review Mode */}
        {isReviewEmpty ? (
          <div className="text-center py-8 space-y-4">
            <div className="text-4xl">🎉</div>
            <div className="space-y-2">
              <h3 className="font-bold text-lg text-foreground">
                All kanji above {threshold}%!
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
              progress={getExerciseProgress(
                "writing",
                lessonType === "stroke"
                  ? lessonId?.toString() || ""
                  : `topic_${topicId}`,
                selectedLevel
              )}
              onClick={handleExerciseStart}
              showProgress={showProgress && mode === "normal"}
            />

            {/* Reading Exercise */}
            <ExerciseCard
              title="Reading"
              exerciseType="reading"
              Icon={Book}
              progress={getExerciseProgress(
                "reading",
                lessonType === "stroke"
                  ? lessonId?.toString() || ""
                  : `topic_${topicId}`,
                selectedLevel
              )}
              onClick={handleExerciseStart}
              showProgress={showProgress && mode === "normal"}
            />

            {/* Pairing Exercise */}
            <ExerciseCard
              title="Pairing"
              exerciseType="pairing"
              Icon={Users}
              progress={getExerciseProgress(
                "pairing",
                lessonType === "stroke"
                  ? lessonId?.toString() || ""
                  : `topic_${topicId}`,
                selectedLevel
              )}
              onClick={handleExerciseStart}
              showProgress={showProgress && mode === "normal"}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
