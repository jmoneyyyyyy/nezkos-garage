import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addMaintenanceEntry, createVehicle, deleteMaintenanceEntry, deleteVehicle,
  listVehicles, setVehiclePhoto, updateMaintenanceEntry, updateVehicle,
} from "./api";
import type {
  MaintenanceEntry, NewMaintenanceInput, NewVehicleInput, VehicleDetailsInput,
} from "./types";

export function useVehicles(uid: string) {
  return useQuery({
    queryKey: ["vehicles", uid],
    queryFn: () => listVehicles(uid),
  });
}

// Every vehicle write refetches the list afterwards so the page shows the saved state.
function useVehicleMutation<TInput>(uid: string, mutationFn: (input: TInput) => Promise<unknown>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vehicles", uid] }),
  });
}

export function useCreateVehicle(uid: string) {
  return useVehicleMutation(uid, (input: NewVehicleInput) => createVehicle(uid, input));
}

export function useUpdateVehicle(uid: string) {
  return useVehicleMutation(uid, ({ vehicleId, input }: { vehicleId: string; input: VehicleDetailsInput }) =>
    updateVehicle(vehicleId, input)
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
