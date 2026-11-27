import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CHANGE_BUTTON_TEXT, PHOTO_READ_ERROR, REMOVE_BUTTON_TEXT } from "../../Constants";
import { photoFromInput } from "../../utils/photoUpload";
import PhotoPicker from "./PhotoPicker";

vi.mock("../../utils/photoUpload", () => ({ photoFromInput: vi.fn() }));

const setup = (props: Partial<Parameters<typeof PhotoPicker>[0]> = {}) => {
  const onChange = vi.fn();
  const { container } = render(<PhotoPicker alt="Car" emptyLabel="Add photo" onChange={onChange} {...props} />);
  const fileInput = container.querySelector<HTMLInputElement>('input[type="file"]')!;
  return { onChange, fileInput };
};

const file = new File(["x"], "car.png", { type: "image/png" });

describe("PhotoPicker", () => {
  it("shows the add button when there is no photo", () => {
    setup();
    expect(screen.getByRole("button", { name: "Add photo" })).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("passes the chosen photo to onChange", async () => {
    vi.mocked(photoFromInput).mockResolvedValue("data:image/jpeg;base64,abc");
    const { onChange, fileInput } = setup();
    await userEvent.upload(fileInput, file);
    await waitFor(() => expect(onChange).toHaveBeenCalledWith("data:image/jpeg;base64,abc"));
  });

  it("shows Change and Remove with a photo, and Remove passes null", async () => {
    const { onChange } = setup({ photo: "data:image/jpeg;base64,abc" });
    expect(screen.getByRole("img", { name: "Car" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: CHANGE_BUTTON_TEXT })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: REMOVE_BUTTON_TEXT }));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("shows an alert when the image can't be read", async () => {
    vi.mocked(photoFromInput).mockImplementation(async () => {
      throw new Error("nope");
    });
    const { onChange, fileInput } = setup();
    await userEvent.upload(fileInput, file);
    expect(await screen.findByRole("alert")).toHaveTextContent(PHOTO_READ_ERROR);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("disables the buttons when disabled", () => {
    setup({ disabled: true });
    expect(screen.getByRole("button", { name: "Add photo" })).toBeDisabled();
  });

  it("does not submit a surrounding form", async () => {
    const onSubmit = vi.fn((e) => e.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <PhotoPicker alt="Car" emptyLabel="Add photo" onChange={vi.fn()} />
      </form>
    );
    await userEvent.click(screen.getByRole("button", { name: "Add photo" }));
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
