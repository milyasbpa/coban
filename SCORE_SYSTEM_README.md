# Score Management System

Sistem manajemen skor yang komprehensif untuk aplikasi pembelajaran kanji dengan LocalForage (IndexedDB) sebagai storage backend.

## 🚀 Features

- **Real-time Progress Tracking**: Track progress per lesson, exercise type, dan individual kanji
- **Adaptive Learning**: Spaced repetition algorithm untuk kanji mastery
- **Exercise Scoring**: Comprehensive scoring berdasarkan accuracy, speed, dan difficulty
- **Analytics**: Daily, weekly, monthly progress tracking
- **Offline-first**: Data disimpan lokal dengan IndexedDB
- **Development Tools**: Reset statistics button (development only)

## 📁 File Structure

```
pwa/core/
├── model/
│   └── score.ts                    # Type definitions
├── lib/
│   ├── storage.ts                  # LocalForage storage manager
│   └── score-calculator.ts         # Scoring logic
├── store/
│   └── score.store.ts              # Zustand store
├── config/
│   └── env.ts                      # Environment & feature flags
├── components/
│   └── reset-statistics-button.tsx # Dev tools component
└── examples/
    └── score-system-usage.tsx      # Usage examples
```

## 🛠 Installation & Setup

### 1. Dependencies Installed
```bash
npm install localforage @types/localforage
```

### 2. Environment Variables
Create `.env.local` (optional):
```env
# Development features
NODE_ENV=development
ENABLE_RESET_STATS=true
ENABLE_DEBUG=true

# Storage configuration
CLEAR_STORAGE_ON_START=false
MAX_STORAGE_SIZE_MB=100

# User defaults
DEFAULT_USER_ID=default-user
DEFAULT_LEVEL=N5
```

### 3. Usage in Components

#### Initialize Score System
```tsx
// In your main app component (already done in HomeContainer)
import { useScoreStore } from "@/pwa/core/store/score.store";
import { config } from "@/pwa/core/config/env";

function App() {
  const { initializeUser, isInitialized } = useScoreStore();
  
  useEffect(() => {
    if (!isInitialized) {
      initializeUser(config.defaults.userId, config.defaults.level);
    }
  }, [initializeUser, isInitialized]);
}
```

#### Display Progress
```tsx
// In lesson cards (already implemented)
import { useScoreStore } from "@/pwa/core/store/score.store";

function LessonCard({ lessonId }: { lessonId: string }) {
  const { getLessonProgress, getExerciseProgress } = useScoreStore();
  
  const lessonProgress = getLessonProgress(lessonId);
  const writingProgress = getExerciseProgress("writing", lessonId);
  
  return (
    <div>
      <Progress value={lessonProgress} />
      <span>{lessonProgress}%</span>
    </div>
  );
}
```

#### Complete Exercise
```tsx
// In exercise completion handler
import { useScoreStore } from "@/pwa/core/store/score.store";

function ExerciseContainer() {
  const { updateExerciseScore, updateKanjiMastery } = useScoreStore();
  
  const handleExerciseComplete = async () => {
    const exerciseAttempt = {
      attemptId: `reading_${lessonId}_${Date.now()}`,
      lessonId: "lesson_1",
      exerciseType: "reading" as const,
      level: "N5",
      startTime: startTime,
      endTime: new Date().toISOString(),
      duration: 120, // seconds
      totalQuestions: 10,
      correctAnswers: 8,
      wrongAnswers: 2,
      score: 0, // Will be calculated
      accuracy: 80,
      answers: questionResults
    };
    
    await updateExerciseScore(exerciseAttempt);
    
    // Update individual kanji mastery
    const kanjiResults = groupAnswersByKanji(questionResults);
    for (const [kanji, results] of kanjiResults) {
      await updateKanjiMastery(kanji, kanji, results);
    }
  };
}
```

## 🗃 Data Models

### UserScore
```typescript
interface UserScore {
  userId: string;
  level: "N5" | "N4" | "N3" | "N2" | "N1";
  overallStats: {
    totalScore: number;
    totalExercisesCompleted: number;
    averageAccuracy: number;
    currentStreak: number;
    // ...
  };
  lessonProgress: { [lessonId: string]: LessonScore };
  exerciseScores: {
    writing: ExerciseTypeScore;
    reading: ExerciseTypeScore;
    pairing: ExerciseTypeScore;
  };
  kanjiMastery: { [kanjiId: string]: KanjiMasteryLevel };
}
```

### Scoring Algorithm

#### Exercise Score (0-1000 points)
- **Accuracy**: 70% weight (0-700 points)
- **Speed**: 20% weight (0-200 points) 
- **Difficulty**: 10% weight (0-100 points)

#### Kanji Mastery Levels
- **Beginner**: New kanji, low confidence
- **Intermediate**: Some correct answers
- **Advanced**: High accuracy, multiple correct
- **Master**: 90%+ confidence, 5+ consecutive correct

#### Spaced Repetition
- **Beginner**: 1, 3, 7 days
- **Intermediate**: 3, 7, 14 days
- **Advanced**: 7, 14, 30 days
- **Master**: 14, 30, 90 days

## 🔧 Development Tools

### Reset Statistics Button
- Only shows in development mode
- Accessible from header
- Options:
  - Reset current user statistics
  - Clear all data (all users)
  - View storage information

### Feature Flags
```typescript
import { isFeatureEnabled } from "@/pwa/core/config/env";

// Check if feature is enabled
if (isFeatureEnabled('showResetStatistics')) {
  // Show development tools
}
```

## 📊 Analytics & Insights

### Available Metrics
- Daily/Weekly/Monthly progress
- Exercise completion rates
- Accuracy trends
- Study time tracking
- Kanji mastery distribution
- Performance by exercise type

### Usage
```typescript
const { getOverallProgress } = useScoreStore();
const progress = getOverallProgress();

console.log({
  currentLevel: progress.currentLevel,
  totalKanjiLearned: progress.totalKanjiLearned,
  masteredKanji: progress.masteredKanji,
  currentStreak: progress.streakInfo.current
});
```

## 🧪 Testing

### Storage Validation
```typescript
import { StorageManager } from "@/pwa/core/lib/storage";

// Test storage
const isValid = await StorageManager.validateStorage();
console.log('Storage is valid:', isValid);

// Get storage info
const info = await StorageManager.getStorageInfo();
console.log('Storage info:', info);
```

### Manual Testing
1. Complete some exercises
2. Check lesson progress updates
3. View exercise modal progress
4. Use dev tools to reset statistics
5. Verify data persistence across browser refresh

## 🔐 Security & Privacy

- All data stored locally in browser
- No personal data sent to servers
- User can clear all data anytime
- Data persists across browser sessions
- No tracking or analytics collection

## 🚀 Future Enhancements

1. **Cloud Sync**: Optional sync to user account
2. **Export/Import**: Backup and restore data
3. **Achievements**: Badges and milestones
4. **Social Features**: Compare progress with friends
5. **Advanced Analytics**: Detailed learning insights
6. **Adaptive Difficulty**: Dynamic question difficulty

## 🐛 Troubleshooting

### Common Issues

1. **Storage not working**
   - Check browser IndexedDB support
   - Clear browser data if corrupted
   - Use dev tools to validate storage

2. **Progress not updating**
   - Ensure score store is initialized
   - Check exercise completion handlers
   - Verify lesson IDs are consistent

3. **Performance issues**
   - Monitor storage size
   - Clean up old exercise attempts
   - Use pagination for large datasets

### Debug Commands
```typescript
// In browser console
import { StorageManager } from "@/pwa/core/lib/storage";

// Check storage
await StorageManager.getStorageInfo();

// Clear all data (be careful!)
await StorageManager.clearAllData();
```

## 📚 Integration Guide

### Adding to New Exercise
1. Create exercise attempt object
2. Call `updateExerciseScore()`
3. Extract kanji results
4. Call `updateKanjiMastery()` for each kanji
5. Update UI to show progress

### Example Integration
See `pwa/core/examples/score-system-usage.tsx` for complete examples.

---

**Status**: ✅ Core system implemented and integrated
**Next**: Integrate with individual exercise completion handlers