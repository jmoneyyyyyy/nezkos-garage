import { useState } from "react";
import Modal from "../components/Modal";
import VehicleForm from "./VehicleForm";

export default function AddVehicleModal({ uid }: { uid: string }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>Add vehicle</button>
      <Modal open={open} onClose={close}>
        <VehicleForm uid={uid} onSaved={close} />
      </Modal>
    </>
  );
}
