import { useState } from "react";
import Modal from "../common/Modal";
import MaintenanceForm from "./MaintenanceForm";
import { useDeleteMaintenance } from "../../hooks/useVehicles";
import { MAINTENANCE_LABELS, type MaintenanceEntry, type Vehicle } from "../../types/vehicle";

function formatDate(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString();
}

function formatCost(cost: number) {
  return cost.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

export default function MaintenanceSection({ uid, vehicle }: { uid: string; vehicle: Vehicle }) {
  const [showList, setShowList] = useState(false);
  const [editing, setEditing] = useState<MaintenanceEntry | "new" | null>(null);
  const remove = useDeleteMaintenance(uid);
  const closeForm = () => setEditing(null);
  const entries = [...vehicle.maintenance].sort((a, b) => b.date.localeCompare(a.date));
  const latest = entries[0];

  const deleteEntry = (entry: MaintenanceEntry) => {
    const label = MAINTENANCE_LABELS[entry.type].toLowerCase();
    if (confirm(`Delete the ${label} record from ${formatDate(entry.date)}?`)) {
      remove.mutate({ vehicleId: vehicle.id, entryId: entry.id });
    }
  };

  return (
    <section className="service-records">
      <div className="service-records-header">
        <h3>Maintenance history</h3>
        <button onClick={() => setEditing("new")}>Add service</button>
      </div>
      <p className="muted">
        {latest
          ? `Last: ${MAINTENANCE_LABELS[latest.type]} on ${formatDate(latest.date)}`
          : "No maintenance records yet."}
      </p>
      {entries.length > 0 && (
        <button className="service-records-view" onClick={() => setShowList(true)}>
          View maintenance history
        </button>
      )}

      <Modal open={showList} onClose={() => setShowList(false)}>
        <div className="service-records-modal">
          <h2>{vehicle.name}: maintenance records</h2>
          {entries.length === 0 ? (
            <p className="muted">No maintenance records yet.</p>
          ) : (
            <ul>
              {entries.map((entry) => {
                const meta = [
                  entry.mileage !== undefined && `${entry.mileage.toLocaleString()} mi`,
                  entry.cost !== undefined && formatCost(entry.cost),
                ].filter(Boolean).join(" · ");

                return (
                  <li key={entry.id}>
                    <div className="service-record-title">
                      <strong>{MAINTENANCE_LABELS[entry.type]}</strong>
                      <span>{formatDate(entry.date)}</span>
                    </div>
                    {meta && <div className="muted">{meta}</div>}
                    {entry.details && <p>{entry.details}</p>}
                    <div className="service-record-actions">
                      <button onClick={() => setEditing(entry)}>Edit</button>
                      <button className="danger" onClick={() => deleteEntry(entry)} disabled={remove.isPending}>
                        Delete
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          {remove.isError && <p role="alert">Couldn't delete: {remove.error.message}</p>}
        </div>
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
