"use client";

import { useEffect, useState } from "react";

const DISPLAY_SETTINGS_STORAGE_KEY = "chempuzzle.displaySettings";

type DisplaySettings = {
  showMoleculeHints: boolean;
  showAtomicNumbers: boolean;
};

const DEFAULT_DISPLAY_SETTINGS: DisplaySettings = {
  showMoleculeHints: true,
  showAtomicNumbers: true,
};

const readSettings = (): DisplaySettings => {
  if (typeof window === "undefined") return DEFAULT_DISPLAY_SETTINGS;
  const saved = window.localStorage.getItem(DISPLAY_SETTINGS_STORAGE_KEY);
  if (!saved) return DEFAULT_DISPLAY_SETTINGS;
  try {
    const parsed = JSON.parse(saved) as Partial<DisplaySettings>;
    return {
      showMoleculeHints: typeof parsed.showMoleculeHints === "boolean" ? parsed.showMoleculeHints : DEFAULT_DISPLAY_SETTINGS.showMoleculeHints,
      showAtomicNumbers: typeof parsed.showAtomicNumbers === "boolean" ? parsed.showAtomicNumbers : DEFAULT_DISPLAY_SETTINGS.showAtomicNumbers,
    };
  } catch {
    return DEFAULT_DISPLAY_SETTINGS;
  }
};

export function useGameDisplaySettings() {
  const [settings, setSettings] = useState<DisplaySettings>(DEFAULT_DISPLAY_SETTINGS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setSettings(readSettings());
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(handle);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(DISPLAY_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }, [hydrated, settings]);

  return {
    ...settings,
    setShowMoleculeHints: (showMoleculeHints: boolean) => setSettings((current) => ({ ...current, showMoleculeHints })),
    setShowAtomicNumbers: (showAtomicNumbers: boolean) => setSettings((current) => ({ ...current, showAtomicNumbers })),
  };
}
