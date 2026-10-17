import { create } from "zustand";
import API from "../api/api";

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem("user") || "null"),
  token: localStorage.getItem("token") || null,
  loading: false,
  error: null,

  // Login
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await API.post("/auth/login", { email, password });
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      set({ user, token, loading: false });
      return { success: true, user };
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Login failed";
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  // Register
  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const res = await API.post("/auth/register", userData);
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      set({ user, token, loading: false });
      return { success: true, user };
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Registration failed";
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  // Fetch logged-in user profile
  fetchMe: async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await API.get("/auth/me");
      const user = res.data;
      localStorage.setItem("user", JSON.stringify(user));
      set({ user, token });
    } catch (err) {
      console.error("fetchMe error:", err);
      get().logout();
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ user: null, token: null, error: null });
  },

  // Set User
  setUser: (user) => {
    localStorage.setItem("user", JSON.stringify(user));
    set({ user });
  },
}));
