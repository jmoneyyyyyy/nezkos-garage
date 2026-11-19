import { useRef, useState, type ChangeEvent } from "react";
import Modal from "../common/Modal";
import { PHOTO_READ_ERROR, photoFromInput } from "../../lib/image";
import MaintenanceSection from "./MaintenanceSection";
import VehicleForm from "./VehicleForm";
import { useDeleteVehicle, useSetVehiclePhoto } from "../../hooks/useVehicles";
import type { Vehicle } from "../../types/vehicle";

export default function VehicleCard({ uid, vehicle }: { uid: string; vehicle: Vehicle }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const closeEdit = () => setEditing(false);
  const setPhoto = useSetVehiclePhoto(uid);
  const remove = useDeleteVehicle(uid);

  const pickPhoto = () => fileRef.current?.click();

  const onPhotoChosen = async (e: ChangeEvent<HTMLInputElement>) => {
    setPhotoError(null);
    try {
      const photo = await photoFromInput(e);
      if (photo) setPhoto.mutate({ vehicleId: vehicle.id, photo });
    } catch {
      setPhotoError(PHOTO_READ_ERROR);
    }
  };

  const deleteVehicle = () => {
    if (confirm(`Delete ${vehicle.name} and all of its service records? This can't be undone.`)) {
      remove.mutate(vehicle.id);
    }
  };

  const details: [string, string | undefined][] = [
    ["Color", vehicle.color],
    ["Mileage", `${vehicle.mileage.toLocaleString()} mi`],
    ["Trim", vehicle.trim],
    ["VIN", vehicle.vin],
    ["Plate", vehicle.licensePlate],
  ];

  return (
    <article className="vehicle-card">
      <div className="vehicle-photo">
        {vehicle.photo ? (
          <>
            <img src={vehicle.photo} alt={vehicle.name} />
            <div className="vehicle-photo-actions">
              <button onClick={pickPhoto} disabled={setPhoto.isPending}>Change</button>
              <button
                onClick={() => setPhoto.mutate({ vehicleId: vehicle.id, photo: null })}
                disabled={setPhoto.isPending}
              >
                Remove
              </button>
            </div>
          </>
        ) : (
          <button className="vehicle-photo-empty" onClick={pickPhoto} disabled={setPhoto.isPending}>
            {setPhoto.isPending ? "Saving..." : "+ Add photo"}
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPhotoChosen} />
      </div>

      <div className="vehicle-card-body">
        {photoError && <p role="alert">{photoError}</p>}
        {setPhoto.isError && <p role="alert">Couldn't save photo: {setPhoto.error.message}</p>}

        <div className="vehicle-card-title">
          <div>
            <h2>{vehicle.name}</h2>
            <p className="muted">{vehicle.year} {vehicle.make} {vehicle.model}</p>
          </div>
          <button onClick={() => setEditing(true)}>Edit</button>
        </div>

        <Modal open={editing} onClose={closeEdit}>
          {/* Only mounted while open, so it starts from the saved values every time */}
          {editing && <VehicleForm uid={uid} vehicle={vehicle} onSaved={closeEdit} />}
        </Modal>

        <dl className="vehicle-details">
          {details
            .filter(([, value]) => value)
            .map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
        </dl>

        <MaintenanceSection uid={uid} vehicle={vehicle} />

        <button className="danger vehicle-delete" onClick={deleteVehicle} disabled={remove.isPending}>
          {remove.isPending ? "Deleting..." : "Delete vehicle"}
        </button>
        {remove.isError && <p role="alert">Couldn't delete: {remove.error.message}</p>}
      </div>
    </article>
  );
}
