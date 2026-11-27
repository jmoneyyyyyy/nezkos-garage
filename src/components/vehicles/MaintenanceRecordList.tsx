import Box from "@mui/material/Box";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import DialogHeading from "../common/DialogHeading";
import MaintenanceRecordRow from "./MaintenanceRecordRow";
import { NO_MAINTENANCE_RECORDS_TEXT, maintenanceRecordsTitle } from "../../Constants";
import type { MaintenanceEntry, Vehicle } from "../../types/vehicle";

type MaintenanceRecordListProps = {
  uid: string;
  vehicle: Vehicle;
  entries: MaintenanceEntry[];
  onEdit: (entry: MaintenanceEntry) => void;
};

/** The body of the "maintenance records" modal: a title and one row per service record. */
export default function MaintenanceRecordList({ uid, vehicle, entries, onEdit }: MaintenanceRecordListProps) {
  const noMaintenanceRecord = entries.length === 0;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1.5, textAlign: "left" }}>
      <DialogHeading>{maintenanceRecordsTitle(vehicle.name)}</DialogHeading>
      {noMaintenanceRecord ? (
        <Typography sx={{ color: "text.secondary" }}>{NO_MAINTENANCE_RECORDS_TEXT}</Typography>
      ) : (
        <List disablePadding sx={{ alignSelf: "stretch", display: "flex", flexDirection: "column", gap: 1 }}>
          {entries.map((entry) => (
            <MaintenanceRecordRow key={entry.id} uid={uid} vehicleId={vehicle.id} entry={entry} onEdit={onEdit} />
          ))}
        </List>
      )}
    </Box>
  );
}
