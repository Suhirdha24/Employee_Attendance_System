import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout, login } from "../features/authSlice";

export default function Header() {
  const auth = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;
  const closeMenu = () => setMobileMenuOpen(false);

  const handleQuickSwitch = async (targetRole) => {
    closeMenu();
    if (targetRole === "manager") {
      await dispatch(login({ email: "manager@company.com", password: "manager123" }));
      navigate("/manager");
    } else {
      await dispatch(login({ email: "alex@company.com", password: "password123" }));
      navigate("/employee");
    }
  };

  return (
    <header className="navbar">
      <div className="nav-container">
        {/* BRAND LOGO */}
        <Link to="/" className="brand-logo" title="StaffTrack Home" onClick={closeMenu}>
          <div className="brand-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
          </div>
          <div className="brand-text">
            <span className="brand-title">StaffTrack</span>
            <span className="brand-sub">Attendance System</span>
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
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => handleQuickSwitch("employee")}
                style={{ background: "#eef2ff", color: "#4338ca", border: "1px solid #c7d2fe", fontSize: "12px", fontWeight: 700 }}
                title="Preview Employee Portal with Alex's account"
              >
                👨‍💼 Try Employee
              </button>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => handleQuickSwitch("manager")}
                style={{ background: "#fdf4ff", color: "#7e22ce", border: "1px solid #f0abfc", fontSize: "12px", fontWeight: 700 }}
                title="Preview Manager Portal with Eleanor's account"
              >
                👩‍💼 Try Manager
              </button>
              <Link
                to="/login"
                className={`nav-link ${isActive("/login") ? "active" : ""}`}
                onClick={closeMenu}
              >
                Sign In
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => handleQuickSwitch(auth.user.role === "manager" ? "employee" : "manager")}
                style={{
                  fontSize: "12px",
                  padding: "5px 10px",
                  fontWeight: 600,
                  background: "var(--bg-surface)",
                  borderColor: "var(--border-medium)",
                }}
                title={auth.user.role === "manager" ? "Switch to Employee View" : "Switch to Manager View"}
              >
                ⇄ {auth.user.role === "manager" ? "Employee View" : "Manager View"}
              </button>

              <div className="user-badge">
                <div className="user-avatar-mini">
                  {auth.user.name ? auth.user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <span style={{ fontWeight: 600, color: "var(--text-main)" }}>
                  {auth.user.name.split(" ")[0]}
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
                style={{ padding: "6px 12px", fontWeight: 600 }}
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
