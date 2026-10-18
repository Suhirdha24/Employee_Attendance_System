import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { login } from "../features/authSlice";

export default function HomePage() {
  const nav = useNavigate();
  const dispatch = useDispatch();
  const auth = useSelector((s) => s.auth);

  const quickLogin = async (email, password, role) => {
    const res = await dispatch(login({ email, password }));
    if (res.meta.requestStatus === "fulfilled") {
      nav(role === "manager" ? "/manager" : "/employee");
    }
  };

  return (
    <div style={{ maxWidth: "1140px", margin: "20px auto 60px", padding: "0 16px" }}>
      {/* CORPORATE HERO SECTION */}
      <div
        className="card"
        style={{
          padding: "48px 36px",
          textAlign: "center",
          marginBottom: "32px",
          background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
          border: "1px solid #e2e8f0",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "5px 14px",
            borderRadius: "4px",
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            color: "#1d4ed8",
            fontSize: "12px",
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: "18px",
          }}
        >
          <span>Official Corporate Portal</span>
        </div>

        <h1
          style={{
            fontSize: "36px",
            fontWeight: "800",
            color: "#0f172a",
            marginBottom: "14px",
            letterSpacing: "-0.025em",
          }}
        >
          Enterprise Attendance & Workforce Management
        </h1>
        <p
          style={{
            fontSize: "16px",
            color: "#475569",
            maxWidth: "720px",
            margin: "0 auto 28px",
            lineHeight: "1.6",
          }}
        >
          Centralized human resources portal for daily shift verification, automated punch-in tracking,
          punctuality compliance, team presence audits, and payroll-ready reporting.
        </p>

        {/* CTA BUTTONS */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          {auth.user ? (
            <button
              className="btn btn-primary"
              style={{ padding: "12px 24px", fontSize: "14px" }}
              onClick={() => nav(auth.user.role === "manager" ? "/manager" : "/employee")}
            >
              Access Your Workstation Dashboard →
            </button>
          ) : (
            <>
              <button
                className="btn btn-primary"
                style={{ padding: "12px 28px", fontSize: "14px" }}
                onClick={() => nav("/login")}
              >
                Sign In to Portal
              </button>
              <button
                className="btn btn-outline"
                style={{ padding: "12px 24px", fontSize: "14px" }}
                onClick={() => nav("/register")}
              >
                New Employee Enrollment
              </button>
            </>
          )}
        </div>
      </div>

      {/* PORTAL ACCESS BY ROLE */}
      <div style={{ marginBottom: "16px" }}>
        <h2 style={{ fontSize: "18px", color: "#0f172a" }}>Select Workspace Role</h2>
        <p style={{ color: "#64748b", fontSize: "13px" }}>
          Choose your account profile to access self-service or managerial oversight tools
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: "24px",
          marginBottom: "40px",
        }}
      >
        {/* EMPLOYEE PORTAL CARD */}
        <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "14px",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "6px",
                  background: "#eff6ff",
                  color: "#1d4ed8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "14px",
                  border: "1px solid #bfdbfe",
                }}
              >
                ESS
              </div>
              <div>
                <h3 style={{ fontSize: "18px", color: "#0f172a" }}>Employee Self-Service</h3>
                <span style={{ fontSize: "12px", color: "#64748b" }}>Staff Punch & Personal Records</span>
              </div>
            </div>

            <p style={{ color: "#475569", fontSize: "13px", lineHeight: "1.6", marginBottom: "16px" }}>
              Record daily punch-in and punch-out timestamps with automated shift duration calculation,
              inspect personal monthly attendance logs, and track shift compliance.
            </p>

            <div style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: "6px", border: "1px solid #e2e8f0", marginBottom: "20px" }}>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>Key Capabilities:</div>
              <ul style={{ listStyle: "none", color: "#64748b", fontSize: "12px", lineHeight: "1.6" }}>
                <li>• Live digital clock & session timer</li>
                <li>• Policy-based status tagging (Present / Late / Half-Day)</li>
                <li>• Monthly turnout percentages & personal history</li>
              </ul>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px", flexDirection: "column" }}>
            <button
              className="btn btn-primary"
              style={{ width: "100%" }}
              onClick={() => nav("/login")}
            >
              Employee Login
            </button>
            <button
              className="btn btn-outline btn-sm"
              style={{ width: "100%", color: "#1d4ed8" }}
              onClick={() => quickLogin("alex@company.com", "password123", "employee")}
            >
              Demo: Quick Sign-in as Alex Johnson (Staff)
            </button>
          </div>
        </div>

        {/* MANAGER PORTAL CARD */}
        <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "14px",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "6px",
                  background: "#f5f3ff",
                  color: "#6d28d9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "14px",
                  border: "1px solid #ddd6fe",
                }}
              >
                MGR
              </div>
              <div>
                <h3 style={{ fontSize: "18px", color: "#0f172a" }}>Manager & HR Administration</h3>
                <span style={{ fontSize: "12px", color: "#64748b" }}>Team Oversight & Compliance Audits</span>
              </div>
            </div>

            <p style={{ color: "#475569", fontSize: "13px", lineHeight: "1.6", marginBottom: "16px" }}>
              Supervise active shift attendance in real time across all enterprise departments,
              conduct team calendar reviews, generate audit logs, and export payroll CSV sheets.
            </p>

            <div style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: "6px", border: "1px solid #e2e8f0", marginBottom: "20px" }}>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>Key Capabilities:</div>
              <ul style={{ listStyle: "none", color: "#64748b", fontSize: "12px", lineHeight: "1.6" }}>
                <li>• Real-time presence monitoring & headcount tracking</li>
                <li>• Team calendar heatmap and day-level inspection</li>
                <li>• Audit reports with 1-click CSV export</li>
              </ul>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px", flexDirection: "column" }}>
            <button
              className="btn btn-primary"
              style={{ width: "100%", background: "#0f172a", borderColor: "#0f172a" }}
              onClick={() => nav("/login")}
            >
              Manager Login
            </button>
            <button
              className="btn btn-outline btn-sm"
              style={{ width: "100%", color: "#6d28d9" }}
              onClick={() => quickLogin("manager@company.com", "manager123", "manager")}
            >
              Demo: Quick Sign-in as Eleanor Vance (Manager)
            </button>
          </div>
        </div>
      </div>

      {/* CORPORATE POLICY & SHIFT TIMINGS NOTICE */}
      <div
        className="card"
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderLeft: "4px solid var(--primary)",
        }}
      >
        <h4 style={{ fontSize: "15px", marginBottom: "6px", color: "#0f172a" }}>
          Standard Working Hours & Attendance Guidelines
        </h4>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px", marginTop: "12px", fontSize: "13px", color: "#475569" }}>
          <div>
            <strong>Core Shift Window:</strong><br />
            09:00 AM – 05:30 PM (Monday through Friday)
          </div>
          <div>
            <strong>Punctuality Grace Period:</strong><br />
            Punches recorded before 09:30 AM are marked as <em>Present</em>. Check-ins after 09:30 AM are logged as <em>Late</em>.
          </div>
          <div>
            <strong>Half-Day Shift Policy:</strong><br />
            Total duration below 4.5 hours is automatically audited as a <em>Half-Day</em> shift.
          </div>
        </div>
      </div>
    </div>
  );
}
