import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CANCEL_BUTTON_TEXT } from "../../Constants";
import ConfirmModal from "./ConfirmModal";

// jsdom doesn't implement the <dialog> methods that Modal relies on.
HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
  this.setAttribute("open", "");
};
HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) {
  this.removeAttribute("open");
  this.dispatchEvent(new Event("close"));
};

const setup = (props: Partial<Parameters<typeof ConfirmModal>[0]> = {}) => {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  render(
    <ConfirmModal
      open
      message="Delete the thing?"
      confirmLabel="Delete"
      onConfirm={onConfirm}
      onCancel={onCancel}
      {...props}
    />
  );
  return { onConfirm, onCancel };
};

describe("ConfirmModal", () => {
  it("shows the message and calls onConfirm", async () => {
    const { onConfirm, onCancel } = setup();
    expect(screen.getByText("Delete the thing?")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onCancel).not.toHaveBeenCalled();
  });

  it("calls onCancel from the Cancel button", async () => {
    const { onConfirm, onCancel } = setup();
    await userEvent.click(screen.getByRole("button", { name: CANCEL_BUTTON_TEXT }));
    expect(onCancel).toHaveBeenCalledOnce();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("styles the confirm button as danger by default, not for the default tone", () => {
    setup();
    expect(screen.getByRole("button", { name: "Delete" })).toHaveClass("danger");
  });

  it("omits the danger class for the default tone", () => {
    setup({ tone: "default" });
    expect(screen.getByRole("button", { name: "Delete" })).not.toHaveClass("danger");
  });
});
