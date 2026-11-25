import { useState, type ChangeEvent, type SyntheticEvent } from "react";
import {
  ADD_SERVICE_RECORD_TEXT,
  COST_INVALID_ERROR,
  COST_OPTIONAL_LABEL,
  COULDNT_SAVE_TEXT,
  DATE_LABEL,
  DATE_REQUIRED_ERROR,
  DETAILS_OPTIONAL_LABEL,
  EDIT_SERVICE_RECORD_TEXT,
  MILEAGE_INVALID_ERROR,
  MILEAGE_OPTIONAL_LABEL,
  SAVE_CHANGES_BUTTON_TEXT,
  SAVING_TEXT,
  SERVICE_DETAILS_PLACEHOLDER,
  SERVICE_LABEL,
} from "../../Constants";
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
      return setError(DATE_REQUIRED_ERROR);
    }
    if (mileage !== undefined && (!Number.isFinite(mileage) || mileage < 0)) {
      return setError(MILEAGE_INVALID_ERROR);
    }
    if (cost !== undefined && (!Number.isFinite(cost) || cost < 0)) {
      return setError(COST_INVALID_ERROR);
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
      <h2>{entry ? EDIT_SERVICE_RECORD_TEXT : ADD_SERVICE_RECORD_TEXT}</h2>
      <label>
        {SERVICE_LABEL}
        <select value={form.type} onChange={set("type")}>
          {MAINTENANCE_TYPES.map((t) => (
            <option key={t} value={t}>{MAINTENANCE_LABELS[t]}</option>
          ))}
        </select>
      </label>
      <label>
        {DATE_LABEL}
        <input type="date" value={form.date} onChange={set("date")} />
      </label>
      <div className="form-row">
        <label>
          {MILEAGE_OPTIONAL_LABEL}
          <input inputMode="numeric" value={form.mileage} onChange={set("mileage")} />
        </label>
        <label>
          {COST_OPTIONAL_LABEL}
          <input inputMode="decimal" value={form.cost} onChange={set("cost")} />
        </label>
      </div>
      <label>
        {DETAILS_OPTIONAL_LABEL}
        <textarea
          rows={3}
          placeholder={SERVICE_DETAILS_PLACEHOLDER}
          value={form.details}
          onChange={set("details")}
        />
      </label>
      <button type="submit" disabled={isPending}>
        {isPending ? SAVING_TEXT : entry ? SAVE_CHANGES_BUTTON_TEXT : ADD_SERVICE_RECORD_TEXT}
      </button>
      {error && <p role="alert">{error}</p>}
      {saveError && <p role="alert">{COULDNT_SAVE_TEXT}: {saveError.message}</p>}
    </form>
  );
}
