"use client";

import {
  DisplayOptionsControl,
  DisplayOption,
} from "@/pwa/core/components/display-options-control";
import { useVocabularyDisplayOptions } from "../store/display-options.store";

export function LessonDisplayOptionsControl() {
  const {
    displayOptions,
    toggleHiragana,
    toggleJapanese,
    toggleMeaning,
    toggleRomanji,
    resetToDefault,
  } = useVocabularyDisplayOptions();

  const options: DisplayOption[] = [
    {
      key: "hiragana",
      label: "Hiragana",
      description: "Reading pronunciation",
      isActive: displayOptions.hiragana,
      toggle: toggleHiragana,
    },
    {
      key: "japanese",
      label: "JP",
      description: "Japanese kanji",
      isActive: displayOptions.japanese,
      toggle: toggleJapanese,
    },
    {
      key: "meaning",
      label: "EN",
      description: "English meaning",
      isActive: displayOptions.meaning,
      toggle: toggleMeaning,
    },
    {
      key: "romanji",
      label: "Romanji",
      description: "Latin script",
      isActive: displayOptions.romanji,
      toggle: toggleRomanji,
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