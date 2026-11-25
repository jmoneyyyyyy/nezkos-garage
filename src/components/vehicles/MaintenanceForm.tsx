import { useState, type ChangeEvent, type SyntheticEvent } from "react";
import { useAddMaintenance, useUpdateMaintenance } from "../../hooks/useVehicles";
import {
  MAINTENANCE_LABELS, MAINTENANCE_TYPES,
  type MaintenanceEntry, type MaintenanceType, type NewMaintenanceInput,
} from "../../types/vehicle";

const today = () => new Date().toLocaleDateString("en-CA");

type MaintenanceFormProps = {
  uid: string;
  vehicleId: string;
  entry?: MaintenanceEntry;
  onSaved: () => void;
};

export default function MaintenanceForm({ uid, vehicleId, entry, onSaved }: MaintenanceFormProps) {
  const [form, setForm] = useState({
    type: entry?.type ?? ("oil_change" as MaintenanceType),
    date: entry?.date ?? today(),
    mileage: entry?.mileage?.toString() ?? "",
    cost: entry?.cost?.toString() ?? "",
    details: entry?.details ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const add = useAddMaintenance(uid);
  const update = useUpdateMaintenance(uid);
  const isPending = add.isPending || update.isPending;
  const saveError = add.error ?? update.error;

  const set =
    (key: keyof typeof form) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm({ ...form, [key]: e.target.value });

  //SyntheticEvent is used here to prevent the default form submission behavior
  //It wraps around the browser's native event and provides a consistent interface across different browsers
  const submit = (e: SyntheticEvent) => {
    e.preventDefault();
    const mileage = form.mileage === "" ? undefined : Number(form.mileage);
    const cost = form.cost === "" ? undefined : Number(form.cost);

    if (!form.date) {
      return setError("Date is required.");
    }
    if (mileage !== undefined && (!Number.isFinite(mileage) || mileage < 0)) {
      return setError("Mileage must be 0 or more.");
    }
    if (cost !== undefined && (!Number.isFinite(cost) || cost < 0)) {
      return setError("Cost must be 0 or more.");
    }

    setError(null);
    const input: NewMaintenanceInput = {
      type: form.type,
      date: form.date,
      mileage,
      cost,
      details: form.details.trim() || undefined,
    };
    if (entry) {
      update.mutate({ vehicleId, entry: { ...input, id: entry.id } }, { onSuccess: onSaved });
    } else {
      add.mutate({ vehicleId, input }, { onSuccess: onSaved });
    }
  };

  return (
    <form onSubmit={submit}>
      <h2>{entry ? "Edit service record" : "Add service record"}</h2>
      <label>
        Service
        <select value={form.type} onChange={set("type")}>
          {MAINTENANCE_TYPES.map((t) => (
            <option key={t} value={t}>{MAINTENANCE_LABELS[t]}</option>
          ))}
        </select>
      </label>
      <label>
        Date
        <input type="date" value={form.date} onChange={set("date")} />
      </label>
      <div className="form-row">
        <label>
          Mileage (optional)
          <input inputMode="numeric" value={form.mileage} onChange={set("mileage")} />
        </label>
        <label>
          Cost (optional)
          <input inputMode="decimal" value={form.cost} onChange={set("cost")} />
        </label>
      </div>
      <label>
        Details (optional)
        <textarea
          rows={3}
          placeholder="e.g. 0W-20 full synthetic, OEM filter"
          value={form.details}
          onChange={set("details")}
        />
      </label>
      <button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : entry ? "Save changes" : "Add service record"}
      </button>
      {error && <p role="alert">{error}</p>}
      {saveError && <p role="alert">Couldn't save: {saveError.message}</p>}
    </form>
  );
}
