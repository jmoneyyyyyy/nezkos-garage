import { useState } from "react";
import Button from "@mui/material/Button";
import { DELETING_TEXT } from "../../Constants";
import ConfirmModal from "./ConfirmModal";

type DeleteWithConfirmProps = {
  /** Button text, e.g. "Delete". */
  label: string;
  /** Button text while the delete is running (defaults to "Deleting..."). */
  pendingLabel?: string;
  /** The "are you sure?" question. */
  message: string;
  isPending: boolean;
  size?: "small" | "medium";
  /** Runs after the user confirms; the dialog is already closed by then. */
  onDelete: () => void;
};

/** A red Delete button that asks for confirmation first. Callers show any delete error themselves. */
export default function DeleteWithConfirm({
  label,
  pendingLabel = DELETING_TEXT,
  message,
  isPending,
  size,
  onDelete,
}: DeleteWithConfirmProps) {
  const [confirming, setConfirming] = useState(false);

  const confirm = () => {
    setConfirming(false);
    onDelete();
  };

  return (
    <>
      <Button variant="outlined" color="error" size={size} onClick={() => setConfirming(true)} disabled={isPending}>
        {isPending ? pendingLabel : label}
      </Button>
      <ConfirmModal
        open={confirming}
        message={message}
        confirmLabel={label}
        onConfirm={confirm}
        onCancel={() => setConfirming(false)}
      />
    </>
  );
}
