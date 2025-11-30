import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import ForgetPassword from "./pages/ForgetPassword";
import ResetPassword from "./pages/ResetPassword";
import HomePage from "./pages/HomePage";
import Header from "./components/Header";
import ManagerCharts from "./pages/ManagerCharts";

// PRIVATE ROUTE HANDLER
function PrivateRoute({ children, roles }) {
  const auth = useSelector((s) => s.auth);

  if (!auth.user) return <Navigate to="/login" />;
  if (roles && !roles.includes(auth.user.role)) return <Navigate to="/" />;

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Header />

      <div className="container">
        <Routes>
          {/* HOME PAGE (DEFAULT PAGE) */}
          <Route path="/" element={<HomePage />} />

          {/* AUTH ROUTES */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forget-password" element={<ForgetPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* EMPLOYEE DASHBOARD */}
          <Route
            path="/employee"
            element={
              <PrivateRoute roles={["employee"]}>
                <EmployeeDashboard />
              </PrivateRoute>
            }
          />

          {/* MANAGER DASHBOARD */}
          <Route
            path="/manager"
            element={
              <PrivateRoute roles={["manager"]}>
                <ManagerDashboard />
              </PrivateRoute>
            }
          />

          {/* MANAGER CHARTS PAGE */}
          <Route
            path="/manager/charts"
            element={
              <PrivateRoute roles={["manager"]}>
                <ManagerCharts />
              </PrivateRoute>
            }
          />

          {/* FALLBACK → HOME */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
