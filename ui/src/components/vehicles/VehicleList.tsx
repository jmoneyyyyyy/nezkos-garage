import VehicleCard from "./VehicleCard";
import { useVehicles } from "../../hooks/useVehicles";

export default function VehicleList({ uid }: { uid: string }) {
  const { data, isLoading, isError, error } = useVehicles(uid);

  if (isLoading) return <p>Loading vehicles...</p>;
  if (isError) return <p role="alert">Couldn't load vehicles: {error.message}</p>;
  if (!data?.length) return <p>No vehicles yet.</p>;

  return (
    <div className="vehicle-grid">
      {data.map((v) => (
        <VehicleCard key={v.id} uid={uid} vehicle={v} />
      ))}
    </div>
  );
}
