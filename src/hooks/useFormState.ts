import { useState } from "react";

/**
 * Form values plus a `set(key)` factory that makes the onChange handler for one field.
 * Also returns the raw setter, for resetting the whole form.
 */
export function useFormState<T extends object>(initial: T | (() => T)) {
  const [form, setForm] = useState(initial);
  const set = (key: keyof T) => (e: { target: { value: string } }) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  return [form, set, setForm] as const;
}
