import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import FormTextField from "./FormTextField";

function Controlled(props: Partial<Parameters<typeof FormTextField>[0]>) {
  const [value, setValue] = useState("");
  return <FormTextField label="Name *" value={value} onChange={(e) => setValue(e.target.value)} {...props} />;
}

describe("FormTextField", () => {
  it("is found by its exact label text and is editable", async () => {
    render(<Controlled />);
    const input = screen.getByLabelText("Name *");
    await userEvent.type(input, "Nezko");
    expect(input).toHaveValue("Nezko");
  });

  it("sets aria-required but not the native required", () => {
    render(<Controlled required />);
    const input = screen.getByLabelText("Name *");
    expect(input).toHaveAttribute("aria-required", "true");
    expect(input).not.toHaveAttribute("required");
  });

  it("omits aria-required when not required", () => {
    render(<Controlled />);
    expect(screen.getByLabelText("Name *")).not.toHaveAttribute("aria-required");
  });

  it("passes inputMode and keeps the input a text field", () => {
    render(<Controlled inputMode="decimal" />);
    const input = screen.getByLabelText("Name *");
    expect(input).toHaveAttribute("inputmode", "decimal");
    expect(input).toHaveAttribute("type", "text");
  });

  it("renders a native select with its options", async () => {
    const onChange = vi.fn();
    render(
      <FormTextField label="Service" value="a" onChange={onChange} select>
        <option value="a">A</option>
        <option value="b">B</option>
      </FormTextField>
    );
    const select = screen.getByLabelText("Service");
    expect(select.tagName).toBe("SELECT");
    await userEvent.selectOptions(select, "b");
    expect(onChange).toHaveBeenCalled();
  });

  it("renders a textarea when multiline", () => {
    render(<Controlled multiline minRows={3} placeholder="Notes" />);
    expect(screen.getByLabelText("Name *").tagName).toBe("TEXTAREA");
    expect(screen.getByPlaceholderText("Notes")).toBeInTheDocument();
  });

  it("renders a date input", () => {
    render(<Controlled type="date" />);
    expect(screen.getByLabelText("Name *")).toHaveAttribute("type", "date");
  });
});
