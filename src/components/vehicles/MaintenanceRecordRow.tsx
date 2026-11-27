import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ListItem from "@mui/material/ListItem";
import Typography from "@mui/material/Typography";
import DeleteWithConfirm from "../common/DeleteWithConfirm";
import ErrorAlert from "../common/ErrorAlert";
import {
  COULDNT_DELETE_TEXT,
  DELETE_BUTTON_TEXT,
  EDIT_BUTTON_TEXT,
  confirmDeleteMaintenanceText,
} from "../../Constants";
import { useDeleteMaintenance } from "../../hooks/useVehicles";
import { formatCost, formatDate, formatMileage } from "../../utils/formatters";
import { MAINTENANCE_LABELS, type MaintenanceEntry } from "../../types/vehicle";

type MaintenanceRecordRowProps = {
  uid: string;
  vehicleId: string;
  entry: MaintenanceEntry;
  onEdit: (entry: MaintenanceEntry) => void;
};

/** One service record: what was done and when, with its own Edit and Delete buttons. */
export default function MaintenanceRecordRow({ uid, vehicleId, entry, onEdit }: MaintenanceRecordRowProps) {
  const remove = useDeleteMaintenance(uid);

  const meta = [
    entry.mileage !== undefined && formatMileage(entry.mileage),
    entry.cost !== undefined && formatCost(entry.cost),
  ].filter(Boolean).join(" · ");

  return (
    <ListItem
      disablePadding
      sx={{
        flexDirection: "column",
        alignItems: "stretch",
        gap: "4px",
        p: "12px 14px",
        fontSize: 15,
        bgcolor: "background.default",
        border: 1,
        borderColor: "divider",
        borderLeft: "3px solid",
        borderLeftColor: "primary.main",
        borderRadius: "8px",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 1 }}>
        <Typography
          component="strong"
          sx={{ typography: "h3", fontSize: 17, fontWeight: 700, lineHeight: 1.2, letterSpacing: "0.04em", color: "text.primary" }}
        >
          {MAINTENANCE_LABELS[entry.type]}
        </Typography>
        <Typography
          component="span"
          sx={{ fontSize: 14, fontVariantNumeric: "tabular-nums", color: "text.secondary" }}
        >
          {formatDate(entry.date)}
        </Typography>
      </Box>
      {meta && <Typography sx={{ fontSize: "inherit", color: "text.secondary" }}>{meta}</Typography>}
      {entry.details && <Typography sx={{ fontSize: 14 }}>{entry.details}</Typography>}
      <Box sx={{ display: "flex", gap: 1, mt: "4px" }}>
        <Button variant="outlined" size="small" onClick={() => onEdit(entry)}>{EDIT_BUTTON_TEXT}</Button>
        <DeleteWithConfirm
          size="small"
          label={DELETE_BUTTON_TEXT}
          pendingLabel={DELETE_BUTTON_TEXT}
          message={confirmDeleteMaintenanceText(MAINTENANCE_LABELS[entry.type].toLowerCase(), formatDate(entry.date))}
          isPending={remove.isPending}
          onDelete={() => remove.mutate({ vehicleId, entryId: entry.id })}
        />
      </Box>
      <ErrorAlert prefix={COULDNT_DELETE_TEXT} error={remove.error} />
    </ListItem>
  );
}
