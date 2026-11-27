import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import { FUNDS_TAB_TEXT, GARAGE_TAB_TEXT, MAIN_NAV_LABEL, WISHLIST_TAB_TEXT } from "../../Constants";
import TabNav from "./TabNav";

function Path() {
  return <p data-testid="path">{useLocation().pathname}</p>;
}

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <TabNav />
      <Path />
    </MemoryRouter>
  );

describe("TabNav", () => {
  it("is a labelled nav with a link for each section", () => {
    renderAt("/vehicles");
    const nav = screen.getByRole("navigation", { name: MAIN_NAV_LABEL });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: GARAGE_TAB_TEXT })).toHaveAttribute("href", "/vehicles");
    expect(screen.getByRole("tab", { name: FUNDS_TAB_TEXT })).toHaveAttribute("href", "/funds");
    expect(screen.getByRole("tab", { name: WISHLIST_TAB_TEXT })).toHaveAttribute("href", "/wishlist");
  });

  it("selects the tab that matches the current route", () => {
    renderAt("/funds");
    expect(screen.getByRole("tab", { name: FUNDS_TAB_TEXT })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: GARAGE_TAB_TEXT })).toHaveAttribute("aria-selected", "false");
  });

  it("navigates and moves the selection when a tab is clicked", async () => {
    renderAt("/vehicles");
    await userEvent.click(screen.getByRole("tab", { name: WISHLIST_TAB_TEXT }));
    expect(screen.getByTestId("path")).toHaveTextContent("/wishlist");
    expect(screen.getByRole("tab", { name: WISHLIST_TAB_TEXT })).toHaveAttribute("aria-selected", "true");
  });
});
