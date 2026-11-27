import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CANCEL_BUTTON_TEXT, DELETING_TEXT } from "../../Constants";
import DeleteWithConfirm from "./DeleteWithConfirm";

const setup = (props: Partial<Parameters<typeof DeleteWithConfirm>[0]> = {}) => {
  const onDelete = vi.fn();
  render(<DeleteWithConfirm label="Delete" message="Really delete?" isPending={false} onDelete={onDelete} {...props} />);
  return { onDelete };
};

describe("DeleteWithConfirm", () => {
  it("asks first and does not delete until confirmed", async () => {
    const { onDelete } = setup();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("Really delete?")).toBeInTheDocument();
    expect(onDelete).not.toHaveBeenCalled();

    await userEvent.click(within(dialog).getByRole("button", { name: "Delete" }));
    expect(onDelete).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("cancels without deleting", async () => {
    const { onDelete } = setup();
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    await userEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: CANCEL_BUTTON_TEXT }));
    expect(onDelete).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("is disabled and shows the pending label while deleting", () => {
    setup({ isPending: true });
    expect(screen.getByRole("button", { name: DELETING_TEXT })).toBeDisabled();
  });
});
