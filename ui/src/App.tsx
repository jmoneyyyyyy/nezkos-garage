import { RouterProvider } from "react-router-dom";
import AuthProvider from "./context/AuthProvider";
import "./styles/App.css";
import { router } from "./routes";

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
