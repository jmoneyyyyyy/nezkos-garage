import type { Timestamp } from "firebase/firestore";

export const MAINTENANCE_TYPES = [
  "oil_change",
  "tire_rotation",
  "tire_replacement",
  "brake_pads",
  "brake_fluid",
  "air_filter",
  "cabin_filter",
  "battery",
  "coolant_flush",
  "transmission_service",
  "spark_plugs",
  "wiper_blades",
  "alignment",
  "inspection",
  "repair",
  "modification",
  "other",
] as const;

export type MaintenanceType = (typeof MAINTENANCE_TYPES)[number];

export const MAINTENANCE_LABELS: Record<MaintenanceType, string> = {
  oil_change: "Oil change",
  tire_rotation: "Tire rotation",
  tire_replacement: "Tire replacement",
  brake_pads: "Brake pads",
  brake_fluid: "Brake fluid",
  air_filter: "Air filter",
  cabin_filter: "Cabin filter",
  battery: "Battery",
  coolant_flush: "Coolant flush",
  transmission_service: "Transmission service",
  spark_plugs: "Spark plugs",
  wiper_blades: "Wiper blades",
  alignment: "Alignment",
  inspection: "Inspection",
  repair: "Repair",
  modification: "Modification",
  other: "Other",
};

export interface MaintenanceEntry {
  id: string;
  type: MaintenanceType;
  date: string; // "YYYY-MM-DD"
  mileage?: number; // odometer at time of service
  cost?: number;
  details?: string; // e.g. "0W-20 full synthetic, OEM filter"
}

export interface Vehicle {
  id: string;
  name: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  color: string;
  trim?: string;
  vin?: string;
  licensePlate?: string;
  photo?: string; // JPEG data URL, resized in the browser to fit in the doc
  owners: string[];
  maintenance: MaintenanceEntry[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export type NewVehicleInput = Omit<
  Vehicle,
  "id" | "owners" | "maintenance" | "createdAt" | "updatedAt"
>;

// The fields the vehicle form edits. The photo is saved separately from the card.
export type VehicleDetailsInput = Omit<NewVehicleInput, "photo">;

export type NewMaintenanceInput = Omit<MaintenanceEntry, "id">;