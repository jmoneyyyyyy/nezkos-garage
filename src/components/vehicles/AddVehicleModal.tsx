import { useState } from "react";
import Modal from "../common/Modal";
import VehicleForm from "./VehicleForm";
import { ADD_VEHICLE_BUTTON_TEXT } from "../../Constants";

export default function AddVehicleModal({ uid }: { uid: string }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>{ADD_VEHICLE_BUTTON_TEXT}</button>
      <Modal open={open} onClose={close}>
        <VehicleForm uid={uid} onSaved={close} />
      </Modal>
    </>
  );
}
