"use client";

import { DisplayOptionsControl, DisplayOption } from "@/pwa/core/components/display-options-control";
import { useVocabularyPairingDisplayOptions } from "../store";

export function VocabularyPairingDisplayOptionsControl() {
  const { 
    displayHiragana, 
    displayRomaji, 
    displayKanji, 
    toggleHiragana, 
    toggleRomaji, 
    toggleKanji, 
    resetToDefault 
  } = useVocabularyPairingDisplayOptions();

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
      key: "romaji",
      label: "Romaji",
      description: "Latin script",
      isActive: displayRomaji,
      toggle: toggleRomaji,
    },
  ];

  return (
    <DisplayOptionsControl 
      options={options}
      title="Display Options"
      showReset={true}
      resetLabel="Reset"
      onReset={resetToDefault}
    />
  );
}