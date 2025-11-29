"use client";

import { useHomeStore } from "../store/home-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/pwa/core/components/dialog";
import { Button } from "@/pwa/core/components/button";
import { useRouter } from "next/navigation";

interface GrammarExerciseModalProps {
  showProgress?: boolean;
}

export function GrammarExerciseModal({ showProgress = false }: GrammarExerciseModalProps) {
  const router = useRouter();
  const { grammarExerciseModal, closeGrammarExerciseModal } = useHomeStore();

  const handleExerciseTypeSelect = (exerciseType: string) => {
    if (!grammarExerciseModal) return;

    const { patternId, level } = grammarExerciseModal;

    // Navigate to appropriate exercise page
    router.push(
      `/grammar/exercise/${exerciseType}?patternId=${patternId}&level=${level}&showProgress=${showProgress}`
    );

    closeGrammarExerciseModal();
  };

  if (!grammarExerciseModal) return null;

  const { patternName } = grammarExerciseModal;

  return (
    <Dialog
      open={!!grammarExerciseModal}
      onOpenChange={closeGrammarExerciseModal}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            Choose Exercise Type
          </DialogTitle>
          <p className="text-sm text-muted-foreground text-center mt-2">
            {patternName}
          </p>
        </DialogHeader>

        <div className="grid gap-3 py-4">
          <Button
            variant="outline"
            className="w-full justify-start h-auto py-4"
            onClick={() => handleExerciseTypeSelect("reading")}
          >
            <div className="text-left">
              <div className="font-semibold mb-1">📖 Reading Practice</div>
              <div className="text-xs text-muted-foreground">
                Practice reading and understanding grammar patterns
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start h-auto py-4"
            onClick={() => handleExerciseTypeSelect("writing")}
          >
            <div className="text-left">
              <div className="font-semibold mb-1">✍️ Writing Practice</div>
              <div className="text-xs text-muted-foreground">
                Practice constructing sentences with patterns
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start h-auto py-4"
            onClick={() => handleExerciseTypeSelect("pairing")}
          >
            <div className="text-left">
              <div className="font-semibold mb-1">🔗 Matching Practice</div>
              <div className="text-xs text-muted-foreground">
                Match patterns with their meanings
              </div>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
