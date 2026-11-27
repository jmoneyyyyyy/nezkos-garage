import Box from "@mui/material/Box";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import AddWishListItemModal from "./AddWishListItemModal";
import WishListItemCard from "./WishListItemCard";
import { NO_WISHLIST_ITEMS_TEXT } from "../../Constants";
import { formatPrice } from "../../utils/formatters";
import type { Vehicle } from "../../types/vehicle";

/** One vehicle's wish list: its items, a count and total, and an Add item button. */
export default function WishListSection({ uid, vehicle }: { uid: string; vehicle: Vehicle }) {
  const items = vehicle.wishlist ?? [];
  // update to calculate total of items in wishlist, if currentPrice exists use that, otherwise use price
  const total = items.reduce((sum, item) => sum + (item.currentPrice ?? item.price), 0);
  const noWishListItems = items.length === 0;

  return (
    <Box component="section" sx={{ mb: 4 }}>
      <Box
        component="header"
        sx={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 2,
          pb: 1,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Typography component="h2" variant="h2" sx={{ m: 0, fontSize: 20 }}>
          {vehicle.year} {vehicle.make} {vehicle.model}
        </Typography>
        <Typography
          component="span"
          sx={{ ml: "auto", fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", color: "text.secondary" }}
        >
          {items.length} {items.length === 1 ? "item" : "items"}: {formatPrice(total)} total
        </Typography>
        <AddWishListItemModal uid={uid} vehicleId={vehicle.id} />
      </Box>
      {noWishListItems ? (
        <Typography
          sx={{
            mt: 1.5,
            p: "18px",
            fontSize: 15,
            color: "text.secondary",
            bgcolor: "background.paper",
            border: 1,
            borderColor: "divider",
            borderRadius: "10px",
          }}
        >
          {NO_WISHLIST_ITEMS_TEXT}
        </Typography>
      ) : (
        <List disablePadding sx={{ mt: 1.5, display: "flex", flexDirection: "column", gap: "10px" }}>
          {items.map((item) => (
            <WishListItemCard key={item.id} uid={uid} vehicleId={vehicle.id} item={item} />
          ))}
        </List>
      )}
    </Box>
  );
}
