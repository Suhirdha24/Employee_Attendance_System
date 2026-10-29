import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../features/authSlice";

export default function Header() {
  const auth = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;
  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="navbar">
      <div className="nav-container">
        {/* ZONE 1: CORPORATE BRAND LOGO */}
        <Link to="/" className="brand-logo" title="StaffTrack HRMS Home" onClick={closeMenu}>
          <div className="brand-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
          </div>
          <div className="brand-text">
            <span className="brand-title">StaffTrack HRMS</span>
            <span className="brand-sub">Workforce Attendance Management</span>
          </div>
        </Link>

        {/* MOBILE HAMBURGER BUTTON */}
        <button
          className="nav-toggle-btn"
          aria-label="Toggle navigation menu"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {mobileMenuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </>
            ) : (
              <>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </>
            )}
          </svg>
        </button>

        {/* ZONE 2: NAVIGATION MENU LINKS */}
        <nav className={`nav-menu ${mobileMenuOpen ? "open" : ""}`}>
          <Link to="/" className={`nav-link ${isActive("/") ? "active" : ""}`} onClick={closeMenu}>
            Home
          </Link>

          {/* EMPLOYEE NAVIGATION */}
          {auth.user && auth.user.role === "employee" && (
            <>
              <Link
                to="/employee"
                className={`nav-link ${isActive("/employee") ? "active" : ""}`}
                onClick={closeMenu}
              >
                Dashboard
              </Link>
              <Link
                to="/employee/mark-attendance"
                className={`nav-link ${
                  isActive("/employee/mark-attendance") ? "active" : ""
                }`}
                onClick={closeMenu}
              >
                Mark Attendance
              </Link>
              <Link
                to="/employee/history"
                className={`nav-link ${
                  isActive("/employee/history") ? "active" : ""
                }`}
                onClick={closeMenu}
              >
                History
              </Link>
              <Link
                to="/employee/profile"
                className={`nav-link ${
                  isActive("/employee/profile") ? "active" : ""
                }`}
                onClick={closeMenu}
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
                onClick={closeMenu}
              >
                Dashboard
              </Link>
              <Link
                to="/manager/all-attendance"
                className={`nav-link ${
                  isActive("/manager/all-attendance") ? "active" : ""
                }`}
                onClick={closeMenu}
              >
                All Attendance
              </Link>
              <Link
                to="/manager/calendar"
                className={`nav-link ${
                  isActive("/manager/calendar") ? "active" : ""
                }`}
                onClick={closeMenu}
              >
                Team Calendar
              </Link>
              <Link
                to="/manager/reports"
                className={`nav-link ${
                  isActive("/manager/reports") ? "active" : ""
                }`}
                onClick={closeMenu}
              >
                Reports
              </Link>
              <Link
                to="/manager/charts"
                className={`nav-link ${
                  isActive("/manager/charts") ? "active" : ""
                }`}
                onClick={closeMenu}
              >
                Analytics
              </Link>
            </>
          )}
        </nav>

        {/* ZONE 3: ACTIONS & USER PROFILE */}
        <div className="nav-actions">
          {!auth.user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Link
                to="/login"
                className={`nav-link ${isActive("/login") ? "active" : ""}`}
                onClick={closeMenu}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className={`btn btn-primary btn-sm ${
                  isActive("/register") ? "active" : ""
                }`}
                onClick={closeMenu}
              >
                Register
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div className="user-badge">
                <div className="user-avatar-mini">
                  {auth.user.name ? auth.user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <span style={{ fontWeight: 600, color: "var(--text-main)" }}>
                  {auth.user.name}
                </span>
                <span className={`role-pill ${auth.user.role}`}>
                  {auth.user.role}
                </span>
              </div>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => {
                  closeMenu();
                  dispatch(logout());
                }}
                style={{ padding: "6px 14px", fontWeight: 600 }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
