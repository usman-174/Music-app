import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import "./index.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import reportWebVitals from "./reportWebVitals";
axios.defaults.withCredentials = true;
axios.defaults.baseURL =
  process.env.REACT_APP_API || "http://localhost:5000/api";
const token = localStorage.getItem("token");

// Check if the token is available and not expired
if (token) {
  // Set the Authorization header with the token
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

const queryClient = new QueryClient({
  defaultOptions: {
    // queries: {
    refetchOnWindowFocus: false,
    //   refetchOnReconnect: true,
    //   retry: false,
    staleTime: 35000,
    // },
  },
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ToastContainer
        position="top-right"
        autoClose={1700}
        limit={2}
        hideProgressBar
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover={false}
        theme="light"
      />
      <Router>
        <App />
      </Router>
    </QueryClientProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
