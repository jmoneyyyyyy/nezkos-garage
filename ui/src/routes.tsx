import { createBrowserRouter, Navigate } from "react-router-dom";
import { RedirectIfAuthed, RequireAuth } from "./components/routing/RouteGuards";
import AppLayout from "./components/layout/AppLayout";
import LandingPage from "./pages/LandingPage";
import VehiclesPage from "./pages/VehiclesPage";

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { element: <RedirectIfAuthed />, children: [{ path: "/", element: <LandingPage /> }] },
      { element: <RequireAuth />, children: [{ path: "/vehicles", element: <VehiclesPage /> }] },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
