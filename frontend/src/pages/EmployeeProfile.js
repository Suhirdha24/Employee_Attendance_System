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
    <div style={{ maxWidth: "760px", margin: "20px auto 48px" }}>
      <div className="card">
        {/* PROFILE HEADER WITH AVATAR */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            paddingBottom: "24px",
            borderBottom: "1px solid var(--border-subtle)",
            marginBottom: "28px",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "8px",
              background: "var(--primary-light)",
              border: "1px solid var(--primary-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "26px",
              fontWeight: 800,
              color: "var(--primary)",
            }}
          >
            {user?.name?.charAt(0) || "U"}
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h1 style={{ fontSize: "22px", color: "var(--text-main)" }}>{user?.name}</h1>
              <span className={`role-pill ${user?.role}`}>{user?.role}</span>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "3px" }}>
              {user?.department || "General"} Department • ID: <strong style={{ fontFamily: "monospace", color: "var(--text-main)" }}>{user?.employeeId}</strong>
            </p>
          </div>
        </div>

        {/* DETAILS GRID */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
            marginBottom: "28px",
          }}
        >
          <div style={{ background: "var(--bg-surface)", padding: "16px", borderRadius: "6px", border: "1px solid var(--border-subtle)" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Employee ID</span>
            <p style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-main)", marginTop: "4px", fontFamily: "monospace" }}>
              {user?.employeeId}
            </p>
          </div>

          <div style={{ background: "var(--bg-surface)", padding: "16px", borderRadius: "6px", border: "1px solid var(--border-subtle)" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Work Email</span>
            <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-main)", marginTop: "4px" }}>
              {user?.email}
            </p>
          </div>

          <div style={{ background: "var(--bg-surface)", padding: "16px", borderRadius: "6px", border: "1px solid var(--border-subtle)" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Assigned Unit</span>
            <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-main)", marginTop: "4px" }}>
              {user?.department || "General"}
            </p>
          </div>

          <div style={{ background: "var(--bg-surface)", padding: "16px", borderRadius: "6px", border: "1px solid var(--border-subtle)" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Access Permission</span>
            <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-main)", marginTop: "4px", textTransform: "capitalize" }}>
              Standard {user?.role}
            </p>
          </div>
        </div>

        {/* ATTENDANCE HIGHLIGHTS */}
        {summary && (
          <div style={{ background: "var(--bg-surface)", padding: "20px", borderRadius: "8px", border: "1px solid var(--border-subtle)", marginBottom: "28px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "16px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Career Attendance Compliance Record
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", textAlign: "center" }}>
              <div style={{ background: "#ffffff", padding: "14px", borderRadius: "6px", border: "1px solid var(--border-subtle)" }}>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Compliance Rate</span>
                <p style={{ fontSize: "22px", fontWeight: 800, color: "var(--status-present-text)", marginTop: "2px" }}>
                  {summary.attendancePercentage}%
                </p>
              </div>
              <div style={{ background: "#ffffff", padding: "14px", borderRadius: "6px", border: "1px solid var(--border-subtle)" }}>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Shifts Logged</span>
                <p style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-main)", marginTop: "2px" }}>
                  {summary.totalDaysRecorded}
                </p>
              </div>
              <div style={{ background: "#ffffff", padding: "14px", borderRadius: "6px", border: "1px solid var(--border-subtle)" }}>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Total Hours</span>
                <p style={{ fontSize: "22px", fontWeight: 800, color: "var(--primary)", marginTop: "2px" }}>
                  {summary.totalHours}h
                </p>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: "12px" }}>
          <Link to="/employee" className="btn btn-outline" style={{ flex: 1, textDecoration: "none" }}>
            ← Return to Dashboard
          </Link>
          <Link to="/employee/history" className="btn btn-primary" style={{ flex: 1, textDecoration: "none" }}>
            View Detailed Shift History →
          </Link>
        </div>
      </div>
    </div>
  );
}
