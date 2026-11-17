import {
  addDoc, arrayUnion, collection, deleteDoc, deleteField, doc, getDocs,
  query, runTransaction, serverTimestamp, updateDoc, where,
} from "firebase/firestore";
import { vehicleCollection } from "../firebase";
import { newId } from "../lib/id";
import type {
  MaintenanceEntry, NewMaintenanceInput, NewVehicleInput, Vehicle, VehicleDetailsInput,
} from "./types";

export async function getAllVehicles(uid: string): Promise<Vehicle[]> {
  const getAllVehiclesQuery = query(collection(vehicleCollection, "vehicles"), where("owners", "array-contains", uid));
  const snap = await getDocs(getAllVehiclesQuery);
  return snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<Vehicle, "id">) }));
}

export async function addNewVehicle(uid: string, input: NewVehicleInput): Promise<string> {
  const ref = await addDoc(collection(vehicleCollection, "vehicles"), {
    ...input,
    owners: [uid],
    maintenance: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateVehicleInformation(vehicleId: string, input: VehicleDetailsInput) {
  await updateDoc(doc(vehicleCollection, "vehicles", vehicleId), {
    ...input,
    trim: input.trim ?? deleteField(),
    vin: input.vin ?? deleteField(),
    licensePlate: input.licensePlate ?? deleteField(),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteVehicle(vehicleId: string) {
  await deleteDoc(doc(vehicleCollection, "vehicles", vehicleId));
}

export async function setVehiclePhoto(vehicleId: string, photo: string | null) {
  await updateDoc(doc(vehicleCollection, "vehicles", vehicleId), {
    photo: photo ?? deleteField(),
    updatedAt: serverTimestamp(),
  });
}

export async function addMaintenanceEntry(vehicleId: string, input: NewMaintenanceInput) {
  await updateDoc(doc(vehicleCollection, "vehicles", vehicleId), {
    maintenance: arrayUnion({ id: newId(), ...input }),
    updatedAt: serverTimestamp(),
  });
}

async function editMaintenanceRecord(
  vehicleId: string,
  edit: (entries: MaintenanceEntry[]) => MaintenanceEntry[]
) {
  const ref = doc(vehicleCollection, "vehicles", vehicleId);
  await runTransaction(vehicleCollection, async (transaction) => {
    const snap = await transaction.get(ref);
    if (!snap.exists()) throw new Error("This vehicle no longer exists.");
    const { maintenance = [] } = snap.data() as Vehicle;
    transaction.update(ref, { maintenance: edit(maintenance), updatedAt: serverTimestamp() });
  });
}

export async function updateMaintenanceEntry(vehicleId: string, entry: MaintenanceEntry) {
  await editMaintenanceRecord(vehicleId, (entries) =>
    entries.map((entryItem) => (entryItem.id === entry.id ? entry : entryItem))
  );
}

export async function deleteMaintenanceEntry(vehicleId: string, entryId: string) {
  await editMaintenanceRecord(vehicleId, (entries) => entries.filter((entryItem) => entryItem.id !== entryId));
}
