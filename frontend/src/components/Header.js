import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../features/authSlice";

export default function Header() {
  const auth = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="navbar">
      <div className="nav-container">
        {/* BRAND LOGO */}
        <Link to="/" className="brand-logo">
          <div className="brand-icon">⚡</div>
          <span>NexTrack</span>
        </Link>

        {/* NAVIGATION LINKS */}
        <nav className="nav-links">
          <Link to="/" className={`nav-link ${isActive("/") ? "active" : ""}`}>
            Home
          </Link>

          {!auth.user && (
            <>
              <Link
                to="/login"
                className={`nav-link ${isActive("/login") ? "active" : ""}`}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className={`btn btn-primary btn-sm ${
                  isActive("/register") ? "active" : ""
                }`}
              >
                Register
              </Link>
            </>
          )}

          {/* EMPLOYEE NAVIGATION */}
          {auth.user && auth.user.role === "employee" && (
            <>
              <Link
                to="/employee"
                className={`nav-link ${isActive("/employee") ? "active" : ""}`}
              >
                Dashboard
              </Link>
              <Link
                to="/employee/mark-attendance"
                className={`nav-link ${
                  isActive("/employee/mark-attendance") ? "active" : ""
                }`}
              >
                Mark Attendance
              </Link>
              <Link
                to="/employee/history"
                className={`nav-link ${
                  isActive("/employee/history") ? "active" : ""
                }`}
              >
                History
              </Link>
              <Link
                to="/employee/profile"
                className={`nav-link ${
                  isActive("/employee/profile") ? "active" : ""
                }`}
              >
                Profile
              </Link>
            </>
          )}

          {/* MANAGER NAVIGATION */}
          {auth.user && auth.user.role === "manager" && (
            <>
              <Link
                to="/manager"
                className={`nav-link ${isActive("/manager") ? "active" : ""}`}
              >
                Dashboard
              </Link>
              <Link
                to="/manager/all-attendance"
                className={`nav-link ${
                  isActive("/manager/all-attendance") ? "active" : ""
                }`}
              >
                All Attendance
              </Link>
              <Link
                to="/manager/calendar"
                className={`nav-link ${
                  isActive("/manager/calendar") ? "active" : ""
                }`}
              >
                Team Calendar
              </Link>
              <Link
                to="/manager/reports"
                className={`nav-link ${
                  isActive("/manager/reports") ? "active" : ""
                }`}
              >
                Reports
              </Link>
              <Link
                to="/manager/charts"
                className={`nav-link ${
                  isActive("/manager/charts") ? "active" : ""
                }`}
              >
                Analytics
              </Link>
            </>
          )}

          {/* USER INFO & LOGOUT */}
          {auth.user && (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div className="user-badge">
                <span style={{ fontWeight: 600 }}>{auth.user.name}</span>
                <span className={`role-pill ${auth.user.role}`}>
                  {auth.user.role}
                </span>
              </div>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => dispatch(logout())}
              >
                Logout
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
