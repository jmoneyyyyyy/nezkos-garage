import { NavLink } from "react-router-dom";
import {
  FUNDS_TAB_TEXT,
  GARAGE_TAB_TEXT,
  MAIN_NAV_LABEL,
  WISHLIST_TAB_TEXT,
} from "../../Constants";
import "./tab-nav.css";

const TABS = [
  { to: "/vehicles", label: GARAGE_TAB_TEXT },
  { to: "/funds", label: FUNDS_TAB_TEXT },
  { to: "/wishlist", label: WISHLIST_TAB_TEXT },
];

/** Top-level section tabs for signed-in users. */
export default function TabNav() {
  return (
    <nav className="tab-nav" aria-label={MAIN_NAV_LABEL}>
      {TABS.map((tab) => (
        <NavLink key={tab.to} to={tab.to} className="tab-nav-link">
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}
