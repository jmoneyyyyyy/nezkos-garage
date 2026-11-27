import Box from "@mui/material/Box";
import ListStatus from "../common/ListStatus";
import VehicleCard from "./VehicleCard";
import { useVehicles } from "../../hooks/useVehicles";
import { COULDNT_LOAD_VEHICLES_TEXT, LOADING_VEHICLES_TEXT, NO_VEHICLES_YET_TEXT } from "../../Constants";

export default function VehicleList({ uid }: { uid: string }) {
  const { data, isLoading, isError, error } = useVehicles(uid);

  return (
    <ListStatus
      isLoading={isLoading}
      error={isError ? error : null}
      isEmpty={!data?.length}
      loadingText={LOADING_VEHICLES_TEXT}
      emptyText={NO_VEHICLES_YET_TEXT}
      errorText={COULDNT_LOAD_VEHICLES_TEXT}
    >
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "flex-start", // cards keep their own height instead of matching the tallest
          gap: "28px",
          p: "32px 24px",
          textAlign: "left",
        }}
      >
        {data?.map((v) => (
          <VehicleCard key={v.id} uid={uid} vehicle={v} />
        ))}
      </Box>
    </ListStatus>
  );
}
