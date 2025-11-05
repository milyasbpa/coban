# Pairing Game Module - Refactored Architecture

## Overview
Module ini telah di-refactor untuk menghilangkan circular dependency dan meningkatkan maintainability dengan menerapkan prinsip-prinsip clean architecture.

## Struktur Baru

### 1. Types (`/types/index.ts`)
Semua interface dan type definitions yang digunakan di seluruh module:
- `PairingWord` - Data struktur untuk kata pairing
- `GameStats` - Statistik permainan
- `SelectedCard` - Kartu yang dipilih user
- `GameSection` - Section data untuk permainan
- `RetryResults` - Hasil retry session
- `GameInitializationParams` - Parameter untuk inisialisasi game

### 2. Services (`/services/`)
Business logic yang terpisah dari state management:

#### `ScoreCalculatorService`
- `calculateScore()` - Menghitung score berdasarkan game stats
- `calculateRetryScore()` - Menghitung score untuk retry mode
- `calculateAccumulativeScore()` - Menghitung score dengan penalty global

#### `GameDataService`
- `shuffleArray()` - Mengacak array
- `createSections()` - Membagi words menjadi sections
- `generateRetryWords()` - Generate words untuk retry session
- `isSectionComplete()` - Cek apakah section sudah selesai

#### `WordErrorService`
- `addWordError()` - Menambah word ke error tracking
- `removeWordError()` - Menghapus word dari error tracking
- `mergeErrorSets()` - Menggabungkan error sets
- `getAllWrongWords()` - Mendapatkan semua wrong words

### 3. Store (`/store/pairing-game.store.ts`)
State management yang clean, fokus hanya pada state operations. Business logic sudah dipindahkan ke services.

#### Key Changes:
- Parameter `initializeGame` sekarang menggunakan object parameter untuk flexibility
- Semua calculation logic didelegasikan ke services
- Error tracking logic didelegasikan ke WordErrorService
- Data manipulation didelegasikan ke GameDataService

### 4. Utils (`/utils/pairing-game.ts`)
Utility functions yang tetap ada untuk backward compatibility, tetapi sekarang mendelegasikan ke services.

## Benefits

### 1. No More Circular Dependencies
- Types terpisah dari store dan utils
- Services tidak depend pada store
- Utils bisa menggunakan services tanpa circular reference

### 2. Single Responsibility Principle
- Store: hanya handle state management
- Services: hanya handle business logic
- Utils: hanya handle data transformation
- Types: hanya define interfaces

### 3. Better Testability
- Services bisa di-test secara independen
- Pure functions tanpa side effects
- Clear input/output contracts

### 4. Better Maintainability
- Logic terorganisir berdasarkan tanggung jawab
- Mudah untuk modify business logic tanpa affect state
- Mudah untuk add new features

### 5. Type Safety
- Semua types centralized
- Better IntelliSense support
- Compile-time error checking

## Migration Guide

### Old Usage:
```typescript
// Old way
initializeGame(lessonId, level, false, selectedKanjiIds, topicId);
```

### New Usage:
```typescript
// New way
initializeGame({
  lessonId,
  level,
  shouldResetSectionIndex: false,
  selectedKanjiIds,
  topicId,
});
```

### Import Changes:
```typescript
// You can still import everything from the main index
import { 
  usePairingGameStore, 
  ScoreCalculatorService,
  GameDataService,
  WordErrorService,
  PairingWord,
  GameStats 
} from './pairing';

// Or import specifically from submodules
import { GameStats } from './pairing/types';
import { ScoreCalculatorService } from './pairing/services';
```

## Input/Output Compatibility
Semua public APIs tetap kompatibel dengan implementasi sebelumnya. Logic internal sudah di-refactor tetapi behavior external tetap sama.

- ✅ Game initialization logic tetap sama
- ✅ Score calculation results tetap sama  
- ✅ Retry mechanism tetap sama
- ✅ Section management tetap sama
- ✅ Error tracking tetap sama

## Testing
Services dapat di-test secara independen:
```typescript
describe('ScoreCalculatorService', () => {
  it('should calculate score correctly', () => {
    const stats = { totalWords: 5, uniqueWrongWords: 1 };
    const score = ScoreCalculatorService.calculateScore(stats);
    expect(score).toBe(80); // 100 - (1 * 20)
  });
});
```