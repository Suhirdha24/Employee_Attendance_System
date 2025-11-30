import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../api/api';

// Load user from localStorage (if exists)
const initUser = JSON.parse(localStorage.getItem('user') || 'null');

// ----------------------
// LOGIN
// ----------------------
export const login = createAsyncThunk(
  'auth/login',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await API.post('/auth/login', payload);
      return res.data;   // contains { user }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  }
);

// ----------------------
// REGISTER
// ----------------------
export const register = createAsyncThunk(
  'auth/register',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await API.post('/auth/register', payload);
      return res.data;  // contains { user }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Register failed');
    }
  }
);

// ----------------------
// AUTH SLICE
// ----------------------
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: initUser,
    loading: false,
    error: null,
  },

  reducers: {
    logout(state) {
      state.user = null;

      // Delete user from localStorage
      localStorage.removeItem('user');

      // Redirect user to Home Page after logout
      window.location.href = "/";
    }
  },

  extraReducers: (builder) => {
    builder
      // LOGIN CASES
      .addCase(login.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(login.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload.user;

        // store logged in user
        localStorage.setItem("user", JSON.stringify(a.payload.user));
      })
      .addCase(login.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      // REGISTER CASES
      .addCase(register.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(register.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload.user;

        // store new user
        localStorage.setItem("user", JSON.stringify(a.payload.user));
      })
      .addCase(register.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      });
  }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
