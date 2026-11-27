import { useState } from "react";
import Button from "@mui/material/Button";
import AppDialog from "../common/AppDialog";
import VehicleForm from "./VehicleForm";
import { ADD_VEHICLE_BUTTON_TEXT } from "../../Constants";

export default function AddVehicleModal({ uid }: { uid: string }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <Button variant="contained" onClick={() => setOpen(true)} sx={{ fontSize: 16, px: "22px", py: "12px" }}>
        {ADD_VEHICLE_BUTTON_TEXT}
      </Button>
      {/* keepMounted: the form stays mounted while closed, so a half-filled form survives closing the dialog */}
      <AppDialog open={open} onClose={close} keepMounted>
        <VehicleForm uid={uid} onSaved={close} />
      </AppDialog>
    </>
  );
}
