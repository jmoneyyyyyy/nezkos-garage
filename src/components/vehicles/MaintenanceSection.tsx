import { useState } from "react";
import Modal from "../common/Modal";
import MaintenanceForm from "./MaintenanceForm";
import MaintenanceRecordList from "./MaintenanceRecordList";
import {
  ADD_SERVICE_BUTTON_TEXT,
  MAINTENANCE_HISTORY_TITLE,
  NO_MAINTENANCE_RECORDS_TEXT,
  VIEW_MAINTENANCE_HISTORY_TEXT,
  maintenanceLastText,
} from "../../Constants";
import { formatDate } from "../../utils/formatters";
import { MAINTENANCE_LABELS, type MaintenanceEntry, type Vehicle } from "../../types/vehicle";

export default function MaintenanceSection({ uid, vehicle }: { uid: string; vehicle: Vehicle }) {
  const [showList, setShowList] = useState(false);
  const [editing, setEditing] = useState<MaintenanceEntry | "new" | null>(null);
  const closeForm = () => setEditing(null);
  const entries = [...vehicle.maintenance].sort((a, b) => b.date.localeCompare(a.date));
  const latest = entries[0];
  const maintenanceHistoryPresent = entries.length > 0;

  return (
    <section className="service-records">
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
        <MaintenanceRecordList uid={uid} vehicle={vehicle} entries={entries} onEdit={setEditing} />
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
