import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CLOSE_LABEL } from "../../Constants";
import AppDialog from "./AppDialog";

describe("AppDialog", () => {
  it("shows its children in a dialog when open", () => {
    render(<AppDialog open onClose={vi.fn()}>hello</AppDialog>);
    expect(within(screen.getByRole("dialog")).getByText("hello")).toBeInTheDocument();
  });

  it("renders nothing while closed", () => {
    render(<AppDialog open={false} onClose={vi.fn()}>hello</AppDialog>);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByText("hello")).not.toBeInTheDocument();
  });

  it("keeps children mounted while closed with keepMounted", () => {
    render(<AppDialog open={false} keepMounted onClose={vi.fn()}>hello</AppDialog>);
    expect(screen.getByText("hello")).toBeInTheDocument();
  });

  it("calls onClose from the close button and from Escape", async () => {
    const onClose = vi.fn();
    render(<AppDialog open onClose={onClose}>hello</AppDialog>);
    await userEvent.click(screen.getByRole("button", { name: CLOSE_LABEL }));
    expect(onClose).toHaveBeenCalledTimes(1);
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
