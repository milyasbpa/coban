"use client";

import { DisplayOptionsControl, DisplayOption } from "@/pwa/core/components/display-options-control";
import { usePairingDisplayOptions } from "../store";

export function PairingDisplayOptionsControl() {
  const { displayFurigana, displayRomanji, toggleFurigana, toggleRomanji, resetToDefault } =
    usePairingDisplayOptions();

  const options: DisplayOption[] = [
    {
      key: "furigana",
      label: "Furigana",
      description: "Reading guide",
      isActive: displayFurigana,
      toggle: toggleFurigana,
    },
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
      title="Display Options"
      showReset={true}
      resetLabel="Reset"
      onReset={resetToDefault}
    />
  );
}
