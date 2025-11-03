import { playAudio } from "@/pwa/core/lib/utils/audio";
import { KanjiDisplay } from "../components";
import { useReadingDisplayOptions, useReadingExerciseStore } from "../store";

export default function ReadingQuestion() {
  const { getCurrentQuestion } = useReadingExerciseStore();
  const currentQuestion = getCurrentQuestion();
  const { displayRomanji } = useReadingDisplayOptions();

  if (!currentQuestion) return null;

  return (
    <div className="text-center mb-8">
      <h1 className="text-lg font-semibold text-foreground mb-4">
        Choose the correct reading
      </h1>

      {/* Kanji Display */}
      <KanjiDisplay
        kanji={currentQuestion.kanji}
        romanji={currentQuestion.furigana}
        onClick={() => {
          playAudio(currentQuestion.furigana);
        }}
      />
    </div>
  );
}
