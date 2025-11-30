import React, { useState } from "react";
import { useSelector } from "react-redux";
import "../styles/EmployeeDashboard.css";
import EmployeeProfile from "./EmployeeProfile";
import EmployeeHistory from "./EmployeeHistory";

export default function EmployeeDashboard() {
  const auth = useSelector((s) => s.auth);
  const [page, setPage] = useState("profile"); // default page

  return (
    <div className="employee-wrapper">

      {/* ---------- SIDEBAR ---------- */}
      <aside className="sidebar">
        <h2 className="logo">👤 Employee</h2>
        <p className="user-name">{auth?.user?.name}</p>

        <nav className="menu">
          <button 
            className={page === "profile" ? "active" : ""}
            onClick={() => setPage("profile")}
          >
            🧑 Profile
          </button>

          <button 
            className={page === "history" ? "active" : ""}
            onClick={() => setPage("history")}
          >
            📅 Attendance History
          </button>
        </nav>
      </aside>

      {/* ---------- MAIN CONTENT ---------- */}
      <main className="main-content">
        {page === "profile" && <EmployeeProfile />}
        {page === "history" && <EmployeeHistory />}
      </main>
    </div>
  );
}
