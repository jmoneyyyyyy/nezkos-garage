import { CLOSE_LABEL } from "../../Constants";
import { useEffect, useRef, type ReactNode } from "react";

type ModalProps = { open: boolean; onClose: () => void; className?: string; children: ReactNode };

export default function Modal({ open, onClose, className, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && !dialog?.open) dialog?.showModal();
    if (!open && dialog?.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className={className ? `modal ${className}` : "modal"}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-body">
        <button type="button" className="modal-close" aria-label={CLOSE_LABEL} onClick={onClose}>
          ×
        </button>
        {children}
      </div>
    </dialog>
  );
}
