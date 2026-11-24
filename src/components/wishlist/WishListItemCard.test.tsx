import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WISHLIST_ITEM_DELETE_TEXT, WISHLIST_ON_SALE_TEXT } from "../../Constants";
import type { WishListItem } from "../../types/vehicle";
import WishListItemCard from "./WishListItemCard";

const mutate = vi.fn();
vi.mock("../../hooks/useVehicles", () => ({
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
    await userEvent.click(screen.getByRole("button", { name: WISHLIST_ITEM_DELETE_TEXT }));
    expect(mutate).toHaveBeenCalledWith({ vehicleId: "v1", itemId: "i1" });
  });

  it("does nothing if the user cancels", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    renderCard();
    await userEvent.click(screen.getByRole("button", { name: WISHLIST_ITEM_DELETE_TEXT }));
    expect(mutate).not.toHaveBeenCalled();
  });
});
