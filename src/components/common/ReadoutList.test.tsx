import { render, screen } from "@testing-library/react";
import ReadoutList from "./ReadoutList";

const items: [string, string][] = [
  ["Color", "Red"],
  ["Mileage", "12,000 mi"],
];

describe("ReadoutList", () => {
  it.each(["wrap", "grid"] as const)("puts each value right after its label (%s layout)", (layout) => {
    render(<ReadoutList items={items} layout={layout} />);
    expect(screen.getByText("Color").nextElementSibling).toHaveTextContent("Red");
    expect(screen.getByText("Mileage").nextElementSibling).toHaveTextContent("12,000 mi");
  });

  it("is a description list", () => {
    const { container } = render(<ReadoutList items={items} layout="wrap" />);
    expect(container.querySelector("dl")).toBeInTheDocument();
    expect(container.querySelectorAll("dt")).toHaveLength(2);
    expect(container.querySelectorAll("dd")).toHaveLength(2);
  });

  it("renders nothing inside the list when there are no items", () => {
    const { container } = render(<ReadoutList items={[]} layout="wrap" />);
    expect(container.querySelectorAll("dt")).toHaveLength(0);
  });
});
