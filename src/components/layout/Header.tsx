import type { ReactNode } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { NEZKOS_GARAGE } from "../../Constants";

type HeaderProps = { children?: ReactNode };

/** Sticky top bar shared by the landing page and the signed-in app. */
export default function Header({ children }: HeaderProps) {
  return (
    <AppBar
      position="sticky"
      color="transparent"
      sx={{
        bgcolor: "rgba(10, 12, 11, 0.85)",
        backgroundImage: "none",
        boxShadow: "none",
        borderBottom: 1,
        borderColor: "divider",
        backdropFilter: "blur(8px)",
      }}
    >
      <Toolbar disableGutters sx={{ justifyContent: "space-between", gap: 2, minHeight: 0, px: { xs: 2, sm: 3 }, py: 1.75 }}>
        <Typography
          component="span"
          sx={{
            typography: "h1",
            fontSize: 22,
            lineHeight: 1,
            letterSpacing: "0.02em",
            color: "text.primary",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {NEZKOS_GARAGE}
        </Typography>
        <Box
          component="nav"
          sx={{ display: "flex", alignItems: "center", gap: "20px", minWidth: 0, "@media (max-width:560px)": { gap: "12px" } }}
        >
          {children}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
