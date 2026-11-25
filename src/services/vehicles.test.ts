import { deleteField, getDocs, runTransaction, updateDoc } from "firebase/firestore";
import {
  deleteMaintenanceEntry,
  getAllVehicles,
  updateMaintenanceEntry,
  updateVehicleInformation,
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
