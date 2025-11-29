// Grammar Types

export interface MultiLanguage {
  id: string;
  en: string;
}

export interface StructureComponent {
  type: "subject" | "particle" | "predicate" | "copula" | "object";
  label: MultiLanguage;
  value?: string;
  romanji?: string;
  placeholder?: string;
  example?: string;
  optional?: boolean;
  replaces?: string;
  variants?: ComponentVariant[];
  functions?: string[];
}

export interface ComponentVariant {
  value: string;
  romanji: string;
  formality?: string;
}

export interface GrammarStructure {
  components: StructureComponent[];
}

export interface GrammarCategory {
  id: string;
  name: MultiLanguage;
}

export interface GrammarExample {
  id: number;
  japanese: string;
  furigana: string;
  romanji: string;
  meanings: MultiLanguage;
}

export interface CommonMistake {
  incorrect: string;
  correct: string;
  explanation: MultiLanguage;
}

export interface GrammarPattern {
  id: number;
  pattern: string;
  romanji: string;
  japanese: string;
  structure: GrammarStructure;
  type: string;
  subtype: string;
  category: GrammarCategory;
  meanings: MultiLanguage;
  function: MultiLanguage;
  examples: GrammarExample[];
  related_patterns: number[];
  usage_notes: MultiLanguage;
  common_mistakes: CommonMistake[];
}

export interface GrammarData {
  items: GrammarPattern[];
}
