import { render, screen } from "@testing-library/react";
import { COULDNT_SAVE_TEXT, SAVING_TEXT } from "../../Constants";
import FormActions from "./FormActions";

const renderActions = (props: Partial<Parameters<typeof FormActions>[0]> = {}) =>
  render(
    <form>
      <FormActions isPending={false} label="Add thing" {...props} />
    </form>
  );

describe("FormActions", () => {
  it("shows an enabled submit button with the label", () => {
    renderActions();
    const button = screen.getByRole("button", { name: "Add thing" });
    expect(button).toHaveAttribute("type", "submit");
    expect(button).toBeEnabled();
  });

  it("shows the saving text and disables the button while pending", () => {
    renderActions({ isPending: true });
    expect(screen.getByRole("button", { name: SAVING_TEXT })).toBeDisabled();
  });

  it("shows the validation error and the save error as separate alerts", () => {
    renderActions({ error: "Name is required", saveError: new Error("offline") });
    const alerts = screen.getAllByRole("alert");
    expect(alerts).toHaveLength(2);
    expect(alerts[0]).toHaveTextContent("Name is required");
    expect(alerts[1]).toHaveTextContent(`${COULDNT_SAVE_TEXT}: offline`);
  });

  it("shows no alerts when there are no errors", () => {
    renderActions();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("puts the note before the button by default and after it on request", () => {
    const { unmount } = renderActions({ note: "* required" });
    const button = screen.getByRole("button");
    expect(screen.getByText("* required").compareDocumentPosition(button)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    unmount();

    renderActions({ note: "* required", notePosition: "after" });
    expect(screen.getByRole("button").compareDocumentPosition(screen.getByText("* required"))).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
  });
});
