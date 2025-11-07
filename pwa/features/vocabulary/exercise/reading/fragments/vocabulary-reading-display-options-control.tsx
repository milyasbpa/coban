"use client";

import {
  DisplayOptionsControl,
  DisplayOption,
} from "@/pwa/core/components/display-options-control";
import { useVocabularyReadingDisplayOptions } from "../store/vocabulary-reading-display-options.store";

export function VocabularyReadingDisplayOptionsControl() {
  const { 
    displayHiragana,
    displayRomaji, 
    displayKanji,
    toggleHiragana,
    toggleRomaji, 
    toggleKanji,
    resetToDefault 
  } = useVocabularyReadingDisplayOptions();

  const options: DisplayOption[] = [
    {
      key: "kanji",
      label: "Kanji",
      description: "Japanese characters",
      isActive: displayKanji,
      toggle: toggleKanji,
    },
    {
      key: "hiragana",
      label: "Hiragana", 
      description: "Reading guide",
      isActive: displayHiragana,
      toggle: toggleHiragana,
    },
    {
      key: "romanji",
      label: "Romanji",
      description: "Latin script",
      isActive: displayRomaji,
      toggle: toggleRomaji,
    },
  ];

  return (
    <DisplayOptionsControl
      options={options}
      buttonClassName="!bottom-20"
      dialogClassName="!bottom-34"
      title="Display Options"
      showReset={true}
      resetLabel="Reset"
      onReset={resetToDefault}
    />
  );
}