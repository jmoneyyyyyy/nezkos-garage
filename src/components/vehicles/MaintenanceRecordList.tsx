import MaintenanceRecordRow from "./MaintenanceRecordRow";
import { NO_MAINTENANCE_RECORDS_TEXT, UPCOMING_MAINTENANCE_TITLE, maintenanceRecordsTitle } from "../../Constants";
import type { UpcomingItem } from "../../utils/upcomingMaintenance";
import type { MaintenanceEntry, Vehicle } from "../../types/vehicle";

type MaintenanceRecordListProps = {
  uid: string;
  vehicle: Vehicle;
  entries: MaintenanceEntry[];
  upcoming?: UpcomingItem[];
  onEdit: (entry: MaintenanceEntry) => void;
};

/** The body of the "maintenance records" modal: a title and one row per service record. */
export default function MaintenanceRecordList({ uid, vehicle, entries, upcoming = [], onEdit }: MaintenanceRecordListProps) {
  const noMaintenanceRecord = entries.length === 0;
  
  return (
    <div className="service-records-modal">
      <h2>{maintenanceRecordsTitle(vehicle.name)}</h2>
      {upcoming.length > 0 && (
        <aside className="upcoming-maintenance" aria-label={UPCOMING_MAINTENANCE_TITLE}>
          <h3>{UPCOMING_MAINTENANCE_TITLE}</h3>
          <ul>
            {upcoming.map((i) => (
              <li key={i.type}>
                <strong>{i.type}</strong> <span>{i.due}</span>
              </li>
            ))}
          </ul>
        </aside>
      )}
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
