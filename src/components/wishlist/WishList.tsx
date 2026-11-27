import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ListStatus from "../common/ListStatus";
import WishListSection from "./WishListSection";
import { useVehicles } from "../../hooks/useVehicles";
import {
  COULDNT_LOAD_VEHICLES_TEXT,
  LOADING_VEHICLES_TEXT,
  NO_WISHLIST_ITEMS_TEXT,
  WISHLIST_CHECK_FREQUENCY_TEXT,
} from "../../Constants";

/** A wish list section for every vehicle in the garage. */
export default function WishList({ uid }: { uid: string }) {
  const { data, isLoading, isError, error } = useVehicles(uid);

  return (
    <ListStatus
      isLoading={isLoading}
      error={isError ? error : null}
      isEmpty={!data?.length}
      loadingText={LOADING_VEHICLES_TEXT}
      emptyText={NO_WISHLIST_ITEMS_TEXT}
      errorText={COULDNT_LOAD_VEHICLES_TEXT}
      errorDetail={false}
    >
      <Box sx={{ width: "min(960px, calc(100% - 48px))", mx: "auto", pb: 6, textAlign: "left" }}>
        <Typography sx={{ mb: 2, fontSize: 14 }}>{WISHLIST_CHECK_FREQUENCY_TEXT}</Typography>
        {data?.map((v) => (
          <WishListSection key={v.id} uid={uid} vehicle={v} />
        ))}
      </Box>
    </ListStatus>
  );
}
