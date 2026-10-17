import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../api/api';

// Initial state from localStorage
const initUser = JSON.parse(localStorage.getItem('user') || 'null');
const initToken = localStorage.getItem('token') || null;

// ----------------------
// LOGIN
// ----------------------
export const login = createAsyncThunk(
  'auth/login',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await API.post('/auth/login', payload);
      return res.data; // contains { message, token, user }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Login failed. Please check credentials.');
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
      return res.data; // contains { message, token, user }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Registration failed.');
    }
  }
);

// ----------------------
// VERIFY / LOAD CURRENT USER
// ----------------------
export const getMe = createAsyncThunk(
  'auth/getMe',
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get('/auth/me');
      return res.data; // contains { user }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to authenticate');
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
    token: initToken,
    loading: false,
    error: null,
  },

  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.error = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      window.location.href = '/login';
    },
    clearError(state) {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        if (action.payload.user) {
          localStorage.setItem('user', JSON.stringify(action.payload.user));
        }
        if (action.payload.token) {
          localStorage.setItem('token', action.payload.token);
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // REGISTER
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        if (action.payload.user) {
          localStorage.setItem('user', JSON.stringify(action.payload.user));
        }
        if (action.payload.token) {
          localStorage.setItem('token', action.payload.token);
        }
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // GET ME
      .addCase(getMe.fulfilled, (state, action) => {
        state.user = action.payload.user;
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(getMe.rejected, (state) => {
        state.user = null;
        state.token = null;
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
