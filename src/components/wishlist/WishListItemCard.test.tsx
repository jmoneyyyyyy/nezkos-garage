import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  CANCEL_BUTTON_TEXT,
  DELETE_BUTTON_TEXT,
  EDIT_BUTTON_TEXT,
  SAVE_CHANGES_BUTTON_TEXT,
  WISHLIST_LINK_INVALID_ERROR,
  WISHLIST_PRICE_LABEL,
  WISHLIST_PRODUCT_LINK_LABEL,
  WISHLIST_PRODUCT_NAME_LABEL,
  wishListPriceBelowCurrentError,
  WISHLIST_NOT_CHECKED_TEXT,
  WISHLIST_NO_PRICE_FOUND_TEXT,
  WISHLIST_PAGE_GONE_TEXT,
  WISHLIST_PRICE_CHECK_BLOCKED_TEXT,
} from "../../Constants";
import type { WishListItem } from "../../types/wishlist";
import { formatPrice } from "../../utils/formatters";
import WishListItemCard from "./WishListItemCard";

const mutate = vi.fn();
const updateMutate = vi.fn();
const idle = { isPending: false, isError: false, error: null };
vi.mock("../../hooks/useWishlist", () => ({
  useDeleteWishListItem: () => ({ mutate, ...idle }),
  useUpdateWishListItem: () => ({ mutate: updateMutate, ...idle }),
  useAddWishListItem: () => ({ mutate: vi.fn(), ...idle }),
}));

const base: WishListItem = { id: "i1", name: "Floor jack", link: "https://shop.test/jack", price: 100 };

const renderCard = (item: Partial<WishListItem> = {}) =>
  render(
    <ul>
      <WishListItemCard uid="u1" vehicleId="v1" item={{ ...base, ...item }} />
    </ul>
  );

beforeEach(() => {
  mutate.mockClear();
  updateMutate.mockClear();
});

describe("WishListItemCard price line", () => {
  it("shows savings and percent off when current price is below target", () => {
    renderCard({ currentPrice: 75 });
    const price = screen.getByTestId("wishlist-item-price");
    expect(price).toHaveTextContent("$75.00");
    expect(price).toHaveAttribute("data-on-sale", "true");
    expect(screen.getByText(/Original Price \$100\.00/)).toHaveTextContent("Save $25.00 (25% off)");
  });

  it.each([
    ["above target", 120],
    ["equal to target", 100],
  ])("shows no savings when current price is %s", (_label, currentPrice) => {
    renderCard({ currentPrice });
    expect(screen.queryByText(/Save /)).not.toBeInTheDocument();
    const price = screen.getByTestId("wishlist-item-price");
    expect(price).toHaveTextContent(formatPrice(currentPrice));
    expect(price).toHaveAttribute("data-on-sale", "false");
  });

  it("shows the target price and not-checked text before the checker has run", () => {
    renderCard();
    expect(screen.getByTestId("wishlist-item-price")).toHaveTextContent("$100.00");
    expect(screen.getByText(new RegExp(WISHLIST_NOT_CHECKED_TEXT))).toBeInTheDocument();
  });

  it("shows when the price was last checked", () => {
    const lastCheckedAt = "2026-11-26T15:30:00.000Z";
    renderCard({ currentPrice: 100, lastCheckedAt });
    expect(screen.getByText(/Checked/)).toHaveTextContent(
      `Checked ${new Date(lastCheckedAt).toLocaleDateString()}`
    );
  });
});

describe("WishListItemCard edit", () => {
  const openEdit = async (item: Partial<WishListItem> = {}) => {
    renderCard(item);
    await userEvent.click(screen.getByRole("button", { name: EDIT_BUTTON_TEXT }));
    const dialog = screen.getByRole("dialog");
    const field = (label: string) => within(dialog).getByLabelText(label);
    const replace = async (label: string, value: string) => {
      await userEvent.clear(field(label));
      await userEvent.type(field(label), value);
    };
    const save = () => userEvent.click(within(dialog).getByRole("button", { name: SAVE_CHANGES_BUTTON_TEXT }));
    return { dialog, field, replace, save };
  };

  it("opens a prefilled form and saves the edited fields", async () => {
    const { field, replace, save } = await openEdit({ currentPrice: 75 });
    expect(field(WISHLIST_PRODUCT_NAME_LABEL)).toHaveValue("Floor jack");
    expect(field(WISHLIST_PRICE_LABEL)).toHaveValue("100");

    await replace(WISHLIST_PRICE_LABEL, "90");
    await save();

    expect(updateMutate).toHaveBeenCalledWith(
      { vehicleId: "v1", item: { id: "i1", name: "Floor jack", link: "https://shop.test/jack", price: 90 } },
      expect.anything()
    );
  });

  it("blocks a price below the current sale price and shows it in the modal", async () => {
    const { dialog, replace, save } = await openEdit({ currentPrice: 75 });
    await replace(WISHLIST_PRICE_LABEL, "70");
    await save();
    expect(updateMutate).not.toHaveBeenCalled();
    expect(within(dialog).getByRole("alert")).toHaveTextContent(wishListPriceBelowCurrentError("$75.00"));
  });

  it("allows a price equal to the current sale price", async () => {
    const { replace, save } = await openEdit({ currentPrice: 75 });
    await replace(WISHLIST_PRICE_LABEL, "75");
    await save();
    expect(updateMutate).toHaveBeenCalled();
  });

  it("allows a lower price when the link is also changed", async () => {
    const { replace, save } = await openEdit({ currentPrice: 75 });
    await replace(WISHLIST_PRICE_LABEL, "70");
    await replace(WISHLIST_PRODUCT_LINK_LABEL, "https://other.test/jack");
    await save();
    expect(updateMutate).toHaveBeenCalled();
  });

  it("does not save an invalid link", async () => {
    const { dialog, replace, save } = await openEdit();
    await replace(WISHLIST_PRODUCT_LINK_LABEL, "not a url");
    await save();
    expect(updateMutate).not.toHaveBeenCalled();
    expect(within(dialog).getByRole("alert")).toHaveTextContent(WISHLIST_LINK_INVALID_ERROR);
  });
});

describe("WishListItemCard delete", () => {
  it("deletes after the user confirms", async () => {
    renderCard();
    await userEvent.click(screen.getByRole("button", { name: DELETE_BUTTON_TEXT }));
    expect(mutate).not.toHaveBeenCalled();
    const dialog = screen.getByRole("dialog");
    await userEvent.click(within(dialog).getByRole("button", { name: DELETE_BUTTON_TEXT }));
    expect(mutate).toHaveBeenCalledWith({ vehicleId: "v1", itemId: "i1" });
  });

  it("does nothing if the user cancels", async () => {
    renderCard();
    await userEvent.click(screen.getByRole("button", { name: DELETE_BUTTON_TEXT }));
    const dialog = screen.getByRole("dialog");
    await userEvent.click(within(dialog).getByRole("button", { name: CANCEL_BUTTON_TEXT }));
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

  it.each(["HTTP 500", "This operation was aborted"])("shows no notice for %s", (priceError) => {
    renderCard({ priceError });
    expect(screen.queryByText(WISHLIST_PRICE_CHECK_BLOCKED_TEXT)).not.toBeInTheDocument();
    expect(screen.queryByText(WISHLIST_PAGE_GONE_TEXT)).not.toBeInTheDocument();
  });

  it("shows a red notice with the last tried date when no price was found", () => {
    const lastCheckedAt = "2026-11-26T15:30:00.000Z";
    renderCard({ priceError: "no price found", lastCheckedAt });
    expect(screen.getByRole("alert")).toHaveTextContent(
      `${WISHLIST_NO_PRICE_FOUND_TEXT} · Last tried ${new Date(lastCheckedAt).toLocaleDateString()}`
    );
    expect(screen.queryByText(WISHLIST_PRICE_CHECK_BLOCKED_TEXT)).not.toBeInTheDocument();
  });

  it("leaves out the date when the last check time is missing", () => {
    renderCard({ priceError: "no price found" });
    expect(screen.getByRole("alert")).toHaveTextContent(new RegExp(`^${WISHLIST_NO_PRICE_FOUND_TEXT}$`));
  });

  it("shows no blocked notice when there is no error", () => {
    renderCard();
    expect(screen.queryByText(WISHLIST_PRICE_CHECK_BLOCKED_TEXT)).not.toBeInTheDocument();
  });
});
