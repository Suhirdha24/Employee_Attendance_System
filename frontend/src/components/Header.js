import React from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../features/authSlice";
import "../styles/Header.css";

export default function Header() {
  const auth = useSelector((s) => s.auth);
  const dispatch = useDispatch();

  return (
    <header className="navbar">
      <div className="nav-container">

        {/* LOGO */}
        <h2 className="logo">Attendance Tracker</h2>

        <nav className="nav-links">
          <Link to="/" className="nav-item">Home</Link>

          {!auth.user && (
            <>
              <Link to="/login" className="nav-item">Login</Link>
              <Link to="/register" className="nav-item">Register</Link>
            </>
          )}

          {auth.user && auth.user.role === "employee" && (
            <Link to="/employee" className="nav-item">Employee Dashboard</Link>
          )}

          {auth.user && auth.user.role === "manager" && (
            <Link to="/manager" className="nav-item">Manager Dashboard</Link>
          )}

          {auth.user && (
            <button className="logout-btn" onClick={() => dispatch(logout())}>
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
