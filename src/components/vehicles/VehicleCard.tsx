import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import AppDialog from "../common/AppDialog";
import DeleteWithConfirm from "../common/DeleteWithConfirm";
import ErrorAlert from "../common/ErrorAlert";
import PhotoPicker from "../common/PhotoPicker";
import ReadoutList from "../common/ReadoutList";
import {
  ADD_PHOTO_TEXT,
  COLOR_LABEL,
  COULDNT_DELETE_TEXT,
  COULDNT_SAVE_PHOTO_TEXT,
  DELETE_VEHICLE_BUTTON_TEXT,
  EDIT_BUTTON_TEXT,
  MILEAGE_LABEL,
  PLATE_LABEL,
  SAVING_TEXT,
  TRIM_LABEL,
  VIN_LABEL,
  confirmDeleteVehicleText,
} from "../../Constants";
import { formatMileage } from "../../utils/formatters";
import MaintenanceSection from "./MaintenanceSection";
import VehicleForm from "./VehicleForm";
import { useDeleteVehicle, useSetVehiclePhoto } from "../../hooks/useVehicles";
import type { Vehicle } from "../../types/vehicle";

export default function VehicleCard({ uid, vehicle }: { uid: string; vehicle: Vehicle }) {
  const [editing, setEditing] = useState(false);
  const closeEdit = () => setEditing(false);
  const setPhoto = useSetVehiclePhoto(uid);
  const remove = useDeleteVehicle(uid);

  const details = (
    [
      [COLOR_LABEL, vehicle.color],
      [MILEAGE_LABEL, formatMileage(vehicle.mileage)],
      [TRIM_LABEL, vehicle.trim],
      [VIN_LABEL, vehicle.vin],
      [PLATE_LABEL, vehicle.licensePlate],
    ] as [string, string | undefined][]
  ).filter((entry): entry is [string, string] => Boolean(entry[1]));

  return (
    <Card
      component="article"
      sx={{
        width: 360,
        maxWidth: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "border-color 0.2s, box-shadow 0.2s, transform 0.2s",
        "&:hover": {
          borderColor: "#3a463f",
          transform: "translateY(-2px)",
          boxShadow:
            "var(--shadow), 0 0 0 1px rgba(52, 199, 112, 0.15), 0 12px 40px -16px rgba(52, 199, 112, 0.22)",
        },
        "@media (prefers-reduced-motion: reduce)": { "&:hover": { transform: "none" } },
      }}
    >
      <PhotoPicker
        photo={vehicle.photo}
        alt={vehicle.name}
        emptyLabel={setPhoto.isPending ? SAVING_TEXT : ADD_PHOTO_TEXT}
        disabled={setPhoto.isPending}
        onChange={(photo) => setPhoto.mutate({ vehicleId: vehicle.id, photo })}
        errorSx={{ mx: "20px", mt: "18px" }}
      />

      <Box sx={{ display: "flex", flexDirection: "column", gap: "18px", p: "18px 20px 20px" }}>
        <ErrorAlert prefix={COULDNT_SAVE_PHOTO_TEXT} error={setPhoto.error} />

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1.5 }}>
          <div>
            <Typography component="h2" variant="h2" sx={{ m: 0, fontSize: 26, lineHeight: 1.05 }}>
              {vehicle.name}
            </Typography>
            <Typography sx={{ mt: "4px", fontSize: 15, color: "text.secondary" }}>
              {vehicle.year} {vehicle.make} {vehicle.model}
            </Typography>
          </div>
          <Button variant="outlined" onClick={() => setEditing(true)}>{EDIT_BUTTON_TEXT}</Button>
        </Box>

        <AppDialog open={editing} onClose={closeEdit}>
          {/* Only mounted while open, so it starts from the saved values every time */}
          {editing && <VehicleForm uid={uid} vehicle={vehicle} onSaved={closeEdit} />}
        </AppDialog>

        <ReadoutList items={details} layout="wrap" />

        <MaintenanceSection uid={uid} vehicle={vehicle} />

        <Box sx={{ alignSelf: "flex-start" }}>
          <DeleteWithConfirm
            label={DELETE_VEHICLE_BUTTON_TEXT}
            message={confirmDeleteVehicleText(vehicle.name)}
            isPending={remove.isPending}
            onDelete={() => remove.mutate(vehicle.id)}
          />
        </Box>
        <ErrorAlert prefix={COULDNT_DELETE_TEXT} error={remove.error} />
      </Box>
    </Card>
  );
}
