import { render, screen } from "@testing-library/react";
import ErrorAlert from "./ErrorAlert";

describe("ErrorAlert", () => {
  it("renders nothing without an error", () => {
    render(<ErrorAlert error={null} />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows a string error as one alert", () => {
    render(<ErrorAlert error="Bad input" />);
    expect(screen.getAllByRole("alert")).toHaveLength(1);
    expect(screen.getByRole("alert")).toHaveTextContent(/^Bad input$/);
  });

  it("joins the prefix and an Error's message", () => {
    render(<ErrorAlert prefix="Couldn't save" error={new Error("offline")} />);
    expect(screen.getByRole("alert")).toHaveTextContent(/^Couldn't save: offline$/);
  });
});
