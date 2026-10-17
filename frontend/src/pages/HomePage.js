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
    <div style={{ maxWidth: "1100px", margin: "40px auto 80px", padding: "0 20px" }}>
      {/* HERO SECTION */}
      <div style={{ textAlign: "center", marginBottom: "60px" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 14px",
            borderRadius: "999px",
            background: "rgba(99, 102, 241, 0.15)",
            border: "1px solid rgba(99, 102, 241, 0.3)",
            color: "#a5b4fc",
            fontSize: "13px",
            fontWeight: "600",
            marginBottom: "20px",
          }}
        >
          <span>⚡ Next-Generation Workforce Platform</span>
        </div>

        <h1
          style={{
            fontSize: "clamp(32px, 5vw, 54px)",
            fontWeight: "800",
            lineHeight: 1.15,
            marginBottom: "20px",
            background: "linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Track Attendance with Precision & Ease
        </h1>
        <p
          style={{
            fontSize: "18px",
            color: "var(--text-muted)",
            maxWidth: "680px",
            margin: "0 auto 32px",
          }}
        >
          Seamless one-click Check-In, smart automated late & half-day detection,
          interactive calendar heatmaps, and executive team analytics.
        </p>

        {/* CTA BUTTONS */}
        <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          {auth.user ? (
            <button
              className="btn btn-primary"
              style={{ padding: "14px 28px", fontSize: "16px" }}
              onClick={() => nav(auth.user.role === "manager" ? "/manager" : "/employee")}
            >
              Go to Your Dashboard →
            </button>
          ) : (
            <>
              <button
                className="btn btn-primary"
                style={{ padding: "14px 28px", fontSize: "16px" }}
                onClick={() => nav("/login")}
              >
                Get Started
              </button>
              <button
                className="btn btn-outline"
                style={{ padding: "14px 24px", fontSize: "16px" }}
                onClick={() => nav("/register")}
              >
                Create Account
              </button>
            </>
          )}
        </div>
      </div>

      {/* QUICK ROLE PORTALS / DEMO PRESETS */}
      <h2 style={{ fontSize: "22px", textAlign: "center", marginBottom: "24px" }}>
        Explore Experience by Role
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "24px",
          marginBottom: "60px",
        }}
      >
        {/* EMPLOYEE PORTAL CARD */}
        <div className="card glass-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "rgba(6, 182, 212, 0.15)",
                color: "var(--accent-cyan)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                marginBottom: "16px",
              }}
            >
              👤
            </div>
            <h3 style={{ fontSize: "20px", marginBottom: "8px" }}>Employee Hub</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "16px" }}>
              Mark daily check-ins with automated time tracking, view monthly attendance rates,
              and explore calendar heatmaps.
            </p>
            <ul style={{ listStyle: "none", color: "var(--text-dim)", fontSize: "13px", marginBottom: "20px" }}>
              <li style={{ marginBottom: "6px" }}>✓ Live digital clock & session duration</li>
              <li style={{ marginBottom: "6px" }}>✓ Smart status tags (Present, Late, Half-Day)</li>
              <li style={{ marginBottom: "6px" }}>✓ Personal attendance summary & statistics</li>
            </ul>
          </div>

          <div style={{ display: "flex", gap: "10px", flexDirection: "column" }}>
            <button
              className="btn btn-primary"
              style={{ width: "100%" }}
              onClick={() => nav("/login")}
            >
              Sign In as Employee
            </button>
            <button
              className="btn btn-outline btn-sm"
              style={{ width: "100%", borderColor: "rgba(6, 182, 212, 0.3)", color: "var(--accent-cyan)" }}
              onClick={() => quickLogin("alex@company.com", "password123", "employee")}
            >
              ⚡ Quick Demo: Login as Alex Johnson
            </button>
          </div>
        </div>

        {/* MANAGER PORTAL CARD */}
        <div className="card glass-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "rgba(139, 92, 246, 0.15)",
                color: "#c084fc",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                marginBottom: "16px",
              }}
            >
              📊
            </div>
            <h3 style={{ fontSize: "20px", marginBottom: "8px" }}>Manager Command Center</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "16px" }}>
              Monitor real-time team presence, filter by department and status, drill into
              individual logs, and export reports.
            </p>
            <ul style={{ listStyle: "none", color: "var(--text-dim)", fontSize: "13px", marginBottom: "20px" }}>
              <li style={{ marginBottom: "6px" }}>✓ Live team overview & presence count</li>
              <li style={{ marginBottom: "6px" }}>✓ Department-wise filtering & quick search</li>
              <li style={{ marginBottom: "6px" }}>✓ Visual analytics & 1-click CSV export</li>
            </ul>
          </div>

          <div style={{ display: "flex", gap: "10px", flexDirection: "column" }}>
            <button
              className="btn btn-primary"
              style={{ width: "100%", background: "linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)" }}
              onClick={() => nav("/login")}
            >
              Sign In as Manager
            </button>
            <button
              className="btn btn-outline btn-sm"
              style={{ width: "100%", borderColor: "rgba(139, 92, 246, 0.3)", color: "#c084fc" }}
              onClick={() => quickLogin("manager@company.com", "manager123", "manager")}
            >
              ⚡ Quick Demo: Login as Manager
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
