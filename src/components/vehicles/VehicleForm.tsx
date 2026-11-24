import { useRef, useState, type ChangeEvent, type SyntheticEvent } from "react";
import { PHOTO_READ_ERROR, photoFromInput } from "../../lib/image";
import { useCreateVehicle, useUpdateVehicle } from "../../hooks/useVehicles";
import type { Vehicle, VehicleDetailsInput } from "../../types/vehicle";
import { REQUIRED_FIELD } from "../../Constants";

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

  const submit = (e: SyntheticEvent) => {
    e.preventDefault();
    const year = Number(form.year);
    const mileage = Number(form.mileage);
    const maxYear = new Date().getFullYear() + 1;

    if (!form.name.trim() || !form.make.trim() || !form.model.trim() || !form.color.trim()) {
      return setError("Name, make, model, and color are required.");
    }
    if (!Number.isInteger(year) || year < 1900 || year > maxYear) {
      return setError(`Year must be between 1900 and ${maxYear}.`);
    }
    if (form.mileage === "" || !Number.isFinite(mileage) || mileage < 0) {
      return setError("Mileage must be 0 or more.");
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
      <h2>{vehicle ? "Edit vehicle" : "Add new vehicle"}</h2>
      {!vehicle && (
        // type="button" so these don't submit the form
        <div className="vehicle-photo form-photo">
          {photo ? (
            <>
              <img src={photo} alt="Selected vehicle photo" />
              <div className="vehicle-photo-actions">
                <button type="button" onClick={pickPhoto}>Change</button>
                <button type="button" onClick={() => setPhoto(null)}>Remove</button>
              </div>
            </>
          ) : (
            <button type="button" className="vehicle-photo-empty" onClick={pickPhoto}>
              + Add photo (optional)
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPhotoChosen} />
        </div>
      )}
      {photoError && <p role="alert">{photoError}</p>}
      <div className="form-fields">
        <label>
          Name *
          <input placeholder="e.g. Justin's Civic" aria-required value={form.name} onChange={set("name")} />
        </label>
        <label>
          Make *
          <input aria-required value={form.make} onChange={set("make")} />
        </label>
        <label>
          Model *
          <input aria-required value={form.model} onChange={set("model")} />
        </label>
        <label>
          Year *
          <input aria-required inputMode="numeric" value={form.year} onChange={set("year")} />
        </label>
        <label>
          Approx. mileage *
          <input aria-required inputMode="numeric" value={form.mileage} onChange={set("mileage")} />
        </label>
        <label>
          Color *
          <input aria-required value={form.color} onChange={set("color")} />
        </label>
        <label>
          VIN (optional)
          <input value={form.vin} onChange={set("vin")} />
        </label>
        <label>
          License plate (optional)
          <input value={form.licensePlate} onChange={set("licensePlate")} />
        </label>
      </div>
      <p className="muted">{REQUIRED_FIELD}</p>
      <button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : vehicle ? "Save changes" : "Add vehicle"}
      </button>
      {error && <p role="alert">{error}</p>}
      {saveError && <p role="alert">Couldn't save: {saveError.message}</p>}
    </form>
  );
}
