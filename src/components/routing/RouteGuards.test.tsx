import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { LOADING_TEXT } from "../../Constants";
import { RedirectIfAuthed, RequireAuth } from "./RouteGuards";

const mockUseAuth = vi.fn();
vi.mock("../../hooks/useAuth", () => ({ useAuth: () => mockUseAuth() }));

const signedIn = { user: { uid: "u1" }, loading: false };
const signedOut = { user: null, loading: false };
const loading = { user: null, loading: true };

function renderAt(path: string, guard: React.ReactElement) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={guard}>
          <Route path="/protected" element={<p>inside</p>} />
        </Route>
        <Route path="/" element={<p>landing</p>} />
        <Route path="/vehicles" element={<p>vehicles</p>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("RequireAuth", () => {
  it("shows loading text while auth resolves", () => {
    mockUseAuth.mockReturnValue(loading);
    renderAt("/protected", <RequireAuth />);
    expect(screen.getByText(LOADING_TEXT)).toBeInTheDocument();
  });

  it("redirects signed-out users to the landing page", () => {
    mockUseAuth.mockReturnValue(signedOut);
    renderAt("/protected", <RequireAuth />);
    expect(screen.getByText("landing")).toBeInTheDocument();
  });

  it("renders the page for signed-in users", () => {
    mockUseAuth.mockReturnValue(signedIn);
    renderAt("/protected", <RequireAuth />);
    expect(screen.getByText("inside")).toBeInTheDocument();
  });
});

describe("RedirectIfAuthed", () => {
  it("shows loading text while auth resolves", () => {
    mockUseAuth.mockReturnValue(loading);
    renderAt("/protected", <RedirectIfAuthed />);
    expect(screen.getByText(LOADING_TEXT)).toBeInTheDocument();
  });

  it("sends signed-in users to /vehicles", () => {
    mockUseAuth.mockReturnValue(signedIn);
    renderAt("/protected", <RedirectIfAuthed />);
    expect(screen.getByText("vehicles")).toBeInTheDocument();
  });

  it("renders the page for signed-out users", () => {
    mockUseAuth.mockReturnValue(signedOut);
    renderAt("/protected", <RedirectIfAuthed />);
    expect(screen.getByText("inside")).toBeInTheDocument();
  });
});
