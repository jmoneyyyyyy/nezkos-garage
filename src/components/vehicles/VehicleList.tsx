import VehicleCard from "./VehicleCard";
import { useVehicles } from "../../hooks/useVehicles";
import { COULDNT_LOAD_VEHICLES_TEXT, LOADING_VEHICLES_TEXT, NO_VEHICLES_YET_TEXT } from "../../Constants";

export default function VehicleList({ uid }: { uid: string }) {
  const { data, isLoading, isError, error } = useVehicles(uid);

  if (isLoading) return <p className="list-status">{LOADING_VEHICLES_TEXT}</p>;
  if (isError) return <p role="alert" className="list-status">{COULDNT_LOAD_VEHICLES_TEXT}: {error.message}</p>;
  if (!data?.length) return <p className="list-status">{NO_VEHICLES_YET_TEXT}</p>;

  return (
    <div className="vehicle-grid">
      {data.map((v) => (
        <VehicleCard key={v.id} uid={uid} vehicle={v} />
      ))}
    </div>
  );
}
