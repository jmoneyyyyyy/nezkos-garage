import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CANCEL_BUTTON_TEXT, COULDNT_DELETE_TEXT, DELETE_BUTTON_TEXT, EDIT_BUTTON_TEXT } from "../../Constants";
import { formatCost, formatDate, formatMileage } from "../../utils/formatters";
import type { MaintenanceEntry } from "../../types/vehicle";
import MaintenanceRecordRow from "./MaintenanceRecordRow";

const mutate = vi.fn();
let removeState: { isPending: boolean; error: Error | null } = { isPending: false, error: null };
vi.mock("../../hooks/useVehicles", () => ({
  useDeleteMaintenance: () => ({ mutate, ...removeState }),
}));

const entry: MaintenanceEntry = {
  id: "m1",
  type: "oil_change",
  date: "2026-03-05",
  mileage: 45000,
  cost: 89.5,
  details: "Synthetic 5W-30",
};

const renderRow = (e: Partial<MaintenanceEntry> = {}, onEdit = vi.fn()) => {
  render(
    <ul>
      <MaintenanceRecordRow uid="u1" vehicleId="v1" entry={{ ...entry, ...e }} onEdit={onEdit} />
    </ul>
  );
  return { onEdit };
};

beforeEach(() => {
  mutate.mockClear();
  removeState = { isPending: false, error: null };
});

describe("MaintenanceRecordRow", () => {
  it("shows the service, date, mileage, cost and details", () => {
    renderRow();
    expect(screen.getByText("Oil change")).toBeInTheDocument();
    expect(screen.getByText(formatDate(entry.date))).toBeInTheDocument();
    expect(screen.getByText(`${formatMileage(45000)} · ${formatCost(89.5)}`)).toBeInTheDocument();
    expect(screen.getByText("Synthetic 5W-30")).toBeInTheDocument();
  });

  it("leaves out the meta line and details when there are none", () => {
    renderRow({ mileage: undefined, cost: undefined, details: undefined });
    expect(screen.queryByText(/ mi/)).not.toBeInTheDocument();
    expect(screen.queryByText("Synthetic 5W-30")).not.toBeInTheDocument();
  });

  it("hands the entry to onEdit", async () => {
    const { onEdit } = renderRow();
    await userEvent.click(screen.getByRole("button", { name: EDIT_BUTTON_TEXT }));
    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: "m1" }));
  });

  it("deletes only after the user confirms", async () => {
    renderRow();
    await userEvent.click(screen.getByRole("button", { name: DELETE_BUTTON_TEXT }));
    expect(mutate).not.toHaveBeenCalled();
    const dialog = screen.getByRole("dialog");
    await userEvent.click(within(dialog).getByRole("button", { name: DELETE_BUTTON_TEXT }));
    expect(mutate).toHaveBeenCalledWith({ vehicleId: "v1", entryId: "m1" });
  });

  it("does not delete when the user cancels", async () => {
    renderRow();
    await userEvent.click(screen.getByRole("button", { name: DELETE_BUTTON_TEXT }));
    await userEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: CANCEL_BUTTON_TEXT }));
    expect(mutate).not.toHaveBeenCalled();
  });

  it("shows a delete error and disables Delete while deleting", () => {
    removeState = { isPending: true, error: new Error("offline") };
    renderRow();
    expect(screen.getByRole("alert")).toHaveTextContent(`${COULDNT_DELETE_TEXT}: offline`);
    expect(screen.getByRole("button", { name: DELETE_BUTTON_TEXT })).toBeDisabled();
  });
});
