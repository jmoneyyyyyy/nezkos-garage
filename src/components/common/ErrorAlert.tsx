import Alert from "@mui/material/Alert";
import type { SxProps, Theme } from "@mui/material/styles";

type ErrorAlertProps = {
  /** One-off layout, e.g. margins or a flex basis. */
  sx?: SxProps<Theme>;
  /** Shown before the message, e.g. "Couldn't save". */
  prefix?: string;
  /** Renders nothing when empty, so callers can pass the error straight through. */
  error?: Error | string | null;
};

/** One `role="alert"` error line: `prefix: message`. */
export default function ErrorAlert({ prefix, error, sx }: ErrorAlertProps) {
  if (!error) return null;
  const message = typeof error === "string" ? error : error.message;
  return (
    <Alert severity="error" sx={sx}>
      {prefix ? `${prefix}: ${message}` : message}
    </Alert>
  );
}
