"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/pwa/core/components/dialog";
import { Button } from "@/pwa/core/components/button";
import { Badge } from "@/pwa/core/components/badge";
import { VocabularyWord } from "@/pwa/core/services/vocabulary";
import { useHomeStore } from "../store/home-store";

interface VocabularyExerciseModalData {
  categoryId: string;
  categoryName: string;
  vocabularyList: VocabularyWord[];
  level: string;
}

export function VocabularyExerciseModal() {
  const router = useRouter();
  const { vocabularyExerciseModal, closeVocabularyExerciseModal } = useHomeStore();
  const [selectedExercise, setSelectedExercise] = useState<string>("reading");

  const exerciseTypes = [
    {
      id: "reading",
      name: "Reading",
      description: "Practice reading vocabulary words",
      icon: "📖",
    },
    {
      id: "writing",
      name: "Writing",
      description: "Practice writing vocabulary words",
      icon: "✍️",
    },
    {
      id: "meaning",
      name: "Meaning",
      description: "Match vocabulary with meanings",
      icon: "🧠",
    },
  ];

  const handleStartExercise = () => {
    if (!vocabularyExerciseModal) return;

    const { categoryId, level } = vocabularyExerciseModal;
    
    // Navigate to vocabulary exercise with selected type
    router.push(
      `/vocabulary/exercise/${selectedExercise}?categoryId=${categoryId}&level=${level}`
    );
    
    closeVocabularyExerciseModal();
  };

  const handleViewList = () => {
    if (!vocabularyExerciseModal) return;

    const { categoryId, level } = vocabularyExerciseModal;
    
    // Navigate to vocabulary list
    router.push(`/vocabulary/list?categoryId=${categoryId}&level=${level}`);
    
    closeVocabularyExerciseModal();
  };

  if (!vocabularyExerciseModal) return null;

  const { categoryName, vocabularyList, level } = vocabularyExerciseModal;

  return (
    <Dialog open={!!vocabularyExerciseModal} onOpenChange={closeVocabularyExerciseModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Badge variant="secondary">{level}</Badge>
            {categoryName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Vocabulary Info */}
          <div className="text-center p-4 bg-muted rounded-lg">
            <p className="text-2xl font-bold text-primary">
              {vocabularyList.length}
            </p>
            <p className="text-sm text-muted-foreground">vocabulary words</p>
          </div>

          {/* Exercise Type Selection */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Choose Exercise Type:</h4>
            <div className="grid gap-2">
              {exerciseTypes.map((exercise) => (
                <button
                  key={exercise.id}
                  onClick={() => setSelectedExercise(exercise.id)}
                  className={`p-3 text-left rounded-lg border transition-colors ${
                    selectedExercise === exercise.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{exercise.icon}</span>
                    <div>
                      <p className="font-medium">{exercise.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {exercise.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={handleViewList}
              className="w-full"
            >
              View List
            </Button>
            <Button
              onClick={handleStartExercise}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium"
            >
              Start Exercise
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}