"use client";

import { useState, useEffect } from "react";

export function useTheme() {
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode

  useEffect(() => {
    // Set initial theme based on stored preference or default to dark
    const storedTheme = localStorage.getItem("theme");
    const prefersDark = storedTheme === "dark" || (!storedTheme && true);
    setIsDarkMode(prefersDark);
    
    // Apply theme to document
    if (prefersDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = (isDark?: boolean) => {
    const newMode = isDark !== undefined ? isDark : !isDarkMode;
    setIsDarkMode(newMode);
    
    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const setLightMode = () => toggleTheme(false);
  const setDarkMode = () => toggleTheme(true);

  return {
    isDarkMode,
    toggleTheme,
    setLightMode,
    setDarkMode,
  };
}