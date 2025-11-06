"use client";

import {
  DisplayOptionsControl,
  DisplayOption,
} from "@/pwa/core/components/display-options-control";
import { useReadingDisplayOptions } from "../store/reading-display-options.store";

export function ReadingDisplayOptionsControl() {
  const { displayRomanji, toggleRomanji, resetToDefault } =
    useReadingDisplayOptions();

  const options: DisplayOption[] = [
    {
      key: "romanji",
      label: "Romanji",
      description: "Latin script",
      isActive: displayRomanji,
      toggle: toggleRomanji,
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
