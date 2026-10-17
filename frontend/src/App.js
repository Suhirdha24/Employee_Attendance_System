import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getMe } from "./features/authSlice";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import EmployeeHistory from "./pages/EmployeeHistory";
import EmployeeProfile from "./pages/EmployeeProfile";
import ManagerDashboard from "./pages/ManagerDashboard";
import ManagerCharts from "./pages/ManagerCharts";
import ForgetPassword from "./pages/ForgetPassword";
import ResetPassword from "./pages/ResetPassword";
import HomePage from "./pages/HomePage";
import Header from "./components/Header";
import { ToastProvider } from "./components/Toast";

// PRIVATE ROUTE HANDLER
function PrivateRoute({ children, roles }) {
  const auth = useSelector((s) => s.auth);

  if (!auth.user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(auth.user.role)) return <Navigate to="/" replace />;

  return children;
}

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(getMe());
    }
  }, [dispatch]);

  return (
    <ToastProvider>
      <BrowserRouter>
        <div className="app-wrapper">
          <Header />

          <main className="main-container">
            <Routes>
              {/* PUBLIC ROUTES */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forget-password" element={<ForgetPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* EMPLOYEE ROUTES */}
              <Route
                path="/employee"
                element={
                  <PrivateRoute roles={["employee"]}>
                    <EmployeeDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/employee/history"
                element={
                  <PrivateRoute roles={["employee"]}>
                    <EmployeeHistory />
                  </PrivateRoute>
                }
              />
              <Route
                path="/employee/profile"
                element={
                  <PrivateRoute roles={["employee"]}>
                    <EmployeeProfile />
                  </PrivateRoute>
                }
              />

              {/* MANAGER ROUTES */}
              <Route
                path="/manager"
                element={
                  <PrivateRoute roles={["manager"]}>
                    <ManagerDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/manager/charts"
                element={
                  <PrivateRoute roles={["manager"]}>
                    <ManagerCharts />
                  </PrivateRoute>
                }
              />

              {/* FALLBACK */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </ToastProvider>
  );
}
