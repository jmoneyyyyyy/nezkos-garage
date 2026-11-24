import { Outlet, useLocation } from "react-router-dom";
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
            <span className="site-header-user">
              {WELCOME_BACK_TEXT} {user.displayName ?? user.email}
            </span>
            <button onClick={signOut}>{SIGN_OUT_BUTTON_TEXT}</button>
          </>
        )}
        {userNotSignedIn && (
          <>
            {pathname === "/" && (
              <button className="site-header-link" onClick={scrollToHowItWorks}>
                {HOW_IT_WORKS_LINK_TEXT}
              </button>
            )}
            <button onClick={signIn}>{SIGN_IN_BUTTON_TEXT}</button>
          </>
        )}
      </Header>
      {!loading && user && <TabNav />}
      <Outlet />
    </div>
  );
}
