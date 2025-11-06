"use client";

import {
  DisplayOptionsControl,
  DisplayOption,
} from "@/pwa/core/components/display-options-control";
import { useDisplayOptions } from "../store/display-options.store";

export function LessonDisplayOptionsControl() {
  const {
    displayOptions,
    toggleFurigana,
    toggleJapanese,
    toggleMeaning,
    toggleRomanji,
    resetToDefault,
  } = useDisplayOptions();

  const options: DisplayOption[] = [
    {
      key: "furigana",
      label: "Furigana",
      description: "Reading guide",
      isActive: displayOptions.furigana,
      toggle: toggleFurigana,
    },
    {
      key: "japanese",
      label: "JP",
      description: "Japanese text",
      isActive: displayOptions.japanese,
      toggle: toggleJapanese,
    },
    {
      key: "meaning",
      label: "EN",
      description: "Meaning",
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
