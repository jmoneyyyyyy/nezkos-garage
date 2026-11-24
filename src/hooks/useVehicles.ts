import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addMaintenanceEntry, addNewVehicle, addWishListItem, deleteMaintenanceEntry, deleteVehicle,
  deleteWishListItem, getAllVehicles, setVehiclePhoto, updateMaintenanceEntry, updateVehicleInformation,
  updateWishListItem,
} from "../api/vehicles";
import type {
  MaintenanceEntry, NewMaintenanceInput, NewVehicleInput, NewWishListItemInput, VehicleDetailsInput, WishListItem,
} from "../types/vehicle";

export function useVehicles(uid: string) {
  return useQuery({
    queryKey: ["vehicles", uid],
    queryFn: () => getAllVehicles(uid),
  });
}

function useVehicleMutation<TInput>(uid: string, mutationFn: (input: TInput) => Promise<unknown>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vehicles", uid] }),
  });
}

export function useCreateVehicle(uid: string) {
  return useVehicleMutation(uid, (input: NewVehicleInput) => addNewVehicle(uid, input));
}

export function useUpdateVehicle(uid: string) {
  return useVehicleMutation(uid, ({ vehicleId, input }: { vehicleId: string; input: VehicleDetailsInput }) =>
    updateVehicleInformation(vehicleId, input)
  );
}

export function useDeleteVehicle(uid: string) {
  return useVehicleMutation(uid, (vehicleId: string) => deleteVehicle(vehicleId));
}

export function useSetVehiclePhoto(uid: string) {
  return useVehicleMutation(uid, ({ vehicleId, photo }: { vehicleId: string; photo: string | null }) =>
    setVehiclePhoto(vehicleId, photo)
  );
}

export function useAddMaintenance(uid: string) {
  return useVehicleMutation(uid, ({ vehicleId, input }: { vehicleId: string; input: NewMaintenanceInput }) =>
    addMaintenanceEntry(vehicleId, input)
  );
}

export function useUpdateMaintenance(uid: string) {
  return useVehicleMutation(uid, ({ vehicleId, entry }: { vehicleId: string; entry: MaintenanceEntry }) =>
    updateMaintenanceEntry(vehicleId, entry)
  );
}

export function useDeleteMaintenance(uid: string) {
  return useVehicleMutation(uid, ({ vehicleId, entryId }: { vehicleId: string; entryId: string }) =>
    deleteMaintenanceEntry(vehicleId, entryId)
  );
}

export function useAddWishListItem(uid: string) {
  return useVehicleMutation(uid, ({ vehicleId, input }: { vehicleId: string; input: NewWishListItemInput }) =>
    addWishListItem(vehicleId, input)
  );
}

export function useUpdateWishListItem(uid: string) {
  return useVehicleMutation(uid, ({ vehicleId, item }: { vehicleId: string; item: WishListItem }) =>
    updateWishListItem(vehicleId, item)
  );
}

export function useDeleteWishListItem(uid: string) {
  return useVehicleMutation(uid, ({ vehicleId, itemId }: { vehicleId: string; itemId: string }) =>
    deleteWishListItem(vehicleId, itemId)
  );
}
