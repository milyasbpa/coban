"use client";

import { DisplayOptionsControl, DisplayOption } from "@/pwa/core/components/display-options-control";
import { useReadingDisplayOptions } from "../store/reading-display-options.store";

export function ReadingDisplayOptionsControl() {
  const {
    displayRomanji,
    toggleRomanji,
    resetToDefault
  } = useReadingDisplayOptions();

  const options: DisplayOption[] = [
    {
      key: 'romanji',
      label: 'Romanji',
      description: 'Latin script',
      isActive: displayRomanji,
      toggle: toggleRomanji,
    },
  ];

  return (
    <DisplayOptionsControl 
      options={options}
      title="Display Options"
      position={{ bottom: "30", right: "6" }}
      showReset={true}
      resetLabel="Reset"
      onReset={resetToDefault}
    />
  );
}