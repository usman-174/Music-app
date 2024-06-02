import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import HomeSection from "../components/layout/HomeSection";
import { useAuthStore, useSocketStore } from "../store/store";
import { io } from "socket.io-client";

const Home = () => {
  const { user, trigger } = useAuthStore();
  const { setSocket } = useSocketStore();

  useEffect(() => {
    if (user) {
      const socketInstance = io(
        process.env.REACT_APP_API.split("/api")[0] ||
          "https://channels-app-backend.onrender.com/"
      );

      socketInstance.on("connect", () => {
        console.log("Connected to server");
        setSocket(socketInstance);
      });

      return () => {
        if (socketInstance) {
          socketInstance.disconnect();
        }
      };
    }
    // eslint-disable-next-line
  }, [trigger, user]);

  return !user ? (
    <div className="bg-blue-400 text-white min-h-screen flex items-center">
      <div className="container mx-auto text-center">
        <h1 className="text-4xl font-semibold">Sign in to use the app</h1>
        <p className="text-lg mt-4">
          Explore all the amazing features of our app.
        </p>
        <Link
          to="/login"
          className="inline-block mt-6 bg-white text-blue-500 font-semibold py-2 px-6 rounded-full hover:bg-blue-100 transition duration-300"
        >
          Sign In
        </Link>
      </div>
    </div>
  ) : (
    <>
      <HomeSection />
    </>
  );
};

export default Home;
