import { useAuth } from "../auth/useAuth";
import { GARAGE_LOG_TITLE } from "../Constants";
import AddVehicleModal from "./AddVehicleModal";
import VehicleList from "./VehicleList";

export default function VehiclesPage() {
  const { user } = useAuth();
  if (!user) return null; // RequireAuth guarantees a user; this narrows the type

  return (
    <main className="vehicles-page">
      <h1 className="page-title">{GARAGE_LOG_TITLE}</h1>
      <AddVehicleModal uid={user.uid} />
      <VehicleList uid={user.uid} />
    </main>
  );
}
