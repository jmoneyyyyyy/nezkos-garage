import { useEffect, useState } from "react";

/**
 * useState that is also kept in localStorage under `key`, so the value survives route changes
 * and reloads. Saved data that is missing, unreadable, or fails `isValid` falls back to `initial`.
 */
export function useLocalStorageState<T>(key: string, initial: T, isValid: (value: unknown) => value is T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(key) ?? "null");
      if (isValid(saved)) return saved;
    } catch {
      // Missing, corrupt, or blocked storage: use the initial value.
    }
    return initial;
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage full or blocked: the value still works, it just won't be remembered.
    }
  }, [key, value]);

  return [value, setValue] as const;
}
