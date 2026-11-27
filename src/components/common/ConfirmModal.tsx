import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { CANCEL_BUTTON_TEXT } from "../../Constants";
import AppDialog from "./AppDialog";

type ConfirmModalProps = {
  open: boolean;
  message: string;
  confirmLabel: string;
  /** "danger" styles the confirm button red; defaults to danger since deletes are the main use. */
  tone?: "danger" | "default";
  onConfirm: () => void;
  onCancel: () => void;
};

/** Generic "are you sure?" dialog. The caller owns the open state and runs the action in onConfirm. */
export default function ConfirmModal({
  open,
  message,
  confirmLabel,
  tone = "danger",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <AppDialog open={open} onClose={onCancel} maxWidth="xs">
      <Box sx={{ pt: 1 }}>
        <Typography>{message}</Typography>
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, mt: 2.5 }}>
          <Button variant="outlined" onClick={onCancel}>{CANCEL_BUTTON_TEXT}</Button>
          <Button
            variant={tone === "danger" ? "outlined" : "contained"}
            color={tone === "danger" ? "error" : "primary"}
            data-tone={tone}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </Box>
      </Box>
    </AppDialog>
  );
}
