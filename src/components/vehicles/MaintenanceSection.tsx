import { useState } from "react";
import Modal from "../common/Modal";
import MaintenanceForm from "./MaintenanceForm";
import MaintenanceRecordList from "./MaintenanceRecordList";
import {
  ADD_SERVICE_BUTTON_TEXT,
  MAINTENANCE_HISTORY_TITLE,
  NO_MAINTENANCE_RECORDS_TEXT,
  UPCOMING_MAINTENANCE_TITLE,
  VIEW_MAINTENANCE_HISTORY_TEXT,
  maintenanceLastText,
  upcomingMoreText,
  upcomingNextText,
} from "../../Constants";
import type { UpcomingItem } from "../../utils/upcomingMaintenance";
import { formatDate } from "../../utils/formatters";
import { MAINTENANCE_LABELS, type MaintenanceEntry, type Vehicle } from "../../types/vehicle";

export default function MaintenanceSection({
  uid,
  vehicle,
  upcoming = [],
}: {
  uid: string;
  vehicle: Vehicle;
  upcoming?: UpcomingItem[];
}) {
  const [showList, setShowList] = useState(false);
  const [editing, setEditing] = useState<MaintenanceEntry | "new" | null>(null);
  const closeForm = () => setEditing(null);
  const entries = [...vehicle.maintenance].sort((a, b) => b.date.localeCompare(a.date));
  const latest = entries[0];
  const maintenanceHistoryPresent = entries.length > 0;

  return (
    <section className="service-records">
      {upcoming.length > 0 && (
        <button
          className="upcoming-summary"
          aria-label={UPCOMING_MAINTENANCE_TITLE}
          onClick={() => setShowList(true)}
        >
          <span className="upcoming-summary-next">{upcomingNextText(upcoming[0].type)}</span>
          <span className="upcoming-summary-due">{upcoming[0].due}</span>
          {upcoming.length > 1 && (
            <span className="upcoming-summary-more">{upcomingMoreText(upcoming.length - 1)}</span>
          )}
        </button>
      )}
      <div className="service-records-header">
        <h3>{MAINTENANCE_HISTORY_TITLE}</h3>
        <button onClick={() => setEditing("new")}>{ADD_SERVICE_BUTTON_TEXT}</button>
      </div>
      <p className="muted">
        {latest
          ? maintenanceLastText(MAINTENANCE_LABELS[latest.type], formatDate(latest.date))
          : NO_MAINTENANCE_RECORDS_TEXT}
      </p>
      {maintenanceHistoryPresent && (
        <button className="service-records-view" onClick={() => setShowList(true)}>
          {VIEW_MAINTENANCE_HISTORY_TEXT}
        </button>
      )}

      <Modal open={showList} onClose={() => setShowList(false)}>
        <MaintenanceRecordList uid={uid} vehicle={vehicle} entries={entries} upcoming={upcoming} onEdit={setEditing} />
      </Modal>

      {/* A sibling of the list modal, not inside it, so it opens on top of the list.
          Keyed so the form starts fresh each time it opens for a different record. */}
      <Modal open={editing !== null} onClose={closeForm}>
        {editing && (
          <MaintenanceForm
            key={editing === "new" ? "new" : editing.id}
            uid={uid}
            vehicleId={vehicle.id}
            entry={editing === "new" ? undefined : editing}
            onSaved={closeForm}
          />
        )}
      </Modal>
    </section>
  );
}
