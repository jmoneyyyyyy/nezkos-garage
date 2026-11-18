import { useAuth } from "./auth/useAuth";
import { GARAGE_LOG_TITLE, LOADING_TEXT, SIGN_OUT_BUTTON_TEXT, WELCOME_BACK_TEXT } from "./Constants";
import "./App.css";
import Header from "./components/Header";
import Landing from "./landing/Landing";
import AddVehicleModal from "./vehicles/AddVehicleModal";
import VehicleList from "./vehicles/VehicleList";

function App() {
  const { user, loading, signIn, signOut } = useAuth();

  if (loading) {
    return <p>{LOADING_TEXT}</p>;
  }

  if (!user) {
    return <Landing onSignIn={signIn} />;
  }

  return (
    <div>
      <Header>
        <span className="site-header-user">{WELCOME_BACK_TEXT} {user.displayName ?? user.email}</span>
        <button onClick={signOut}>{SIGN_OUT_BUTTON_TEXT}</button>
      </Header>
      <h1 className="page-title">{GARAGE_LOG_TITLE}</h1>
      <AddVehicleModal uid={user.uid} />
      <VehicleList uid={user.uid} />
    </div>
  );
}

export default App;