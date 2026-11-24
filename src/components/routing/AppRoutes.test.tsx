import { render, screen } from "@testing-library/react";
import { MemoryRouter, Outlet } from "react-router-dom";
import AppRoutes from "./AppRoutes";

const mockUseAuth = vi.fn();
vi.mock("../../hooks/useAuth", () => ({ useAuth: () => mockUseAuth() }));

// Stub the pages and layout so these tests only exercise routing.
vi.mock("../layout/AppLayout", () => ({ default: () => <Outlet /> }));
vi.mock("../landing/LandingPage", () => ({ default: () => <p>landing page</p> }));
vi.mock("../vehicles/VehiclesPage", () => ({ default: () => <p>vehicles page</p> }));
vi.mock("../funds/FundsPage", () => ({ default: () => <p>funds page</p> }));
vi.mock("../wishlist/WishListPage", () => ({ default: () => <p>wishlist page</p> }));

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>
  );

describe("AppRoutes", () => {
  describe("signed out", () => {
    beforeEach(() => mockUseAuth.mockReturnValue({ user: null, loading: false }));

    it("shows the landing page at /", () => {
      renderAt("/");
      expect(screen.getByText("landing page")).toBeInTheDocument();
    });

    it.each(["/vehicles", "/funds", "/wishlist"])("redirects %s to the landing page", (path) => {
      renderAt(path);
      expect(screen.getByText("landing page")).toBeInTheDocument();
    });

    it("redirects unknown paths to the landing page", () => {
      renderAt("/nope");
      expect(screen.getByText("landing page")).toBeInTheDocument();
    });
  });

  describe("signed in", () => {
    beforeEach(() => mockUseAuth.mockReturnValue({ user: { uid: "u1" }, loading: false }));

    it("redirects / to the vehicles page", () => {
      renderAt("/");
      expect(screen.getByText("vehicles page")).toBeInTheDocument();
    });

    it.each([
      ["/funds", "funds page"],
      ["/wishlist", "wishlist page"],
    ])("renders %s", (path, text) => {
      renderAt(path);
      expect(screen.getByText(text)).toBeInTheDocument();
    });
  });
});
