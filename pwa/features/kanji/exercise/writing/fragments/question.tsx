import { Button } from "@/pwa/core/components/button";
import { Volume2 } from "lucide-react";
import { useWritingExerciseStore } from "../store/writing-exercise.store";
import { playAudio } from "@/pwa/core/lib/utils/audio";

export function Question() {
  const { gameState, questionState } = useWritingExerciseStore();
  const questions = gameState.questions;
  const currentQuestionIndex = questionState.currentQuestionIndex;

  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) return null;

  const { reading } = currentQuestion;

  return (
    <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
      <Button
        variant="outline"
        size="sm"
        onClick={() => playAudio(reading)}
        className="shrink-0"
      >
        <Volume2 className="h-4 w-4" />
      </Button>
      <div>
        <p className="text-sm text-muted-foreground">
          {"Listen to the audio and sequence the words:"}
        </p>
        <p className="font-medium">{reading}</p>
      </div>
    </div>
  );
}
