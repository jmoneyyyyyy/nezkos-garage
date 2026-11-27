import { render, screen } from "@testing-library/react";
import ListStatus from "./ListStatus";

const renderStatus = (props: Partial<Parameters<typeof ListStatus>[0]> = {}) =>
  render(
    <ListStatus
      isLoading={false}
      isEmpty={false}
      loadingText="Loading..."
      emptyText="Nothing here"
      errorText="Couldn't load"
      {...props}
    >
      <p>the list</p>
    </ListStatus>
  );

describe("ListStatus", () => {
  it("shows the loading text", () => {
    renderStatus({ isLoading: true });
    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.queryByText("the list")).not.toBeInTheDocument();
  });

  it("shows the error with its message as an alert", () => {
    renderStatus({ error: new Error("offline") });
    expect(screen.getByRole("alert")).toHaveTextContent("Couldn't load: offline");
  });

  it("can leave the error's message out", () => {
    renderStatus({ error: new Error("offline"), errorDetail: false });
    expect(screen.getByRole("alert")).toHaveTextContent(/^Couldn't load$/);
  });

  it("shows the empty text", () => {
    renderStatus({ isEmpty: true });
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
  });

  it("shows the children when there is data", () => {
    renderStatus();
    expect(screen.getByText("the list")).toBeInTheDocument();
  });
});
