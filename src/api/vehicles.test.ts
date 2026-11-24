import { deleteField, getDocs, runTransaction, updateDoc } from "firebase/firestore";
import {
  deleteMaintenanceEntry,
  deleteWishListItem,
  getAllVehicles,
  updateMaintenanceEntry,
  updateVehicleInformation,
  updateWishListItem,
} from "./vehicles";

vi.mock("../lib/firebase", () => ({ vehicleCollection: {} }));
vi.mock("firebase/firestore", () => ({
  addDoc: vi.fn(),
  arrayUnion: vi.fn((v) => v),
  collection: vi.fn(() => "collection-ref"),
  deleteDoc: vi.fn(),
  deleteField: vi.fn(() => "DELETE_FIELD"),
  doc: vi.fn(() => "doc-ref"),
  getDocs: vi.fn(),
  query: vi.fn((...args) => args),
  runTransaction: vi.fn(),
  serverTimestamp: vi.fn(() => "SERVER_TS"),
  updateDoc: vi.fn(),
  where: vi.fn((...args) => ({ where: args })),
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

describe("getAllVehicles", () => {
  it("returns the user's vehicles with ids merged in", async () => {
    vi.mocked(getDocs).mockResolvedValue({
      docs: [{ id: "v1", data: () => ({ name: "Truck", owners: ["u1"] }) }],
    } as never);

    expect(await getAllVehicles("u1")).toEqual([{ id: "v1", name: "Truck", owners: ["u1"] }]);
  });
});

describe("updateVehicleInformation", () => {
  it("turns omitted optional fields into deleteField()", async () => {
    await updateVehicleInformation("v1", {
      name: "Truck", make: "Ford", model: "F-150", year: 2020, mileage: 1000, color: "Blue",
    });

    expect(deleteField).toHaveBeenCalledTimes(3);
    expect(updateDoc).toHaveBeenCalledWith(
      "doc-ref",
      expect.objectContaining({ trim: "DELETE_FIELD", vin: "DELETE_FIELD", licensePlate: "DELETE_FIELD" })
    );
  });

  it("keeps optional fields that are provided", async () => {
    await updateVehicleInformation("v1", {
      name: "Truck", make: "Ford", model: "F-150", year: 2020, mileage: 1000, color: "Blue", trim: "XLT",
    });

    expect(updateDoc).toHaveBeenCalledWith("doc-ref", expect.objectContaining({ trim: "XLT" }));
  });
});

describe("maintenance list edits", () => {
  const entries = [
    { id: "a", type: "oil_change", date: "2025-01-01" },
    { id: "b", type: "battery", date: "2025-02-01" },
  ];

  it("deleteMaintenanceEntry removes only the matching entry", async () => {
    const update = fakeTransaction({ maintenance: entries });
    await deleteMaintenanceEntry("v1", "a");
    expect(update).toHaveBeenCalledWith("doc-ref", { maintenance: [entries[1]], updatedAt: "SERVER_TS" });
  });

  it("updateMaintenanceEntry replaces only the matching entry", async () => {
    const update = fakeTransaction({ maintenance: entries });
    const edited = { id: "b", type: "battery", date: "2025-03-01", cost: 150 };
    await updateMaintenanceEntry("v1", edited as never);
    expect(update).toHaveBeenCalledWith("doc-ref", { maintenance: [entries[0], edited], updatedAt: "SERVER_TS" });
  });

  it("treats a missing list as empty", async () => {
    const update = fakeTransaction({});
    await deleteMaintenanceEntry("v1", "a");
    expect(update).toHaveBeenCalledWith("doc-ref", { maintenance: [], updatedAt: "SERVER_TS" });
  });

  it("throws if the vehicle no longer exists", async () => {
    fakeTransaction(null);
    await expect(deleteMaintenanceEntry("v1", "a")).rejects.toThrow("no longer exists");
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
