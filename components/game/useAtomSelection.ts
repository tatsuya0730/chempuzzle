"use client";

import { useMemo, useState } from "react";
import type { TokenSymbol } from "@/types/game";
import { ATOM_SELECTION_STORAGE_KEY, DEFAULT_GAME_ATOMS, normalizeAtomSelection } from "@/lib/game/periodic";

export function useAtomSelection() {
  const [enabledAtoms, setEnabledAtoms] = useState<TokenSymbol[]>(() => {
    if (typeof window === "undefined") return DEFAULT_GAME_ATOMS;
    const saved = window.localStorage.getItem(ATOM_SELECTION_STORAGE_KEY);
    if (!saved) return DEFAULT_GAME_ATOMS;
    try {
      return normalizeAtomSelection(JSON.parse(saved));
    } catch {
      return DEFAULT_GAME_ATOMS;
    }
  });

  const actions = useMemo(
    () => ({
      setEnabledAtoms: (atoms: TokenSymbol[]) => {
        const normalized = normalizeAtomSelection(atoms);
        setEnabledAtoms(normalized);
        window.localStorage.setItem(ATOM_SELECTION_STORAGE_KEY, JSON.stringify(normalized));
      },
      resetEnabledAtoms: () => {
        setEnabledAtoms(DEFAULT_GAME_ATOMS);
        window.localStorage.setItem(ATOM_SELECTION_STORAGE_KEY, JSON.stringify(DEFAULT_GAME_ATOMS));
      },
    }),
    [],
  );

  return { enabledAtoms, ...actions };
}
