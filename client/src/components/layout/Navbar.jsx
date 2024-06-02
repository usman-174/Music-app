import React, { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useAuthStore, useSocketStore } from "../../store/store";

const Navbar = () => {
  const { user, setUser, setTrigger } = useAuthStore();
  const { socket, clearSocket } = useSocketStore();

  const [searchParams, setSearchParams] = useSearchParams();
  const channelId = searchParams.get("channelId");

  const handleLogout = async () => {
    try {
      const { data } = await axios.post("/auth/logout");
      if (data.success) {
        localStorage.removeItem("token");
        searchParams.delete("adminId");
        searchParams.delete("channelId");
        setSearchParams(searchParams);

        if (socket) {
          socket.emit("leave", { user, channelId });
          socket.close();
          clearSocket();
        }

        setTrigger((x) => !x);
        setUser(null);
      }
    } catch (error) {
      // Handle error
    }
  };

  useEffect(() => {
    const beforeUnloadHandler = () => {
      searchParams.delete("adminId");
      searchParams.delete("channelId");
      setSearchParams(searchParams);

      if (socket) {
        socket.emit("leave", { user, channelId });
        socket.close();
        clearSocket();
      }
    };

    // Add an event listener for beforeunload
    window.addEventListener("beforeunload", beforeUnloadHandler);

    // Cleanup the event listener when the component unmounts
    return () => {
      window.removeEventListener("beforeunload", beforeUnloadHandler);
    };
  }, [user, channelId, searchParams, setSearchParams, socket, clearSocket]);

  return (
    <nav className="bg-blue-500 p-2 md:p-5 shadow-sm">
      <div className="mx-auto flex flex-col md:flex-row justify-between items-center">
        {/* Logo */}
        <div className="text-white text-2xl font-semibold">Channel-App</div>

        {/* User Actions */}
        <div className="flex items-center space-x-5 gap-10 justify-between md:justify-normal  mt-4 md:mt-0">
          {user ? ( // Show user-specific content if logged in
            <>
              <div className="block text-white font-semibold">
                Hi, {user.username}
              </div>
              <button
                onClick={handleLogout}
                className="block text-white hover:underline"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              {" "}
              {/* Show sign in/sign up buttons if not logged in */}
              <Link to={"/login"}>
                <button className="block bg-white text-blue-500 rounded-full py-2 px-6 text-sm font-semibold hover:bg-blue-200">
                  Sign In
                </button>
              </Link>
              <Link to={"/register"}>
                <button className="block bg-white text-blue-500 rounded-full py-2 px-6 text-sm font-semibold hover:bg-blue-200">
                  Sign Up
                </button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="sm:hidden text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
