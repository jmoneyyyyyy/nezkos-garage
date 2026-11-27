import type { ReactNode, SyntheticEvent } from "react";
import Box from "@mui/material/Box";

const NARROW = "@media (max-width:520px)";

/** A form whose children stack in a column. */
export function FormStack({ onSubmit, children }: { onSubmit: (e: SyntheticEvent) => void; children: ReactNode }) {
  return (
    <Box component="form" onSubmit={onSubmit} sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      {children}
    </Box>
  );
}

/** Two columns of fields, filled top-to-bottom (four rows) then left-to-right; one column when narrow. */
export function FormFieldGrid({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gridTemplateRows: "repeat(4, auto)",
        gridAutoFlow: "column",
        gap: "10px 14px",
        [NARROW]: { gridTemplateColumns: "1fr", gridTemplateRows: "none", gridAutoFlow: "row" },
      }}
    >
      {children}
    </Box>
  );
}

/** Two fields side by side; stacked when narrow. */
export function FormRow({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, [NARROW]: { gridTemplateColumns: "1fr" } }}>
      {children}
    </Box>
  );
}
