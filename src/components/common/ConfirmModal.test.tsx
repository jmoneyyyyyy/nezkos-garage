import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CANCEL_BUTTON_TEXT } from "../../Constants";
import ConfirmModal from "./ConfirmModal";

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

  it("marks the confirm button as danger by default", () => {
    setup();
    expect(screen.getByRole("button", { name: "Delete" })).toHaveAttribute("data-tone", "danger");
  });

  it("does not mark the confirm button as danger for the default tone", () => {
    setup({ tone: "default" });
    expect(screen.getByRole("button", { name: "Delete" })).toHaveAttribute("data-tone", "default");
  });

  it("renders nothing while closed", () => {
    setup({ open: false });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
