import axios from "axios";
import React, { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { useAuthStore } from "./store/store";
const getAuthToken = () => {
  const token = localStorage.getItem("token");
  return token ? `Bearer ${token}` : ""; // Return the token with "Bearer " prefix or an empty string if no token is available.
};
function App() {
  const { setUser, user, trigger } = useAuthStore();
  const [loading, setLoading] = React.useState(true);
  // Inside your useEffect
  useEffect(() => {
    const authenticateUser = async () => {
      try {
        // Get the JWT token from local storage
        const authToken = getAuthToken();

        // Set the Authorization header for this specific Axios request
        const config = {
          headers: {
            Authorization: authToken,
          },
        };

        const { data } = await axios.get("/auth/me", config);

        if (data) {
          setUser(data);
        }
      } catch (error) {
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };
    if (!user) {
      authenticateUser();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setUser, trigger]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Navbar />
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to={"/"} /> : <Login />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to={"/"} /> : <Register />}
        />
        <Route path="/" element={<Home />} />
      </Routes>
    </div>
  );
}

export default App;
