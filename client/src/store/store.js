import { create } from "zustand";

const useAuthStore = create((set) => ({
  user: null, // Initialize with no authenticated user
  trigger: false,
  authStatus: "",
  setTrigger: (val) => set({ trigger: val }),
  setAuthStatus: (authStatus) => set({ authStatus }),

  // Function to set the authenticated user
  setUser: (user) => {
    set({ user });
  },

  // Function to clear the authenticated user (logout)
  clearUser: () => {
    set({ user: null });
  },
}));
const useSocketStore = create((set) => ({
  socket: null, // Initialize with no authenticated user
  trigger: false,
  setSocket: (socket) => set({ socket }),

  // Function to clear the authenticated user (logout)
  clearSocket: () => {
    set({ socket: null });
  },
}));

export { useAuthStore, useSocketStore };
