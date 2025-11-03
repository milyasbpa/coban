'use client';

import { Suspense } from 'react';
import { WritingExerciseContainer } from '@/pwa/features/kanji/exercise/writing/container/writing-exercise.container';

function WritingExercisePageContent() {
  return <WritingExerciseContainer />;
}

export default function WritingExercisePage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      }
    >
      <WritingExercisePageContent />
    </Suspense>
  );
}