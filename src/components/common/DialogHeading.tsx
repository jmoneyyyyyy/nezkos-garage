import type { ReactNode } from "react";
import Typography from "@mui/material/Typography";

/** The title at the top of a dialog. Leaves room on the right for the close button. */
export default function DialogHeading({ children }: { children: ReactNode }) {
  return (
    <Typography component="h2" variant="h2" sx={{ fontSize: 26, lineHeight: 1.2, mb: 0.5, pr: 4 }}>
      {children}
    </Typography>
  );
}
