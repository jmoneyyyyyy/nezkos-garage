import MaintenanceRecordRow from "./MaintenanceRecordRow";
import { NO_MAINTENANCE_RECORDS_TEXT, maintenanceRecordsTitle } from "../../Constants";
import type { MaintenanceEntry, Vehicle } from "../../types/vehicle";

type MaintenanceRecordListProps = {
  uid: string;
  vehicle: Vehicle;
  entries: MaintenanceEntry[];
  onEdit: (entry: MaintenanceEntry) => void;
};

/** The body of the "maintenance records" modal: a title and one row per service record. */
export default function MaintenanceRecordList({ uid, vehicle, entries, onEdit }: MaintenanceRecordListProps) {
  const noMaintenanceRecord = entries.length === 0;
  
  return (
    <div className="service-records-modal">
      <h2>{maintenanceRecordsTitle(vehicle.name)}</h2>
      {noMaintenanceRecord ? (
        <p className="muted">{NO_MAINTENANCE_RECORDS_TEXT}</p>
      ) : (
        <ul>
          {entries.map((entry) => (
            <MaintenanceRecordRow key={entry.id} uid={uid} vehicleId={vehicle.id} entry={entry} onEdit={onEdit} />
          ))}
        </ul>
      )}
    </div>
  );
}
