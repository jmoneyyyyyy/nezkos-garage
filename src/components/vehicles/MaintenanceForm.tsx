import { useState, type SyntheticEvent } from "react";
import DialogHeading from "../common/DialogHeading";
import FormActions from "../common/FormActions";
import { FormRow, FormStack } from "../common/FormLayout";
import FormTextField from "../common/FormTextField";
import {
  ADD_SERVICE_RECORD_TEXT,
  COST_INVALID_ERROR,
  COST_OPTIONAL_LABEL,
  DATE_LABEL,
  DATE_REQUIRED_ERROR,
  DETAILS_OPTIONAL_LABEL,
  EDIT_SERVICE_RECORD_TEXT,
  MILEAGE_INVALID_ERROR,
  MILEAGE_OPTIONAL_LABEL,
  SAVE_CHANGES_BUTTON_TEXT,
  SERVICE_DETAILS_PLACEHOLDER,
  SERVICE_LABEL,
} from "../../Constants";
import { useFormState } from "../../hooks/useFormState";
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
  const [form, set] = useFormState({
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
    <FormStack onSubmit={submit}>
      <DialogHeading>{entry ? EDIT_SERVICE_RECORD_TEXT : ADD_SERVICE_RECORD_TEXT}</DialogHeading>
      <FormTextField select label={SERVICE_LABEL} value={form.type} onChange={set("type")}>
        {MAINTENANCE_TYPES.map((t) => (
          <option key={t} value={t}>{MAINTENANCE_LABELS[t]}</option>
        ))}
      </FormTextField>
      <FormTextField type="date" label={DATE_LABEL} value={form.date} onChange={set("date")} />
      <FormRow>
        <FormTextField label={MILEAGE_OPTIONAL_LABEL} inputMode="numeric" value={form.mileage} onChange={set("mileage")} />
        <FormTextField label={COST_OPTIONAL_LABEL} inputMode="decimal" value={form.cost} onChange={set("cost")} />
      </FormRow>
      <FormTextField
        multiline
        minRows={3}
        label={DETAILS_OPTIONAL_LABEL}
        placeholder={SERVICE_DETAILS_PLACEHOLDER}
        value={form.details}
        onChange={set("details")}
      />
      <FormActions
        isPending={isPending}
        label={entry ? SAVE_CHANGES_BUTTON_TEXT : ADD_SERVICE_RECORD_TEXT}
        error={error}
        saveError={saveError}
      />
    </FormStack>
  );
}
