import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/store";

const LoginForm = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setTrigger, setAuthStatus } = useAuthStore();
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await axios.post("/auth/login", {
        identifier,
        password,
      });
      if (data?.success) {
        localStorage.setItem("token", data.token);

        setTrigger((e) => !e);
        setAuthStatus("");

        navigate("/");
      }
    } catch (error) {
      setError(error.response.data.error || "Failed to login");
    }

    // Add your login logic here
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 shadow-md w-full md:w-1/2 lg:w-1/3">
        <h2 className="text-2xl font-semibold text-center mb-6">Login</h2>
        <form onSubmit={handleLogin}>
          <p className="p-2 text-red-600">{error ? error : null}</p>
          <div className="mb-4">
            <label
              htmlFor="identifier"
              className="block text-sm font-medium text-gray-700"
            >
              Email or Username
            </label>
            <input
              type="text"
              id="identifier"
              name="identifier"
              className="w-full mt-1 p-3 rounded-lg border border-gray-300 focus:ring focus:ring-blue-500 focus:ring-opacity-50 focus:border-blue-500 focus:outline-none"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="w-full mt-1 p-3 rounded-lg border border-gray-300 focus:ring focus:ring-blue-500 focus:ring-opacity-50 focus:border-blue-500 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <button
              type="submit"
              className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
            >
              Log In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
