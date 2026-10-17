import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import API from "../api/api";
import { Link } from "react-router-dom";

export default function EmployeeProfile() {
  const { user } = useSelector((s) => s.auth);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    API.get("/attendance/my-summary")
      .then((res) => setSummary(res.data))
      .catch((err) => console.log(err));
  }, []);

  return (
    <div style={{ maxWidth: "680px", margin: "40px auto", padding: "0 16px" }}>
      <div className="card glass-card">
        {/* PROFILE HEADER WITH AVATAR */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "28px" }}>
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "20px",
              background: "var(--primary-gradient)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              fontWeight: 800,
              color: "#fff",
              boxShadow: "var(--glow-primary)",
            }}
          >
            {user?.name?.charAt(0) || "U"}
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h1 style={{ fontSize: "24px" }}>{user?.name}</h1>
              <span className={`role-pill ${user?.role}`}>{user?.role}</span>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "2px" }}>
              {user?.department || "General"} Department
            </p>
          </div>
        </div>

        {/* DETAILS GRID */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "16px",
            marginBottom: "28px",
          }}
        >
          <div style={{ background: "var(--bg-surface)", padding: "14px", borderRadius: "12px", border: "1px solid var(--border-subtle)" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Employee ID</span>
            <p style={{ fontSize: "16px", fontWeight: 700, color: "var(--accent-cyan)", marginTop: "4px" }}>
              {user?.employeeId}
            </p>
          </div>

          <div style={{ background: "var(--bg-surface)", padding: "14px", borderRadius: "12px", border: "1px solid var(--border-subtle)" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Work Email</span>
            <p style={{ fontSize: "16px", fontWeight: 600, color: "#fff", marginTop: "4px" }}>
              {user?.email}
            </p>
          </div>

          <div style={{ background: "var(--bg-surface)", padding: "14px", borderRadius: "12px", border: "1px solid var(--border-subtle)" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Department</span>
            <p style={{ fontSize: "16px", fontWeight: 600, color: "#fff", marginTop: "4px" }}>
              {user?.department || "General"}
            </p>
          </div>

          <div style={{ background: "var(--bg-surface)", padding: "14px", borderRadius: "12px", border: "1px solid var(--border-subtle)" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Role Access</span>
            <p style={{ fontSize: "16px", fontWeight: 600, color: "#fff", marginTop: "4px", textTransform: "capitalize" }}>
              {user?.role}
            </p>
          </div>
        </div>

        {/* ATTENDANCE HIGHLIGHTS */}
        {summary && (
          <div style={{ background: "var(--bg-surface)", padding: "18px", borderRadius: "14px", border: "1px solid var(--border-subtle)", marginBottom: "24px" }}>
            <h3 style={{ fontSize: "15px", marginBottom: "12px", color: "var(--text-muted)" }}>
              Career Attendance Summary
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", textAlign: "center" }}>
              <div>
                <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>Rate</span>
                <p style={{ fontSize: "20px", fontWeight: 800, color: "#34d399" }}>
                  {summary.attendancePercentage}%
                </p>
              </div>
              <div>
                <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>Shifts Logged</span>
                <p style={{ fontSize: "20px", fontWeight: 800, color: "#fff" }}>
                  {summary.totalDaysRecorded}
                </p>
              </div>
              <div>
                <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>Total Hours</span>
                <p style={{ fontSize: "20px", fontWeight: 800, color: "var(--accent-cyan)" }}>
                  {summary.totalHours}h
                </p>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: "12px" }}>
          <Link to="/employee" className="btn btn-outline" style={{ flex: 1, textDecoration: "none" }}>
            ← Back to Dashboard
          </Link>
          <Link to="/employee/history" className="btn btn-primary" style={{ flex: 1, textDecoration: "none" }}>
            View Shift History →
          </Link>
        </div>
      </div>
    </div>
  );
}
