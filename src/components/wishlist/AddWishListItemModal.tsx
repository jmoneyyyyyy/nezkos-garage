import { useState } from "react";
import Button from "@mui/material/Button";
import AppDialog from "../common/AppDialog";
import WishListItemForm from "./WishListItemForm";
import { ADD_WISHLIST_ITEM_BUTTON_TEXT } from "../../Constants";

export default function AddWishListItemModal({ uid, vehicleId }: { uid: string; vehicleId: string }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <Button variant="outlined" size="small" onClick={() => setOpen(true)}>{ADD_WISHLIST_ITEM_BUTTON_TEXT}</Button>
      <AppDialog open={open} onClose={close}>
        {/* Only mounted while open, so each open starts with an empty form */}
        {open && <WishListItemForm uid={uid} vehicleId={vehicleId} onSaved={close} />}
      </AppDialog>
    </>
  );
}
