import { Navigate, Route, Routes } from "react-router-dom";
import { RedirectIfAuthed, RequireAuth } from "./components/routing/RouteGuards";
import AppLayout from "./components/layout/AppLayout";
import LandingPage from "./pages/LandingPage";
import VehiclesPage from "./pages/VehiclesPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route element={<RedirectIfAuthed />}>
          <Route path="/" element={<LandingPage />} />
        </Route>
        <Route element={<RequireAuth />}>
          <Route path="/vehicles" element={<VehiclesPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
