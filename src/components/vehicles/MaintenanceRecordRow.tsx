import {
  COULDNT_DELETE_TEXT,
  DELETE_BUTTON_TEXT,
  EDIT_BUTTON_TEXT,
  confirmDeleteMaintenanceText,
} from "../../Constants";
import { useDeleteMaintenance } from "../../hooks/useVehicles";
import { formatCost, formatDate, formatMileage } from "../../lib/format";
import { MAINTENANCE_LABELS, type MaintenanceEntry } from "../../types/vehicle";

type MaintenanceRecordRowProps = {
  uid: string;
  vehicleId: string;
  entry: MaintenanceEntry;
  onEdit: (entry: MaintenanceEntry) => void;
};

/** One service record: what was done and when, with its own Edit and Delete buttons. */
export default function MaintenanceRecordRow({ uid, vehicleId, entry, onEdit }: MaintenanceRecordRowProps) {
  const remove = useDeleteMaintenance(uid);

  const meta = [
    entry.mileage !== undefined && formatMileage(entry.mileage),
    entry.cost !== undefined && formatCost(entry.cost),
  ].filter(Boolean).join(" · ");

  const deleteEntry = () => {
    const label = MAINTENANCE_LABELS[entry.type].toLowerCase();
    if (confirm(confirmDeleteMaintenanceText(label, formatDate(entry.date)))) {
      remove.mutate({ vehicleId, entryId: entry.id });
    }
  };

  return (
    <li>
      <div className="service-record-title">
        <strong>{MAINTENANCE_LABELS[entry.type]}</strong>
        <span>{formatDate(entry.date)}</span>
      </div>
      {meta && <div className="muted">{meta}</div>}
      {entry.details && <p>{entry.details}</p>}
      <div className="service-record-actions">
        <button onClick={() => onEdit(entry)}>{EDIT_BUTTON_TEXT}</button>
        <button className="danger" onClick={deleteEntry} disabled={remove.isPending}>
          {DELETE_BUTTON_TEXT}
        </button>
      </div>
      {remove.isError && <p role="alert">{COULDNT_DELETE_TEXT}: {remove.error.message}</p>}
    </li>
  );
}
