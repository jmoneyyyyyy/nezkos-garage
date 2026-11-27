import { Outlet, useLocation } from "react-router-dom";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useAuth } from "../../hooks/useAuth";
import {
  HOW_IT_WORKS_LINK_TEXT,
  SIGN_IN_BUTTON_TEXT,
  SIGN_OUT_BUTTON_TEXT,
  WELCOME_BACK_TEXT,
} from "../../Constants";
import Header from "./Header";
import TabNav from "./TabNav";

function scrollToHowItWorks() {
  document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
}

// The header buttons are a little smaller than the page's.
const headerButtonSx = { fontSize: 12, padding: "7px 12px" };

/** Shell for every page: the shared Header plus the matched route's page. */
export default function AppLayout() {
  const { user, loading, signIn, signOut } = useAuth();
  const { pathname } = useLocation();
  const userSignedIn = !loading && user;
  const userNotSignedIn = !loading && !user;

  return (
    <div>
      <Header>
        {userSignedIn && (
          <>
            <Typography component="span" noWrap sx={{ minWidth: 0, fontSize: 14 }}>
              {WELCOME_BACK_TEXT} {user.displayName ?? user.email}
            </Typography>
            <Button variant="outlined" onClick={signOut} sx={headerButtonSx}>
              {SIGN_OUT_BUTTON_TEXT}
            </Button>
          </>
        )}
        {userNotSignedIn && (
          <>
            {pathname === "/" && (
              <Button
                variant="text"
                onClick={scrollToHowItWorks}
                sx={{
                  p: 0,
                  minWidth: 0,
                  color: "text.secondary",
                  "&:hover": { background: "none", color: "text.primary" },
                  "@media (max-width:560px)": { display: "none" },
                }}
              >
                {HOW_IT_WORKS_LINK_TEXT}
              </Button>
            )}
            <Button variant="outlined" onClick={signIn} sx={headerButtonSx}>
              {SIGN_IN_BUTTON_TEXT}
            </Button>
          </>
        )}
      </Header>
      {userSignedIn && <TabNav />}
      <Outlet />
    </div>
  );
}
