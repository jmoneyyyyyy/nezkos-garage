import {
  addDoc, arrayUnion, collection, deleteDoc, deleteField, doc, getDocs,
  query, runTransaction, serverTimestamp, updateDoc, where,
} from "firebase/firestore";
import db from "../firebase";
import { newId } from "../lib/id";
import type {
  MaintenanceEntry, NewMaintenanceInput, NewVehicleInput, Vehicle, VehicleDetailsInput,
} from "./types";

export async function listVehicles(uid: string): Promise<Vehicle[]> {
  const q = query(collection(db, "vehicles"), where("owners", "array-contains", uid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Vehicle, "id">) }));
}

export async function createVehicle(uid: string, input: NewVehicleInput): Promise<string> {
  const ref = await addDoc(collection(db, "vehicles"), {
    ...input,
    owners: [uid],
    maintenance: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateVehicle(vehicleId: string, input: VehicleDetailsInput) {
  await updateDoc(doc(db, "vehicles", vehicleId), {
    ...input,
    // A cleared optional field comes in as undefined, which Firestore skips (leaving
    // the old value), so delete those fields explicitly.
    trim: input.trim ?? deleteField(),
    vin: input.vin ?? deleteField(),
    licensePlate: input.licensePlate ?? deleteField(),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteVehicle(vehicleId: string) {
  await deleteDoc(doc(db, "vehicles", vehicleId));
}

export async function setVehiclePhoto(vehicleId: string, photo: string | null) {
  await updateDoc(doc(db, "vehicles", vehicleId), {
    photo: photo ?? deleteField(),
    updatedAt: serverTimestamp(),
  });
}

export async function addMaintenanceEntry(vehicleId: string, input: NewMaintenanceInput) {
  await updateDoc(doc(db, "vehicles", vehicleId), {
    maintenance: arrayUnion({ id: newId(), ...input }),
    updatedAt: serverTimestamp(),
  });
}

// Service records live in an array on the vehicle doc, so changing or removing one
// means reading the array and writing back an edited copy. The transaction keeps
// two edits made at the same time from overwriting each other.
async function editMaintenance(
  vehicleId: string,
  edit: (entries: MaintenanceEntry[]) => MaintenanceEntry[]
) {
  const ref = doc(db, "vehicles", vehicleId);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error("This vehicle no longer exists.");
    const { maintenance = [] } = snap.data() as Vehicle;
    tx.update(ref, { maintenance: edit(maintenance), updatedAt: serverTimestamp() });
  });
}

export async function updateMaintenanceEntry(vehicleId: string, entry: MaintenanceEntry) {
  await editMaintenance(vehicleId, (entries) =>
    entries.map((e) => (e.id === entry.id ? entry : e))
  );
}

export async function deleteMaintenanceEntry(vehicleId: string, entryId: string) {
  await editMaintenance(vehicleId, (entries) => entries.filter((e) => e.id !== entryId));
}
