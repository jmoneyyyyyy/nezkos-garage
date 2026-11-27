import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import {
  HOW_IT_WORKS_LINK_TEXT,
  NEZKOS_GARAGE,
  SIGN_IN_BUTTON_TEXT,
  SIGN_OUT_BUTTON_TEXT,
  WELCOME_BACK_TEXT,
} from "../../Constants";
import AppLayout from "./AppLayout";

const mockUseAuth = vi.fn();
vi.mock("../../hooks/useAuth", () => ({ useAuth: () => mockUseAuth() }));

const signIn = vi.fn();
const signOut = vi.fn();
const signedIn = { user: { displayName: "Justin", email: "j@example.com" }, loading: false, signIn, signOut };
const signedOut = { user: null, loading: false, signIn, signOut };

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<p>landing</p>} />
          <Route path="/vehicles" element={<p>vehicles</p>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );

describe("AppLayout", () => {
  beforeEach(() => {
    signIn.mockClear();
    signOut.mockClear();
  });

  it("shows the brand and the matched page", () => {
    mockUseAuth.mockReturnValue(signedOut);
    renderAt("/");
    expect(screen.getByText(NEZKOS_GARAGE)).toBeInTheDocument();
    expect(screen.getByText("landing")).toBeInTheDocument();
  });

  it("signed in: shows the welcome, the tabs and a working sign-out button", async () => {
    mockUseAuth.mockReturnValue(signedIn);
    renderAt("/vehicles");
    expect(screen.getByText(`${WELCOME_BACK_TEXT} Justin`)).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Main" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: SIGN_OUT_BUTTON_TEXT }));
    expect(signOut).toHaveBeenCalledOnce();
    expect(screen.queryByRole("button", { name: SIGN_IN_BUTTON_TEXT })).not.toBeInTheDocument();
  });

  it("falls back to the email when there is no display name", () => {
    mockUseAuth.mockReturnValue({ ...signedIn, user: { displayName: null, email: "j@example.com" } });
    renderAt("/vehicles");
    expect(screen.getByText(`${WELCOME_BACK_TEXT} j@example.com`)).toBeInTheDocument();
  });

  it("signed out: shows a working sign-in button and no tabs", async () => {
    mockUseAuth.mockReturnValue(signedOut);
    renderAt("/");
    await userEvent.click(screen.getByRole("button", { name: SIGN_IN_BUTTON_TEXT }));
    expect(signIn).toHaveBeenCalledOnce();
    expect(screen.queryByRole("navigation", { name: "Main" })).not.toBeInTheDocument();
  });

  it("shows the How it works link on the landing page only", () => {
    mockUseAuth.mockReturnValue(signedOut);
    const { unmount } = renderAt("/");
    expect(screen.getByRole("button", { name: HOW_IT_WORKS_LINK_TEXT })).toBeInTheDocument();
    unmount();
    renderAt("/vehicles");
    expect(screen.queryByRole("button", { name: HOW_IT_WORKS_LINK_TEXT })).not.toBeInTheDocument();
  });

  it("shows nothing auth-related while auth is loading", () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true, signIn, signOut });
    renderAt("/");
    expect(screen.queryByRole("button", { name: SIGN_IN_BUTTON_TEXT })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: SIGN_OUT_BUTTON_TEXT })).not.toBeInTheDocument();
  });
});
