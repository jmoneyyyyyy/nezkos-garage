import { arrayUnion, runTransaction, updateDoc } from "firebase/firestore";
import { addWishListItem, deleteWishListItem, updateWishListItem } from "./wishlist";

vi.mock("../lib/firebase", () => ({ vehicleCollection: {} }));
vi.mock("../utils/newId", () => ({ newId: vi.fn(() => "new-id") }));
vi.mock("firebase/firestore", () => ({
  arrayUnion: vi.fn((v) => v),
  doc: vi.fn(() => "doc-ref"),
  runTransaction: vi.fn(),
  serverTimestamp: vi.fn(() => "SERVER_TS"),
  updateDoc: vi.fn(),
}));

/** Make runTransaction run its callback against a fake vehicle doc and expose what it writes. */
function fakeTransaction(data: Record<string, unknown> | null) {
  const update = vi.fn();
  const transaction = {
    get: vi.fn().mockResolvedValue({ exists: () => data !== null, data: () => data }),
    update,
  };
  vi.mocked(runTransaction).mockImplementation(((_db: unknown, fn: (t: typeof transaction) => unknown) =>
    fn(transaction)) as never);
  return update;
}

beforeEach(() => vi.clearAllMocks());

describe("addWishListItem", () => {
  it("appends the item with a new id and bumps updatedAt", async () => {
    const input = { name: "Jack", link: "https://shop.test/a", price: 100 };
    await addWishListItem("v1", input);

    expect(arrayUnion).toHaveBeenCalledWith({ id: "new-id", ...input });
    expect(updateDoc).toHaveBeenCalledWith("doc-ref", {
      wishlist: { id: "new-id", ...input },
      updatedAt: "SERVER_TS",
    });
  });
});

describe("wish list edits", () => {
  const checked = {
    id: "w1", name: "Jack", link: "https://shop.test/a", price: 100,
    currentPrice: 80, lastCheckedAt: "2026-01-01T00:00:00Z", priceError: "old error",
  };
  const other = { id: "w2", name: "Wax", link: "https://shop.test/b", price: 20 };

  it("keeps the checker's fields when the link is unchanged", async () => {
    const update = fakeTransaction({ wishlist: [checked, other] });
    await updateWishListItem("v1", { id: "w1", name: "Better jack", link: checked.link, price: 90 });

    const [, payload] = update.mock.calls[0];
    expect(payload.wishlist[0]).toEqual({
      id: "w1", name: "Better jack", link: checked.link, price: 90,
      currentPrice: 80, lastCheckedAt: "2026-01-01T00:00:00Z", priceError: "old error",
    });
    expect(payload.wishlist[1]).toBe(other);
  });

  it("drops the checker's fields when the link changes", async () => {
    const update = fakeTransaction({ wishlist: [checked] });
    const edited = { id: "w1", name: "Jack", link: "https://other.test/a", price: 100 };
    await updateWishListItem("v1", edited);

    expect(update.mock.calls[0][1].wishlist[0]).toEqual(edited);
  });

  it("does not write undefined checker fields", async () => {
    const update = fakeTransaction({ wishlist: [other] });
    await updateWishListItem("v1", { ...other, price: 25 });

    expect(update.mock.calls[0][1].wishlist[0]).toEqual({ ...other, price: 25 });
    expect(Object.keys(update.mock.calls[0][1].wishlist[0])).not.toContain("currentPrice");
  });

  it("deleteWishListItem removes only the matching item", async () => {
    const update = fakeTransaction({ wishlist: [checked, other] });
    await deleteWishListItem("v1", "w1");
    expect(update.mock.calls[0][1].wishlist).toEqual([other]);
  });
});
