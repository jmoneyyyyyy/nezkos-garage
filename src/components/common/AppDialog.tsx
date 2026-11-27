import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Dialog, { type DialogProps } from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import { CLOSE_LABEL } from "../../Constants";

type AppDialogProps = {
  open: boolean;
  onClose: () => void;
  maxWidth?: DialogProps["maxWidth"];
  /** Keep the children mounted while closed (only for forms that rely on keeping their state). */
  keepMounted?: boolean;
  children: ReactNode;
};

/** The app's modal: a MUI Dialog with a close button. Esc and a backdrop click both call onClose. */
export default function AppDialog({ open, onClose, maxWidth = "sm", keepMounted, children }: AppDialogProps) {
  return (
    <Dialog open={open} onClose={() => onClose()} maxWidth={maxWidth} fullWidth keepMounted={keepMounted}>
      <IconButton
        aria-label={CLOSE_LABEL}
        onClick={() => onClose()}
        sx={{ position: "absolute", top: 12, right: 12, width: 32, height: 32, fontSize: 22, color: "text.secondary" }}
      >
        ×
      </IconButton>
      <Box sx={{ p: 3.5 }}>{children}</Box>
    </Dialog>
  );
}
