import { act, renderHook } from "@testing-library/react";
import { useFormState } from "./useFormState";

describe("useFormState", () => {
  it("updates one field at a time through set(key)", () => {
    const { result } = renderHook(() => useFormState({ name: "", year: "" }));
    act(() => result.current[1]("name")({ target: { value: "Civic" } }));
    act(() => result.current[1]("year")({ target: { value: "2020" } }));
    expect(result.current[0]).toEqual({ name: "Civic", year: "2020" });
  });

  it("can reset the whole form with the raw setter", () => {
    const { result } = renderHook(() => useFormState({ name: "" }));
    act(() => result.current[1]("name")({ target: { value: "x" } }));
    act(() => result.current[2]({ name: "" }));
    expect(result.current[0]).toEqual({ name: "" });
  });
});
