import { createBrowserRouter, Navigate } from "react-router-dom";
import { RedirectIfAuthed, RequireAuth } from "./auth/RouteGuards";
import AppLayout from "./components/AppLayout";
import Landing from "./landing/Landing";
import VehiclesPage from "./vehicles/VehiclesPage";

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { element: <RedirectIfAuthed />, children: [{ path: "/", element: <Landing /> }] },
      { element: <RequireAuth />, children: [{ path: "/vehicles", element: <VehiclesPage /> }] },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
