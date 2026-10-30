import { create } from "zustand";
import API from "../api/api";

// Safe initial state extraction
let initUser = null;
let initToken = null;
try {
  const rawUser = localStorage.getItem("user");
  if (rawUser && rawUser !== "undefined" && rawUser !== "null") {
    initUser = JSON.parse(rawUser);
  }
  initToken = localStorage.getItem("token") || null;
} catch (e) {
  initUser = null;
  initToken = null;
}

export const useAuthStore = create((set, get) => ({
  user: initUser,
  token: initToken,
  loading: false,
  error: null,

  // Login
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await API.post("/auth/login", { email, password });
      const { token, user } = res.data;
      try {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
      } catch (e) {}
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
      try {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
      } catch (e) {}
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
      try {
        localStorage.setItem("user", JSON.stringify(user));
      } catch (e) {}
      set({ user });
    } catch (err) {
      get().logout();
    }
  },

  // Logout
  logout: () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch (e) {}
    set({ user: null, token: null });
    const isSubpath = window.location.pathname.startsWith('/Employee_Attendance_System');
    window.location.href = isSubpath ? '/Employee_Attendance_System/login' : '/login';
  },

  clearError: () => set({ error: null }),
}));
