import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { LOADING_TEXT } from "../../Constants";

/** Full-width "Loading..." line with a small spinner. The text stays visible for screen readers and tests. */
export default function LoadingState() {
  return (
    <Box role="status" sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1.5, my: 4 }}>
      <CircularProgress size={20} aria-hidden />
      <Typography
        component="span"
        sx={{ typography: "button", fontSize: 15, lineHeight: 1.4, letterSpacing: "0.12em", color: "text.secondary" }}
      >
        {LOADING_TEXT}
      </Typography>
    </Box>
  );
}
