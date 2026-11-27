import { NavLink, useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import {
  FUNDS_TAB_TEXT,
  GARAGE_TAB_TEXT,
  MAIN_NAV_LABEL,
  WISHLIST_TAB_TEXT,
} from "../../Constants";

const TABS = [
  { to: "/vehicles", label: GARAGE_TAB_TEXT },
  { to: "/funds", label: FUNDS_TAB_TEXT },
  { to: "/wishlist", label: WISHLIST_TAB_TEXT },
];

/** Top-level section tabs for signed-in users. The selected tab follows the URL. */
export default function TabNav() {
  const { pathname } = useLocation();
  const current = TABS.find((tab) => pathname.startsWith(tab.to))?.to ?? false;

  return (
    <Box
      component="nav"
      aria-label={MAIN_NAV_LABEL}
      sx={{ borderBottom: 1, borderColor: "divider", px: { xs: 1, sm: 3 } }}
    >
      <Tabs value={current} centered>
        {TABS.map((tab) => (
          <Tab key={tab.to} component={NavLink} to={tab.to} value={tab.to} label={tab.label} />
        ))}
      </Tabs>
    </Box>
  );
}
