import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import AppDialog from "../common/AppDialog";
import MaintenanceForm from "./MaintenanceForm";
import MaintenanceRecordList from "./MaintenanceRecordList";
import {
  ADD_SERVICE_BUTTON_TEXT,
  MAINTENANCE_HISTORY_TITLE,
  NO_MAINTENANCE_RECORDS_TEXT,
  VIEW_MAINTENANCE_HISTORY_TEXT,
  maintenanceLastText,
} from "../../Constants";
import { formatDate } from "../../utils/formatters";
import { MAINTENANCE_LABELS, type MaintenanceEntry, type Vehicle } from "../../types/vehicle";

export default function MaintenanceSection({ uid, vehicle }: { uid: string; vehicle: Vehicle }) {
  const [showList, setShowList] = useState(false);
  const [editing, setEditing] = useState<MaintenanceEntry | "new" | null>(null);
  const closeForm = () => setEditing(null);
  const entries = [...vehicle.maintenance].sort((a, b) => b.date.localeCompare(a.date));
  const latest = entries[0];
  const maintenanceHistoryPresent = entries.length > 0;

  return (
    <Box component="section" sx={{ borderTop: "1px dashed", borderColor: "divider", pt: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1 }}>
        <Typography component="h3" variant="h3" sx={{ m: 0, fontSize: 16 }}>
          {MAINTENANCE_HISTORY_TITLE}
        </Typography>
        <Button variant="contained" size="small" onClick={() => setEditing("new")}>
          {ADD_SERVICE_BUTTON_TEXT}
        </Button>
      </Box>
      <Typography sx={{ mt: 1, fontSize: 15, color: "text.secondary" }}>
        {latest
          ? maintenanceLastText(MAINTENANCE_LABELS[latest.type], formatDate(latest.date))
          : NO_MAINTENANCE_RECORDS_TEXT}
      </Typography>
      {maintenanceHistoryPresent && (
        <Button variant="outlined" size="small" sx={{ mt: 1 }} onClick={() => setShowList(true)}>
          {VIEW_MAINTENANCE_HISTORY_TEXT}
        </Button>
      )}

      <AppDialog open={showList} onClose={() => setShowList(false)}>
        <MaintenanceRecordList uid={uid} vehicle={vehicle} entries={entries} onEdit={setEditing} />
      </AppDialog>

      {/* A sibling of the list modal, not inside it, so it opens on top of the list.
          Keyed so the form starts fresh each time it opens for a different record. */}
      <AppDialog open={editing !== null} onClose={closeForm}>
        {editing && (
          <MaintenanceForm
            key={editing === "new" ? "new" : editing.id}
            uid={uid}
            vehicleId={vehicle.id}
            entry={editing === "new" ? undefined : editing}
            onSaved={closeForm}
          />
        )}
      </AppDialog>
    </Box>
  );
}
