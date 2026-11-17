import { useAuth } from "./auth/useAuth";
import { GARAGE_LOG_TITLE, SIGN_OUT_BUTTON_TEXT } from "./Constants";
import "./App.css";
import Landing from "./landing/Landing";
import AddVehicleModal from "./vehicles/AddVehicleModal";
import VehicleList from "./vehicles/VehicleList";

function App() {
  const { user, loading, signIn, signOut } = useAuth();

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return <Landing onSignIn={signIn} />;
  }

  return (
    <div>
      <header className="app-header">
        <h1>{GARAGE_LOG_TITLE}</h1>
        <div className="app-header-user">
          <span>Welcome back: {user.displayName ?? user.email}</span>
          <button onClick={signOut}>{SIGN_OUT_BUTTON_TEXT}</button>
        </div>
      </header>
      <AddVehicleModal uid={user.uid} />
      <VehicleList uid={user.uid} />
    </div>
  );
}

export default App;