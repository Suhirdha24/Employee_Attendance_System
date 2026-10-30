import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getMe } from "./features/authSlice";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import MarkAttendance from "./pages/MarkAttendance";
import EmployeeHistory from "./pages/EmployeeHistory";
import EmployeeProfile from "./pages/EmployeeProfile";
import ManagerDashboard from "./pages/ManagerDashboard";
import AllEmployeesAttendance from "./pages/AllEmployeesAttendance";
import TeamCalendarView from "./pages/TeamCalendarView";
import ReportsPage from "./pages/ReportsPage";
import ManagerCharts from "./pages/ManagerCharts";
import ForgetPassword from "./pages/ForgetPassword";
import ResetPassword from "./pages/ResetPassword";
import HomePage from "./pages/HomePage";
import Header from "./components/Header";
import { ToastProvider } from "./components/Toast";

// PRIVATE ROUTE HANDLER WITH ROLE-BASED ACCESS CONTROL
function PrivateRoute({ children, roles }) {
  const auth = useSelector((s) => s.auth);

  if (!auth.user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(auth.user.role)) return <Navigate to="/" replace />;

  return children;
}

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        dispatch(getMe());
      }
    } catch (e) {
      console.warn("Could not retrieve authentication token from storage:", e);
    }
  }, [dispatch]);

  // Compute basename dynamically for root hosting (Vercel, Netlify) or subdirectory hosting (GitHub Pages)
  const basename =
    process.env.PUBLIC_URL ||
    (typeof window !== "undefined" && window.location.pathname.startsWith("/Employee_Attendance_System")
      ? "/Employee_Attendance_System"
      : "");

  return (
    <ToastProvider>
      <BrowserRouter basename={basename}>
        <div className="app-wrapper">
          <Header />

          <main className="main-container">
            <Routes>
              {/* PUBLIC ACCESSIBLE ROUTES */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forget-password" element={<ForgetPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* EMPLOYEE WORKSTATION ROUTES */}
              <Route
                path="/employee"
                element={
                  <PrivateRoute roles={["employee"]}>
                    <EmployeeDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/employee/mark-attendance"
                element={
                  <PrivateRoute roles={["employee"]}>
                    <MarkAttendance />
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

              {/* MANAGER OPERATIONS ROUTES */}
              <Route
                path="/manager"
                element={
                  <PrivateRoute roles={["manager"]}>
                    <ManagerDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/manager/all-attendance"
                element={
                  <PrivateRoute roles={["manager"]}>
                    <AllEmployeesAttendance />
                  </PrivateRoute>
                }
              />
              <Route
                path="/manager/calendar"
                element={
                  <PrivateRoute roles={["manager"]}>
                    <TeamCalendarView />
                  </PrivateRoute>
                }
              />
              <Route
                path="/manager/reports"
                element={
                  <PrivateRoute roles={["manager"]}>
                    <ReportsPage />
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

              {/* FALLBACK REDIRECT TO HOME */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </ToastProvider>
  );
}
