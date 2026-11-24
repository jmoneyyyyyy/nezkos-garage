import { Navigate, Route, Routes } from "react-router-dom";
import { RedirectIfAuthed, RequireAuth } from "./RouteGuards";
import AppLayout from "../layout/AppLayout";
import LandingPage from "../landing/LandingPage";
import VehiclesPage from "../vehicles/VehiclesPage";
import FundsPage from "../funds/FundsPage";
import WishListPage from "../wishlist/WishListPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route element={<RedirectIfAuthed />}>
          <Route path="/" element={<LandingPage />} />
        </Route>
        <Route element={<RequireAuth />}>
          <Route path="/vehicles" element={<VehiclesPage />} />
          <Route path="/funds" element={<FundsPage />} />
          <Route path="/wishlist" element={<WishListPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
