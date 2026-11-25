import { CANCEL_BUTTON_TEXT } from "../../Constants";
import Modal from "./Modal";

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
    <Modal open={open} onClose={onCancel} className="confirm-dialog">
      <div className="confirm-modal">
        <p>{message}</p>
        <div className="confirm-modal-actions">
          <button type="button" onClick={onCancel}>{CANCEL_BUTTON_TEXT}</button>
          <button type="button" className={tone === "danger" ? "danger" : undefined} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
