import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../api/api';

// Safe initial state extraction from localStorage
let initUser = null;
let initToken = null;
try {
  const rawUser = localStorage.getItem('user');
  if (rawUser && rawUser !== 'undefined' && rawUser !== 'null') {
    initUser = JSON.parse(rawUser);
  }
  initToken = localStorage.getItem('token') || null;
} catch (e) {
  console.warn('Invalid user state in localStorage, resetting:', e);
  try {
    localStorage.removeItem('user');
  } catch (_) {}
  initUser = null;
  initToken = null;
}

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
      try {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      } catch (e) {
        console.warn('Could not clear storage:', e);
      }
      const isSubpath = window.location.pathname.startsWith('/Employee_Attendance_System');
      window.location.href = isSubpath ? '/Employee_Attendance_System/login' : '/login';
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
        try {
          if (action.payload && action.payload.user) {
            localStorage.setItem('user', JSON.stringify(action.payload.user));
          }
          if (action.payload && action.payload.token) {
            localStorage.setItem('token', action.payload.token);
          }
        } catch (e) {
          console.warn('Could not persist session to localStorage:', e);
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
        try {
          if (action.payload && action.payload.user) {
            localStorage.setItem('user', JSON.stringify(action.payload.user));
          }
          if (action.payload && action.payload.token) {
            localStorage.setItem('token', action.payload.token);
          }
        } catch (e) {
          console.warn('Could not persist registration to localStorage:', e);
        }
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // GET ME
      .addCase(getMe.fulfilled, (state, action) => {
        state.user = action.payload.user;
        try {
          if (action.payload && action.payload.user) {
            localStorage.setItem('user', JSON.stringify(action.payload.user));
          }
        } catch (e) {
          console.warn('Could not refresh user in localStorage:', e);
        }
      })
      .addCase(getMe.rejected, (state) => {
        state.user = null;
        state.token = null;
        try {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        } catch (e) {
          console.warn('Could not clear token from localStorage:', e);
        }
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
