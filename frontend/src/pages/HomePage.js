import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/HomePage.css";

export default function HomePage() {
  const nav = useNavigate();

  return (
    <div className="home-container">
      <div className="home-content">

        <h1 className="main-title">Employee Attendance System</h1>
        <p className="subtitle">
          Track attendance easily — For Employees and Managers
        </p>

        <div className="cards-container">

          {/* Employee Card */}
          <div className="role-card">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
              alt="Employee"
            />
            <h2>Employee</h2>
            <p>Login or Register to mark attendance.</p>
            <button onClick={() => nav("/login")}>Continue</button>
          </div>

          {/* Manager Card */}
          <div className="role-card">
            <img
              src="https://cdn-icons-png.flaticon.com/512/1053/1053210.png"
              alt="Manager"
            />
            <h2>Manager</h2>
            <p>Access reports, daily logs, and analysis.</p>
            <button onClick={() => nav("/login")}>Continue</button>
          </div>

        </div>

      </div>
    </div>
  );
}
