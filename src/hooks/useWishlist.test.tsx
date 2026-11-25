import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import * as wishlistApi from "../services/wishlist";
import { useAddWishListItem, useDeleteWishListItem, useUpdateWishListItem } from "./useWishlist";

vi.mock("../services/wishlist");

function setup() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { client, wrapper };
}

const input = { name: "Jack", link: "https://x.test", price: 50 };
const item = { id: "w1", ...input };

beforeEach(() => vi.clearAllMocks());

describe("wish list mutation hooks", () => {
  it("useAddWishListItem calls the api and invalidates the vehicles query", async () => {
    vi.mocked(wishlistApi.addWishListItem).mockResolvedValue(undefined);
    const { client, wrapper } = setup();
    const invalidate = vi.spyOn(client, "invalidateQueries");

    const { result } = renderHook(() => useAddWishListItem("u1"), { wrapper });
    await act(() => result.current.mutateAsync({ vehicleId: "v1", input }));

    expect(wishlistApi.addWishListItem).toHaveBeenCalledWith("v1", input);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["vehicles", "u1"] });
  });

  it("useUpdateWishListItem calls the api and invalidates the vehicles query", async () => {
    vi.mocked(wishlistApi.updateWishListItem).mockResolvedValue(undefined);
    const { client, wrapper } = setup();
    const invalidate = vi.spyOn(client, "invalidateQueries");

    const { result } = renderHook(() => useUpdateWishListItem("u1"), { wrapper });
    await act(() => result.current.mutateAsync({ vehicleId: "v1", item }));

    expect(wishlistApi.updateWishListItem).toHaveBeenCalledWith("v1", item);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["vehicles", "u1"] });
  });

  it("useDeleteWishListItem calls the api and invalidates the vehicles query", async () => {
    vi.mocked(wishlistApi.deleteWishListItem).mockResolvedValue(undefined);
    const { client, wrapper } = setup();
    const invalidate = vi.spyOn(client, "invalidateQueries");

    const { result } = renderHook(() => useDeleteWishListItem("u1"), { wrapper });
    await act(() => result.current.mutateAsync({ vehicleId: "v1", itemId: "w1" }));

    expect(wishlistApi.deleteWishListItem).toHaveBeenCalledWith("v1", "w1");
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["vehicles", "u1"] });
  });

  it("does not invalidate when the api call fails", async () => {
    vi.mocked(wishlistApi.addWishListItem).mockRejectedValue(new Error("nope"));
    const { client, wrapper } = setup();
    const invalidate = vi.spyOn(client, "invalidateQueries");

    const { result } = renderHook(() => useAddWishListItem("u1"), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({ vehicleId: "v1", input }).catch(() => {});
    });

    expect(invalidate).not.toHaveBeenCalled();
  });
});
