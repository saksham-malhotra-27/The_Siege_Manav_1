import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/Login";
import { NavBar } from "./components/Nav";
import { useAuth } from "./context/authContext";
import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import { Footer } from "./components/Footer";

const App: React.FC = () => {
  const { isLoggedIn } = useAuth();

  return (
    <Router>
      {isLoggedIn && <NavBar />}{" "}
      {/* NavBar is conditionally rendered if logged in */}
      <Routes>
        {<Route path="/login" element={<Login />} />}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;

interface ProtectedRouteProps {
  element: JSX.Element;
  path: string;
}

const ProtectedRoute: React.FC = () => {
  const { isLoggedIn } = useAuth();

  return isLoggedIn ? <Outlet /> : <Navigate to="/login" />;
};
