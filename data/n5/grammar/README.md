# Grammar Database Structure - N5

## 📁 File Structure

```
data/n5/grammar/
├── grammar.json                      # Master file - all grammar patterns
├── grammar_patterns_mapping.json     # Category mapping
├── grammar_1.json                    # Pola Kalimat Dasar (Basic Sentence Patterns)
├── grammar_2.json                    # Pola Kalimat Tanya (Question Patterns)
├── grammar_3.json                    # Pola Kalimat Negatif (Negative Patterns)
├── grammar_4.json                    # Partikel (Particles)
└── grammar_5.json                    # Partikel Tempat & Cara (Location & Method Particles)
```

## 📊 Database Structure

### **grammar.json** (Master File)
Contains all grammar patterns for N5 level with complete details:
- Pattern structure and breakdown
- Multiple examples with furigana, romanji, and translations
- Related patterns
- Usage notes and common mistakes

### **grammar_patterns_mapping.json**
Category mapping file that organizes patterns by type:
- 5 categories with icons and colors
- Pattern IDs grouped by category
- Order and display information

### **grammar_[1-5].json** (Category Files)
Individual category files containing specific pattern groups:
1. **grammar_1.json** - Basic Sentence Patterns (Pola Kalimat Dasar)
2. **grammar_2.json** - Question Patterns (Pola Kalimat Tanya)
3. **grammar_3.json** - Negative Patterns (Pola Kalimat Negatif)
4. **grammar_4.json** - Particles (Partikel)
5. **grammar_5.json** - Location & Method Particles (Partikel Tempat & Cara)

## 🎯 Grammar Patterns Included

### 1. ...wa...desu (〜は〜です)
**Category:** Basic Sentence Patterns
**Function:** States identity or condition of subject
**Examples:**
- 私は インドネシア人 です。(I am Indonesian)
- 今日は 暑い です。(Today is hot)
- これは 本 です。(This is a book)

### 2. ...wa...desu ka (〜は〜ですか)
**Category:** Question Patterns
**Function:** Creates questions about identity or condition
**Examples:**
- それは 何 ですか。(What is that?)
- お国は どこ ですか。(Where is your country?)
- 日本語は おもしろい ですか。(Is Japanese interesting?)

### 3. ...wa...dewa arimasen (〜は〜ではありません)
**Category:** Negative Patterns
**Function:** Negates identity or condition
**Examples:**
- 彼は 先生 では ありません。(He is not a teacher)
- 今日は 雨 じゃ ありません。(Today it's not raining)
- これは 日本料理 じゃない です。(This is not Japanese food)

**Alternatives:**
- ではありません (formal)
- じゃありません (polite)
- じゃないです (casual-polite)

### 4. ...mo... (〜も〜)
**Category:** Particles
**Function:** Shows similarity or addition (also, too)
**Examples:**
- 私も 学生 です。(I am also a student)
- 友達も 来ます。(My friend will also come)
- 彼も 行きます。(He will also go)

### 5. ...de... (〜で〜)
**Category:** Location & Method Particles
**Function:** Indicates location of activity, tool/method, or connector
**Examples:**
- 私は インドネシア人 で 学生 です。(I am Indonesian and a student)
- 図書館 で 勉強します。(Study at the library)
- バス で 行きます。(Go by bus)

**Usage Types:**
- Location: Where action occurs (学校で勉強します)
- Method: Tool or means (バスで行きます)
- Connector: And (日本人で先生です)

## 📝 Data Structure Details

### Pattern Object Structure

```json
{
  "id": 1,
  "pattern": "...wa...desu",
  "romanji": "wa desu",
  "japanese": "〜は〜です",
  "structure": {
    "subyek": "Subject",
    "wa": "は",
    "keterangan": "Keterangan",
    "desu": "です"
  },
  "type": "kalimat_positif",
  "category": {
    "id": "sentence_patterns_basic",
    "en": "Basic Sentence Patterns",
    "id": "Pola Kalimat Dasar"
  },
  "meanings": {
    "id": "Kalimat Positif",
    "en": "Positive Sentence"
  },
  "function": {
    "id": "Menyatakan identitas atau keadaan subjek",
    "en": "States the identity or condition of the subject"
  },
  "examples": [...],
  "related_patterns": [2, 3, 5],
  "difficulty": "basic",
  "jlpt_level": "n5",
  "usage_notes": {...},
  "common_mistakes": [...]
}
```

### Example Object Structure

```json
{
  "id": 1,
  "japanese": "私は インドネシア人 です。",
  "furigana": "わたし は インドネシアじん です。",
  "romanji": "Watashi wa Indonesia-jin desu.",
  "breakdown": {
    "subyek": "私",
    "wa": "は",
    "keterangan": "インドネシア人",
    "desu": "です"
  },
  "meanings": {
    "id": "Saya adalah orang Indonesia.",
    "en": "I am Indonesian."
  }
}
```

## 🎨 Category Colors & Icons

| Category | Icon | Color | Description |
|----------|------|-------|-------------|
| Basic Sentence Patterns | 📝 | #22C55E | Positive statements |
| Question Patterns | ❓ | #3B82F6 | Questions |
| Negative Patterns | ❌ | #EF4444 | Negations |
| Particles | 🔤 | #F59E0B | Basic particles |
| Location & Method Particles | 📍 | #8B5CF6 | Place and method |

## 🚀 Usage

### Loading Grammar Data

```typescript
// Load all patterns
import grammarData from '@/data/n5/grammar/grammar.json';

// Load category mapping
import grammarMapping from '@/data/n5/grammar/grammar_patterns_mapping.json';

// Load specific category
import basicPatterns from '@/data/n5/grammar/grammar_1.json';
```

### Accessing Patterns

```typescript
// Get all patterns
const allPatterns = grammarData.patterns;

// Get pattern by ID
const pattern = allPatterns.find(p => p.id === 1);

// Get patterns by category
const questionPatterns = allPatterns.filter(p => p.category.id === 'sentence_patterns_question');

// Get examples for a pattern
const examples = pattern.examples;
```

## 📚 Future Enhancements

1. **Exercise System**
   - Fill in the blank exercises
   - Sentence construction (drag & drop)
   - Translation exercises
   - Pattern recognition

2. **Additional Patterns**
   - More N5 grammar patterns
   - Verb conjugations
   - Adjective patterns
   - Time expressions

3. **Interactive Features**
   - Audio pronunciations
   - Practice mode
   - Progress tracking
   - Quiz system

## 📖 References

Based on:
- JLPT N5 Grammar Syllabus
- Minna no Nihongo Elementary
- Genki I & II
- Sample images provided (Pola Kalimat N5)

---

Created: November 29, 2025
Level: N5 (Beginner)
Total Patterns: 5
Status: ✅ Complete
