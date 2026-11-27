import { useState, type SyntheticEvent } from "react";
import DialogHeading from "../common/DialogHeading";
import FormActions from "../common/FormActions";
import { FormFieldGrid, FormStack } from "../common/FormLayout";
import FormTextField from "../common/FormTextField";
import PhotoPicker from "../common/PhotoPicker";
import { useFormState } from "../../hooks/useFormState";
import { useCreateVehicle, useUpdateVehicle } from "../../hooks/useVehicles";
import type { Vehicle, VehicleDetailsInput } from "../../types/vehicle";
import {
  ADD_NEW_VEHICLE_TEXT,
  ADD_PHOTO_OPTIONAL_TEXT,
  ADD_VEHICLE_SUBMIT_TEXT,
  APPROX_MILEAGE_REQUIRED_LABEL,
  COLOR_REQUIRED_LABEL,
  EDIT_VEHICLE_TEXT,
  LICENSE_PLATE_OPTIONAL_LABEL,
  MAKE_REQUIRED_LABEL,
  MILEAGE_INVALID_ERROR,
  MODEL_REQUIRED_LABEL,
  REQUIRED_FIELD,
  SAVE_CHANGES_BUTTON_TEXT,
  SELECTED_VEHICLE_PHOTO_ALT,
  VEHICLE_NAME_PLACEHOLDER,
  VEHICLE_NAME_REQUIRED_LABEL,
  VEHICLE_REQUIRED_FIELDS_ERROR,
  VIN_OPTIONAL_LABEL,
  YEAR_REQUIRED_LABEL,
  vehicleYearError,
} from "../../Constants";

const empty = {
  name: "", make: "", model: "", year: "", mileage: "",
  color: "", trim: "", vin: "", licensePlate: "",
};

function toForm(vehicle: Vehicle): typeof empty {
  return {
    name: vehicle.name,
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year.toString(),
    mileage: vehicle.mileage.toString(),
    color: vehicle.color,
    trim: vehicle.trim ?? "",
    vin: vehicle.vin ?? "",
    licensePlate: vehicle.licensePlate ?? "",
  };
}

type Props = {
  uid: string;
  vehicle?: Vehicle;
  onSaved?: () => void;
};

export default function VehicleForm({ uid, vehicle, onSaved }: Props) {
  const [form, set, setForm] = useFormState(vehicle ? toForm(vehicle) : empty);
  const [error, setError] = useState<string | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const create = useCreateVehicle(uid);
  const update = useUpdateVehicle(uid);
  const isPending = create.isPending || update.isPending;
  const saveError = create.error ?? update.error;

  //SyntheticEvent is used here to prevent the default form submission behavior
  //It wraps around the browser's native event and provides a consistent interface across different browsers
  const submit = (e: SyntheticEvent) => {
    e.preventDefault();
    const year = Number(form.year);
    const mileage = Number(form.mileage);
    const maxYear = new Date().getFullYear() + 1;

    if (!form.name.trim() || !form.make.trim() || !form.model.trim() || !form.color.trim()) {
      return setError(VEHICLE_REQUIRED_FIELDS_ERROR);
    }
    if (!Number.isInteger(year) || year < 1900 || year > maxYear) {
      return setError(vehicleYearError(maxYear));
    }
    if (form.mileage === "" || !Number.isFinite(mileage) || mileage < 0) {
      return setError(MILEAGE_INVALID_ERROR);
    }

    setError(null);
    const input: VehicleDetailsInput = {
      name: form.name.trim(),
      make: form.make.trim(),
      model: form.model.trim(),
      year,
      mileage,
      color: form.color.trim(),
      trim: form.trim.trim() || undefined,
      vin: form.vin.trim().toUpperCase() || undefined,
      licensePlate: form.licensePlate.trim().toUpperCase() || undefined,
    };

    if (vehicle) {
      update.mutate({ vehicleId: vehicle.id, input }, { onSuccess: () => onSaved?.() });
    } else {
      create.mutate({ ...input, photo: photo ?? undefined }, {
        onSuccess: () => {
          setForm(empty);
          setPhoto(null);
          onSaved?.();
        },
      });
    }
  };

  return (
    <FormStack onSubmit={submit}>
      <DialogHeading>{vehicle ? EDIT_VEHICLE_TEXT : ADD_NEW_VEHICLE_TEXT}</DialogHeading>
      {!vehicle && (
        <PhotoPicker
          variant="form"
          photo={photo}
          alt={SELECTED_VEHICLE_PHOTO_ALT}
          emptyLabel={ADD_PHOTO_OPTIONAL_TEXT}
          onChange={setPhoto}
        />
      )}
      <FormFieldGrid>
        <FormTextField
          label={VEHICLE_NAME_REQUIRED_LABEL}
          placeholder={VEHICLE_NAME_PLACEHOLDER}
          required
          value={form.name}
          onChange={set("name")}
        />
        <FormTextField label={MAKE_REQUIRED_LABEL} required value={form.make} onChange={set("make")} />
        <FormTextField label={MODEL_REQUIRED_LABEL} required value={form.model} onChange={set("model")} />
        <FormTextField label={YEAR_REQUIRED_LABEL} required inputMode="numeric" value={form.year} onChange={set("year")} />
        <FormTextField
          label={APPROX_MILEAGE_REQUIRED_LABEL}
          required
          inputMode="numeric"
          value={form.mileage}
          onChange={set("mileage")}
        />
        <FormTextField label={COLOR_REQUIRED_LABEL} required value={form.color} onChange={set("color")} />
        <FormTextField label={VIN_OPTIONAL_LABEL} value={form.vin} onChange={set("vin")} />
        <FormTextField label={LICENSE_PLATE_OPTIONAL_LABEL} value={form.licensePlate} onChange={set("licensePlate")} />
      </FormFieldGrid>
      <FormActions
        isPending={isPending}
        label={vehicle ? SAVE_CHANGES_BUTTON_TEXT : ADD_VEHICLE_SUBMIT_TEXT}
        note={REQUIRED_FIELD}
        error={error}
        saveError={saveError}
      />
    </FormStack>
  );
}
