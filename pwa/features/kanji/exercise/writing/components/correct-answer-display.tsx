interface CorrectAnswerDisplayProps {
  correctAnswer: string;
}

export function CorrectAnswerDisplay({ correctAnswer }: CorrectAnswerDisplayProps) {
  return (
    <div className="p-3 bg-muted rounded-lg">
      <p className="text-sm text-muted-foreground mb-1">
        Correct answer:
      </p>
      <div className="flex gap-2">
        {correctAnswer.split("").map((char, index) => (
          <div
            key={index}
            className="min-w-[40px] h-10 rounded border border-green-500/30 bg-green-500/10 flex items-center justify-center text-sm font-medium text-green-700"
          >
            {char}
          </div>
        ))}
      </div>
    </div>
  );
}