import { useVehicles } from "../../hooks/useVehicles";
import { useUpcomingMaintenance } from "../../hooks/useUpcomingMaintenance";
import { COULDNT_LOAD_VEHICLES_TEXT, LOADING_VEHICLES_TEXT, NO_VEHICLES_YET_TEXT } from "../../Constants";
import VehicleCard from "./VehicleCard";

export default function VehicleList({ uid }: { uid: string }) {
  const { data, isLoading, isError, error } = useVehicles(uid);
  const civic = data?.find((v) => /civic/i.test(v.model));
  // Only the Civic gets upcoming-maintenance suggestions for now
  const upcomingVehicleMaintenance = useUpcomingMaintenance(civic);

  if (isLoading) return <p className="list-status">{LOADING_VEHICLES_TEXT}</p>;
  if (isError) return <p role="alert" className="list-status">{COULDNT_LOAD_VEHICLES_TEXT}: {error.message}</p>;
  if (!data?.length) return <p className="list-status">{NO_VEHICLES_YET_TEXT}</p>;

  return (
    <div className="vehicle-grid">
      {data.map((v) => (
        <VehicleCard key={v.id} uid={uid} vehicle={v} upcomingMaintenance={v.id === civic?.id ? upcomingVehicleMaintenance : []} />
      ))}
    </div>
  );
}
