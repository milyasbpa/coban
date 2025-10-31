'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { WritingExerciseContainer } from '@/pwa/features/kanji/exercise/writing/container/writing-exercise.container';

function WritingExercisePageContent() {
  const searchParams = useSearchParams();
  const level = searchParams.get('level') || 'n5';
  const lesson = searchParams.get('lesson') || '1';

  return <WritingExerciseContainer level={level} lesson={lesson} />;
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