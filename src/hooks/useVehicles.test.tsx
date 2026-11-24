import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import * as api from "../api/vehicles";
import { useAddWishListItem, useDeleteMaintenance, useVehicles } from "./useVehicles";

vi.mock("../api/vehicles");

function setup() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { client, wrapper };
}

describe("useVehicles", () => {
  it("loads the vehicles for the given uid", async () => {
    const vehicles = [{ id: "v1", name: "Truck" }];
    vi.mocked(api.getAllVehicles).mockResolvedValue(vehicles as never);
    const { wrapper } = setup();

    const { result } = renderHook(() => useVehicles("u1"), { wrapper });

    await waitFor(() => expect(result.current.data).toEqual(vehicles));
    expect(api.getAllVehicles).toHaveBeenCalledWith("u1");
  });

  it("surfaces errors", async () => {
    vi.mocked(api.getAllVehicles).mockRejectedValue(new Error("boom"));
    const { wrapper } = setup();

    const { result } = renderHook(() => useVehicles("u1"), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe("mutation hooks", () => {
  it("call the api and then invalidate the vehicles query", async () => {
    vi.mocked(api.deleteMaintenanceEntry).mockResolvedValue(undefined);
    const { client, wrapper } = setup();
    const invalidate = vi.spyOn(client, "invalidateQueries");

    const { result } = renderHook(() => useDeleteMaintenance("u1"), { wrapper });
    await act(() => result.current.mutateAsync({ vehicleId: "v1", entryId: "e1" }));

    expect(api.deleteMaintenanceEntry).toHaveBeenCalledWith("v1", "e1");
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["vehicles", "u1"] });
  });

  it("does not invalidate when the api call fails", async () => {
    vi.mocked(api.addWishListItem).mockRejectedValue(new Error("nope"));
    const { client, wrapper } = setup();
    const invalidate = vi.spyOn(client, "invalidateQueries");

    const { result } = renderHook(() => useAddWishListItem("u1"), { wrapper });
    await act(async () => {
      await result.current
        .mutateAsync({ vehicleId: "v1", input: { name: "Jack", link: "https://x.test", price: 50 } })
        .catch(() => {});
    });

    expect(invalidate).not.toHaveBeenCalled();
  });
});
