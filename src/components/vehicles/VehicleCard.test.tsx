import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  ADD_PHOTO_TEXT,
  COLOR_LABEL,
  COULDNT_DELETE_TEXT,
  COULDNT_SAVE_PHOTO_TEXT,
  DELETE_VEHICLE_BUTTON_TEXT,
  EDIT_BUTTON_TEXT,
  EDIT_VEHICLE_TEXT,
  MILEAGE_LABEL,
  NO_MAINTENANCE_RECORDS_TEXT,
  TRIM_LABEL,
  VIN_LABEL,
} from "../../Constants";
import type { Vehicle } from "../../types/vehicle";
import VehicleCard from "./VehicleCard";

const deleteMutate = vi.fn();
const photoMutate = vi.fn();
const idle = { isPending: false, error: null as Error | null, isError: false };
let removeState = { ...idle };
let photoState = { ...idle };
vi.mock("../../hooks/useVehicles", () => ({
  useDeleteVehicle: () => ({ mutate: deleteMutate, ...removeState }),
  useSetVehiclePhoto: () => ({ mutate: photoMutate, ...photoState }),
  useUpdateVehicle: () => ({ mutate: vi.fn(), ...idle }),
  useCreateVehicle: () => ({ mutate: vi.fn(), ...idle }),
  useAddMaintenance: () => ({ mutate: vi.fn(), ...idle }),
  useUpdateMaintenance: () => ({ mutate: vi.fn(), ...idle }),
  useDeleteMaintenance: () => ({ mutate: vi.fn(), ...idle }),
}));

const vehicle: Vehicle = {
  id: "v1",
  name: "Nezko",
  make: "Honda",
  model: "Civic",
  year: 2020,
  mileage: 42000,
  color: "Red",
  owners: ["u1"],
  maintenance: [],
};

const renderCard = (v: Partial<Vehicle> = {}) => render(<VehicleCard uid="u1" vehicle={{ ...vehicle, ...v }} />);

beforeEach(() => {
  deleteMutate.mockClear();
  photoMutate.mockClear();
  removeState = { ...idle };
  photoState = { ...idle };
});

describe("VehicleCard", () => {
  it("shows the name, the year/make/model and the specs that have values", () => {
    renderCard({ vin: "1HGCM82633A004352" });
    expect(screen.getByRole("heading", { name: "Nezko" })).toBeInTheDocument();
    expect(screen.getByText("2020 Honda Civic")).toBeInTheDocument();
    expect(screen.getByText(COLOR_LABEL).nextElementSibling).toHaveTextContent("Red");
    expect(screen.getByText(MILEAGE_LABEL).nextElementSibling).toHaveTextContent("42,000 mi");
    expect(screen.getByText(VIN_LABEL).nextElementSibling).toHaveTextContent("1HGCM82633A004352");
    expect(screen.queryByText(TRIM_LABEL)).not.toBeInTheDocument();
  });

  it("shows the photo when there is one, otherwise an add-photo button", () => {
    const { unmount } = renderCard({ photo: "data:image/jpeg;base64,abc" });
    expect(screen.getByRole("img", { name: "Nezko" })).toBeInTheDocument();
    unmount();
    renderCard();
    expect(screen.getByRole("button", { name: ADD_PHOTO_TEXT })).toBeInTheDocument();
  });

  it("removes the photo through the Remove button", async () => {
    renderCard({ photo: "data:image/jpeg;base64,abc" });
    await userEvent.click(screen.getByRole("button", { name: "Remove" }));
    expect(photoMutate).toHaveBeenCalledWith({ vehicleId: "v1", photo: null });
  });

  it("shows the empty maintenance message", () => {
    renderCard();
    expect(screen.getByText(NO_MAINTENANCE_RECORDS_TEXT)).toBeInTheDocument();
  });

  it("opens the edit form in a dialog", async () => {
    renderCard();
    await userEvent.click(screen.getByRole("button", { name: EDIT_BUTTON_TEXT }));
    expect(within(screen.getByRole("dialog")).getByRole("heading", { name: EDIT_VEHICLE_TEXT })).toBeInTheDocument();
  });

  it("deletes the vehicle only after the user confirms", async () => {
    renderCard();
    await userEvent.click(screen.getByRole("button", { name: DELETE_VEHICLE_BUTTON_TEXT }));
    expect(deleteMutate).not.toHaveBeenCalled();
    await userEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: DELETE_VEHICLE_BUTTON_TEXT }));
    expect(deleteMutate).toHaveBeenCalledWith("v1");
  });

  it("shows delete and photo-save errors as alerts", () => {
    removeState = { isPending: false, error: new Error("nope"), isError: true };
    photoState = { isPending: false, error: new Error("too big"), isError: true };
    renderCard();
    const alerts = screen.getAllByRole("alert").map((a) => a.textContent);
    expect(alerts).toContain(`${COULDNT_SAVE_PHOTO_TEXT}: too big`);
    expect(alerts).toContain(`${COULDNT_DELETE_TEXT}: nope`);
  });
});
