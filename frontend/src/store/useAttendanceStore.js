import { create } from "zustand";
import API from "../api/api";

export const useAttendanceStore = create((set, get) => ({
  todayStatus: null,
  summary: null,
  history: [],
  loading: false,
  actionLoading: false,
  error: null,

  fetchToday: async () => {
    try {
      const res = await API.get("/attendance/today");
      set({ todayStatus: res.data });
      return res.data;
    } catch (err) {
      console.error("fetchToday error:", err);
    }
  },

  fetchSummary: async () => {
    try {
      const res = await API.get("/attendance/my-summary");
      set({ summary: res.data });
      return res.data;
    } catch (err) {
      console.error("fetchSummary error:", err);
    }
  },

  fetchHistory: async () => {
    set({ loading: true });
    try {
      const res = await API.get("/attendance/my-history");
      set({ history: res.data, loading: false });
      return res.data;
    } catch (err) {
      console.error("fetchHistory error:", err);
      set({ loading: false });
    }
  },

  checkIn: async () => {
    set({ actionLoading: true, error: null });
    try {
      const res = await API.post("/attendance/checkin");
      await get().fetchToday();
      await get().fetchSummary();
      set({ actionLoading: false });
      return { success: true, message: res.data?.message || "Checked in successfully!" };
    } catch (err) {
      const msg = err.response?.data?.message || "Check-in failed";
      set({ actionLoading: false, error: msg });
      return { success: false, error: msg };
    }
  },

  checkOut: async () => {
    set({ actionLoading: true, error: null });
    try {
      const res = await API.post("/attendance/checkout");
      await get().fetchToday();
      await get().fetchSummary();
      set({ actionLoading: false });
      return { success: true, message: res.data?.message || "Checked out successfully!" };
    } catch (err) {
      const msg = err.response?.data?.message || "Check-out failed";
      set({ actionLoading: false, error: msg });
      return { success: false, error: msg };
    }
  },
}));
