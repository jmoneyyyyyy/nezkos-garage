import { useAuth } from "./auth/useAuth";

function App() {
  const { user, loading, signIn, signOut } = useAuth();

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return (
      <div>
        <h1>Garage Log</h1>
        <button onClick={signIn}>Sign in with Google</button>
      </div>
    );
  }

  return (
    <div>
      <header>
        <h1>Garage Log</h1>
        <span>{user.displayName ?? user.email}</span>
        <button onClick={signOut}>Sign out</button>
      </header>
    </div>
  );
}

export default App;