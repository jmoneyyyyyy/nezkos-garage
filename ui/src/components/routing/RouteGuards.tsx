import { Navigate, Outlet } from "react-router-dom";
import { LOADING_TEXT } from "../../Constants";
import { useAuth } from "../../hooks/useAuth";

/** Signed-in users only; everyone else goes to the landing page. */
export function RequireAuth() {
  const { user, loading } = useAuth();
  if (loading) return <p>{LOADING_TEXT}</p>;
  return user ? <Outlet /> : <Navigate to="/" replace />;
}

/** Signed-out users only; signed-in users go straight to their vehicles. */
export function RedirectIfAuthed() {
  const { user, loading } = useAuth();
  if (loading) return <p>{LOADING_TEXT}</p>;
  return user ? <Navigate to="/vehicles" replace /> : <Outlet />;
}
