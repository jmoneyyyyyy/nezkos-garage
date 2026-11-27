import type { ChangeEvent, HTMLAttributes, ReactNode } from "react";
import TextField from "@mui/material/TextField";

type FormTextFieldProps = {
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  /** Sets aria-required only. The native `required` is deliberately not used, so our own validation messages show. */
  required?: boolean;
  /** Numeric fields stay type="text" with an inputMode, so values like "20,000" can still be typed. */
  inputMode?: HTMLAttributes<HTMLElement>["inputMode"];
  placeholder?: string;
  type?: "text" | "date";
  multiline?: boolean;
  minRows?: number;
  /** Renders a native <select>; pass <option>s as children. */
  select?: boolean;
  children?: ReactNode;
};

/** A labelled text input, date input, textarea or native select, styled by the theme. */
export default function FormTextField({
  label,
  value,
  onChange,
  required,
  inputMode,
  placeholder,
  type,
  multiline,
  minRows,
  select,
  children,
}: FormTextFieldProps) {
  // A placeholder or a date format would sit under an unshrunk label, so float the label above them.
  const shrink = type === "date" || placeholder ? true : undefined;
  return (
    <TextField
      label={label}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      type={type}
      multiline={multiline}
      minRows={minRows}
      select={select}
      size="small"
      fullWidth
      slotProps={{
        htmlInput: { "aria-required": required || undefined, inputMode },
        inputLabel: { shrink },
        select: select ? { native: true } : undefined,
      }}
    >
      {children}
    </TextField>
  );
}
