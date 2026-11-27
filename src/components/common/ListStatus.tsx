import type { ReactNode } from "react";
import type { SxProps, Theme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import ErrorAlert from "./ErrorAlert";

/** A centered status line (loading, empty). */
export function StatusText({ children, sx }: { children: ReactNode; sx?: SxProps<Theme> }) {
  return (
    <Typography
      sx={[
        { width: "min(560px, calc(100% - 48px))", m: "32px auto 0", textAlign: "center", fontSize: 15, color: "text.secondary" },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Typography>
  );
}

type ListStatusProps = {
  isLoading: boolean;
  error?: Error | null;
  isEmpty: boolean;
  loadingText: string;
  emptyText: string;
  /** Shown before the error message, e.g. "Couldn't load vehicles". */
  errorText: string;
  /** Append the error's own message to errorText (default true). */
  errorDetail?: boolean;
  /** Rendered only when none of the statuses apply. */
  children: ReactNode;
};

/** Loading, error and empty states for a list; renders its children once there's data to show. */
export default function ListStatus({
  isLoading,
  error,
  isEmpty,
  loadingText,
  emptyText,
  errorText,
  errorDetail = true,
  children,
}: ListStatusProps) {
  if (isLoading) return <StatusText>{loadingText}</StatusText>;
  if (error) return <ErrorAlert error={errorDetail ? `${errorText}: ${error.message}` : errorText} />;
  if (isEmpty) return <StatusText>{emptyText}</StatusText>;
  return <>{children}</>;
}
