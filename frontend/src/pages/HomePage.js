import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { login } from "../features/authSlice";

export default function HomePage() {
  const nav = useNavigate();
  const dispatch = useDispatch();
  const auth = useSelector((s) => s.auth);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const quickLogin = async (email, password, role) => {
    const res = await dispatch(login({ email, password }));
    if (res.meta.requestStatus === "fulfilled") {
      nav(role === "manager" ? "/manager" : "/employee");
    }
  };

  return (
    <div style={{ width: "100%", paddingBottom: "48px" }}>
      {/* HERO SECTION */}
      <div
        style={{
          textAlign: "center",
          padding: "54px 24px 44px",
          borderRadius: "var(--radius-xl)",
          background: "linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)",
          border: "1px solid var(--border-subtle)",
          boxShadow: "var(--shadow-sm)",
          marginBottom: "36px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* TOP PILL BADGE */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 16px",
            borderRadius: "var(--radius-full)",
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            color: "#1d4ed8",
            fontSize: "12.5px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: "20px",
          }}
        >
          <span style={{ display: "inline-block", width: "7px", height: "7px", borderRadius: "50%", background: "#2563eb" }}></span>
          Enterprise Workforce Intelligence Platform
        </div>

        {/* HERO TITLE */}
        <h1
          style={{
            fontSize: "clamp(32px, 5vw, 48px)",
            fontWeight: 800,
            color: "#0f172a",
            maxWidth: "840px",
            margin: "0 auto 16px",
            letterSpacing: "-0.03em",
            lineHeight: 1.18,
          }}
        >
          Transform Workforce Attendance Into{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #4f46e5 0%, #0284c7 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Actionable Telemetry
          </span>
        </h1>

        <p
          style={{
            fontSize: "16px",
            color: "#475569",
            maxWidth: "680px",
            margin: "0 auto 32px",
            lineHeight: 1.6,
          }}
        >
          StaffTrack HRMS provides verified workstation punch-in tracking, automated punctuality compliance, interactive monthly heatmap timesheets, and instant payroll-ready CSV exports.
        </p>

        {/* CTA BUTTONS */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginBottom: "28px" }}>
          {auth.user ? (
            <button
              className="btn btn-primary btn-lg"
              onClick={() => nav(auth.user.role === "manager" ? "/manager" : "/employee")}
            >
              Open Your Workstation Dashboard →
            </button>
          ) : (
            <>
              <button
                className="btn btn-primary btn-lg"
                onClick={() => nav("/login")}
              >
                Sign In to Workstation
              </button>
              <button
                className="btn btn-outline btn-lg"
                onClick={() => nav("/register")}
              >
                Enroll New Employee
              </button>
            </>
          )}
        </div>

        {/* QUICK DEMO ONE-CLICK LOGIN BAR */}
        {!auth.user && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 18px",
              borderRadius: "var(--radius-full)",
              background: "#ffffff",
              border: "1px solid var(--border-medium)",
              boxShadow: "var(--shadow-xs)",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
              Quick Evaluation Demo:
            </span>
            <button
              className="btn btn-sm"
              style={{ background: "#eef2ff", color: "#4338ca", border: "1px solid #c7d2fe" }}
              onClick={() => quickLogin("alex@company.com", "password123", "employee")}
            >
              👨‍💼 Alex (Employee)
            </button>
            <button
              className="btn btn-sm"
              style={{ background: "#fdf4ff", color: "#7e22ce", border: "1px solid #f0abfc" }}
              onClick={() => quickLogin("manager@company.com", "manager123", "manager")}
            >
              👩‍💼 Eleanor (Manager)
            </button>
          </div>
        )}
      </div>

      {/* TWO WORKSPACE ROLE CARDS */}
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ fontSize: "20px", color: "var(--text-main)" }}>Select Workspace Experience</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "13.5px" }}>
          Dedicated role-based portals tailored for day-to-day work or team supervision
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          gap: "24px",
          marginBottom: "40px",
        }}
      >
        {/* EMPLOYEE WORKSTATION CARD */}
        <div
          className="card"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            borderTop: "4px solid #4f46e5",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "var(--radius-md)",
                  background: "#eef2ff",
                  color: "#4f46e5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                }}
              >
                👨‍💼
              </div>
              <div>
                <h3 style={{ fontSize: "18px", color: "#0f172a" }}>Employee Self-Service (ESS)</h3>
                <span style={{ fontSize: "12px", color: "#64748b" }}>Workstation & Shift Punching</span>
              </div>
            </div>

            <p style={{ color: "#475569", fontSize: "14px", lineHeight: "1.6", marginBottom: "18px" }}>
              Clock in and clock out with live biometric-style timestamps, select your work mode (In-Office or Remote), and audit your personal shift hours.
            </p>

            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", fontSize: "13px", color: "#334155" }}>
              <li style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <span style={{ color: "#10b981", fontWeight: 700 }}>✓</span> One-Click Digital Shift Punch (Check-In / Out)
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <span style={{ color: "#10b981", fontWeight: 700 }}>✓</span> Hybrid Work Mode: 🏢 Office vs 🌐 Remote
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <span style={{ color: "#10b981", fontWeight: 700 }}>✓</span> Interactive Monthly Calendar Heatmap Timesheet
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: "#10b981", fontWeight: 700 }}>✓</span> Personal Compliance & Punctuality Auditing
              </li>
            </ul>
          </div>

          <button
            className="btn btn-outline"
            style={{ width: "100%", padding: "12px", fontWeight: 700 }}
            onClick={() => nav(auth.user?.role === "employee" ? "/employee" : "/login")}
          >
            Launch Employee Workstation →
          </button>
        </div>

        {/* MANAGER OPERATIONS PORTAL CARD */}
        <div
          className="card"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            borderTop: "4px solid #0284c7",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "var(--radius-md)",
                  background: "#f0f9ff",
                  color: "#0284c7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                }}
              >
                👩‍💼
              </div>
              <div>
                <h3 style={{ fontSize: "18px", color: "#0f172a" }}>Manager & Operations Portal</h3>
                <span style={{ fontSize: "12px", color: "#64748b" }}>Workforce Telemetry & Compliance</span>
              </div>
            </div>

            <p style={{ color: "#475569", fontSize: "14px", lineHeight: "1.6", marginBottom: "18px" }}>
              Real-time team presence roster, shift duration inspection, manual attendance rectification, department compliance analytics, and payroll exports.
            </p>

            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", fontSize: "13px", color: "#334155" }}>
              <li style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <span style={{ color: "#0284c7", fontWeight: 700 }}>✓</span> Live Workforce Headcount & Presence Metrics
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <span style={{ color: "#0284c7", fontWeight: 700 }}>✓</span> Multi-Filter Master Audit Table with Quick Chips
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <span style={{ color: "#0284c7", fontWeight: 700 }}>✓</span> Manager Attendance Rectification & Adjustment Modal
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: "#0284c7", fontWeight: 700 }}>✓</span> Automated Payroll-Formatted CSV Timesheet Export
              </li>
            </ul>
          </div>

          <button
            className="btn btn-outline"
            style={{ width: "100%", padding: "12px", fontWeight: 700 }}
            onClick={() => nav(auth.user?.role === "manager" ? "/manager" : "/login")}
          >
            Launch Operations Portal →
          </button>
        </div>
      </div>

      {/* ENTERPRISE CAPABILITY HIGHLIGHTS */}
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ fontSize: "20px", color: "var(--text-main)" }}>Engineered for Operational Accuracy</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "13.5px" }}>
          Built to enforce enterprise compliance and eliminate timesheet disputes
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "18px",
        }}
      >
        <div className="card">
          <div style={{ fontSize: "24px", marginBottom: "10px" }}>⏱️</div>
          <h4 style={{ fontSize: "15px", marginBottom: "6px" }}>Automated Compliance Cutoffs</h4>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.5" }}>
            Enforces 09:30 AM arrival cutoff with automatic Late classification, and 4.5-hour threshold for Half-Day audits.
          </p>
        </div>

        <div className="card">
          <div style={{ fontSize: "24px", marginBottom: "10px" }}>🌐</div>
          <h4 style={{ fontSize: "15px", marginBottom: "6px" }}>Hybrid Work Tracking</h4>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.5" }}>
            Track in-office vs authorized remote shifts with full departmental reporting and ratio metrics.
          </p>
        </div>

        <div className="card">
          <div style={{ fontSize: "24px", marginBottom: "10px" }}>📊</div>
          <h4 style={{ fontSize: "15px", marginBottom: "6px" }}>Real-Time Elapsed Shift Telemetry</h4>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.5" }}>
            Live shift duration counters compute active hours on the fly with animated pulse indicators for clocked-in staff.
          </p>
        </div>

        <div className="card">
          <div style={{ fontSize: "24px", marginBottom: "10px" }}>📥</div>
          <h4 style={{ fontSize: "15px", marginBottom: "6px" }}>Instant Payroll Integration</h4>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.5" }}>
            Download timestamped, formatted CSV audit logs filtered by unit, date range, or individual employee ID.
          </p>
        </div>
      </div>
    </div>
  );
}
