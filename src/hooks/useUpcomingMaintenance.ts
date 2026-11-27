import { useQuery } from "@tanstack/react-query";
import { askClaude } from "../lib/claude";
import { parseUpcoming } from "../utils/upcomingMaintenance";
import type { Vehicle } from "../types/vehicle";

function buildPrompt(vehicle: Vehicle) {
  const summary = {
    name: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
    mileage: vehicle.mileage,
    maintenance: vehicle.maintenance.map((m) => ({ type: m.type, date: m.date, mileage: m.mileage })),
  };
  return `This is my vehicle and its maintenance history: ${JSON.stringify(summary)}. Reply with the top 3 most important maintenance tasks coming up, as a bullet list. For each, give only the maintenance type and when it's due, nothing else.`;
}

export function useUpcomingMaintenance(vehicle: Vehicle | undefined) {
  const isClaudeEnabled = localStorage.getItem("isClaudeEnabled") === "true";
  const prompt = vehicle ? buildPrompt(vehicle) : "";
  const { data } = useQuery({
    // The prompt holds the vehicle's mileage and history, so adding an entry refreshes the answer
    queryKey: ["upcoming-maintenance", vehicle?.id, prompt],
    queryFn: async () => parseUpcoming(await askClaude(prompt)),
    enabled: isClaudeEnabled && !!vehicle,
    staleTime: Infinity,
    retry: false,
  });
  return data ?? [];
}
