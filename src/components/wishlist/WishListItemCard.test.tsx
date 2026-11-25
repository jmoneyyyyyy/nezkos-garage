import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  DELETE_BUTTON_TEXT,
  WISHLIST_ON_SALE_TEXT,
  WISHLIST_PAGE_GONE_TEXT,
  WISHLIST_PRICE_CHECK_BLOCKED_TEXT,
} from "../../Constants";
import type { WishListItem } from "../../types/wishlist";
import WishListItemCard from "./WishListItemCard";

const mutate = vi.fn();
vi.mock("../../hooks/useWishlist", () => ({
  useDeleteWishListItem: () => ({ mutate, isPending: false, isError: false, error: null }),
}));

const base: WishListItem = { id: "i1", name: "Floor jack", link: "https://shop.test/jack", price: 100 };

const renderCard = (item: Partial<WishListItem> = {}) =>
  render(
    <ul>
      <WishListItemCard uid="u1" vehicleId="v1" item={{ ...base, ...item }} />
    </ul>
  );

beforeEach(() => mutate.mockClear());

describe("WishListItemCard price drop notice", () => {
  it("shows savings and percent off when current price is below target", () => {
    renderCard({ currentPrice: 75 });
    const note = screen.getByRole("status");
    expect(note).toHaveTextContent(WISHLIST_ON_SALE_TEXT);
    expect(note).toHaveTextContent("Save $25.00");
    expect(note).toHaveTextContent("25% off");
  });

  it.each([
    ["above target", 120],
    ["equal to target", 100],
  ])("shows no notice when current price is %s", (_label, currentPrice) => {
    renderCard({ currentPrice });
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("shows no current price or notice before the checker has run", () => {
    renderCard();
    expect(screen.queryByText(/Current Price/)).not.toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});

describe("WishListItemCard delete", () => {
  it("deletes after the user confirms", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    renderCard();
    await userEvent.click(screen.getByRole("button", { name: DELETE_BUTTON_TEXT }));
    expect(mutate).toHaveBeenCalledWith({ vehicleId: "v1", itemId: "i1" });
  });

  it("does nothing if the user cancels", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    renderCard();
    await userEvent.click(screen.getByRole("button", { name: DELETE_BUTTON_TEXT }));
    expect(mutate).not.toHaveBeenCalled();
  });
});

describe("WishListItemCard blocked price check", () => {
  it("shows a red notice when the site refused the request (HTTP 403)", () => {
    renderCard({ priceError: "HTTP 403" });
    expect(screen.getByRole("alert")).toHaveTextContent(WISHLIST_PRICE_CHECK_BLOCKED_TEXT);
  });

  it.each(["HTTP 404", "HTTP 410"])("shows the page-gone notice for %s", (priceError) => {
    renderCard({ priceError });
    expect(screen.getByRole("alert")).toHaveTextContent(WISHLIST_PAGE_GONE_TEXT);
    expect(screen.queryByText(WISHLIST_PRICE_CHECK_BLOCKED_TEXT)).not.toBeInTheDocument();
  });

  it.each(["HTTP 500", "no price found"])("shows no notice for %s", (priceError) => {
    renderCard({ priceError });
    expect(screen.queryByText(WISHLIST_PRICE_CHECK_BLOCKED_TEXT)).not.toBeInTheDocument();
    expect(screen.queryByText(WISHLIST_PAGE_GONE_TEXT)).not.toBeInTheDocument();
  });

  it("shows no blocked notice when there is no error", () => {
    renderCard();
    expect(screen.queryByText(WISHLIST_PRICE_CHECK_BLOCKED_TEXT)).not.toBeInTheDocument();
  });
});
