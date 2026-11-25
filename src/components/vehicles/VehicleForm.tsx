import { useRef, useState, type ChangeEvent, type SyntheticEvent } from "react";
import { photoFromInput } from "../../utils/image";
import { useCreateVehicle, useUpdateVehicle } from "../../hooks/useVehicles";
import type { Vehicle, VehicleDetailsInput } from "../../types/vehicle";
import {
  ADD_NEW_VEHICLE_TEXT,
  ADD_PHOTO_OPTIONAL_TEXT,
  ADD_VEHICLE_SUBMIT_TEXT,
  APPROX_MILEAGE_REQUIRED_LABEL,
  CHANGE_BUTTON_TEXT,
  COLOR_REQUIRED_LABEL,
  COULDNT_SAVE_TEXT,
  EDIT_VEHICLE_TEXT,
  LICENSE_PLATE_OPTIONAL_LABEL,
  MAKE_REQUIRED_LABEL,
  MILEAGE_INVALID_ERROR,
  MODEL_REQUIRED_LABEL,
  PHOTO_READ_ERROR,
  REMOVE_BUTTON_TEXT,
  REQUIRED_FIELD,
  SAVE_CHANGES_BUTTON_TEXT,
  SAVING_TEXT,
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
  const [form, setForm] = useState(vehicle ? toForm(vehicle) : empty);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const create = useCreateVehicle(uid);
  const update = useUpdateVehicle(uid);
  const isPending = create.isPending || update.isPending;
  const saveError = create.error ?? update.error;

  const set = (key: keyof typeof empty) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [key]: e.target.value });

  const pickPhoto = () => fileRef.current?.click();

  const onPhotoChosen = async (e: ChangeEvent<HTMLInputElement>) => {
    setPhotoError(null);
    try {
      const chosen = await photoFromInput(e);
      if (chosen) setPhoto(chosen);
    } catch {
      setPhotoError(PHOTO_READ_ERROR);
    }
  };

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
    <form onSubmit={submit}>
      <h2>{vehicle ? EDIT_VEHICLE_TEXT : ADD_NEW_VEHICLE_TEXT}</h2>
      {!vehicle && (
        // type="button" so these don't submit the form
        <div className="vehicle-photo form-photo">
          {photo ? (
            <>
              <img src={photo} alt={SELECTED_VEHICLE_PHOTO_ALT} />
              <div className="vehicle-photo-actions">
                <button type="button" onClick={pickPhoto}>{CHANGE_BUTTON_TEXT}</button>
                <button type="button" onClick={() => setPhoto(null)}>{REMOVE_BUTTON_TEXT}</button>
              </div>
            </>
          ) : (
            <button type="button" className="vehicle-photo-empty" onClick={pickPhoto}>
              {ADD_PHOTO_OPTIONAL_TEXT}
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPhotoChosen} />
        </div>
      )}
      {photoError && <p role="alert">{photoError}</p>}
      <div className="form-fields">
        <label>
          {VEHICLE_NAME_REQUIRED_LABEL}
          <input placeholder={VEHICLE_NAME_PLACEHOLDER} aria-required value={form.name} onChange={set("name")} />
        </label>
        <label>
          {MAKE_REQUIRED_LABEL}
          <input aria-required value={form.make} onChange={set("make")} />
        </label>
        <label>
          {MODEL_REQUIRED_LABEL}
          <input aria-required value={form.model} onChange={set("model")} />
        </label>
        <label>
          {YEAR_REQUIRED_LABEL}
          <input aria-required inputMode="numeric" value={form.year} onChange={set("year")} />
        </label>
        <label>
          {APPROX_MILEAGE_REQUIRED_LABEL}
          <input aria-required inputMode="numeric" value={form.mileage} onChange={set("mileage")} />
        </label>
        <label>
          {COLOR_REQUIRED_LABEL}
          <input aria-required value={form.color} onChange={set("color")} />
        </label>
        <label>
          {VIN_OPTIONAL_LABEL}
          <input value={form.vin} onChange={set("vin")} />
        </label>
        <label>
          {LICENSE_PLATE_OPTIONAL_LABEL}
          <input value={form.licensePlate} onChange={set("licensePlate")} />
        </label>
      </div>
      <p className="muted">{REQUIRED_FIELD}</p>
      <button type="submit" disabled={isPending}>
        {isPending ? SAVING_TEXT : vehicle ? SAVE_CHANGES_BUTTON_TEXT : ADD_VEHICLE_SUBMIT_TEXT}
      </button>
      {error && <p role="alert">{error}</p>}
      {saveError && <p role="alert">{COULDNT_SAVE_TEXT}: {saveError.message}</p>}
    </form>
  );
}
