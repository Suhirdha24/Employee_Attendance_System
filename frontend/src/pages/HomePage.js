import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { login } from "../features/authSlice";

export default function HomePage() {
  const nav = useNavigate();
  const dispatch = useDispatch();
  const auth = useSelector((s) => s.auth);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [demoLoadingRole, setDemoLoadingRole] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const quickLogin = async (email, password, role) => {
    setDemoLoadingRole(role);
    try {
      const res = await dispatch(login({ email, password }));
      if (res.meta.requestStatus === "fulfilled") {
        nav(role === "manager" ? "/manager" : "/employee");
      }
    } finally {
      setDemoLoadingRole(null);
    }
  };

  return (
    <div style={{ width: "100%", paddingBottom: "48px" }}>
      {/* HERO SECTION */}
      <div
        style={{
          textAlign: "center",
          padding: "48px 24px 40px",
          borderRadius: "var(--radius-xl)",
          background: "linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)",
          border: "1px solid var(--border-subtle)",
          boxShadow: "var(--shadow-sm)",
          marginBottom: "32px",
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
            padding: "5px 14px",
            borderRadius: "var(--radius-full)",
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            color: "#1d4ed8",
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "0.03em",
            marginBottom: "18px",
          }}
        >
          <span style={{ display: "inline-block", width: "7px", height: "7px", borderRadius: "50%", background: "#2563eb" }}></span>
          Smart Attendance System
        </div>

        {/* HERO TITLE */}
        <h1
          style={{
            fontSize: "clamp(28px, 4.5vw, 42px)",
            fontWeight: 800,
            color: "#0f172a",
            maxWidth: "780px",
            margin: "0 auto 14px",
            letterSpacing: "-0.02em",
            lineHeight: 1.22,
          }}
        >
          Simple & Reliable Attendance Tracking{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #4f46e5 0%, #0284c7 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            for Your Team
          </span>
        </h1>

        <p
          style={{
            fontSize: "15px",
            color: "#475569",
            maxWidth: "600px",
            margin: "0 auto 28px",
            lineHeight: 1.6,
          }}
        >
          Easily mark attendance, track work hours, manage office and remote shifts, and view monthly timesheets in one clean dashboard.
        </p>

        {/* CTA BUTTONS */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginBottom: "24px" }}>
          {auth.user ? (
            <button
              className="btn btn-primary btn-lg"
              onClick={() => nav(auth.user.role === "manager" ? "/manager" : "/employee")}
            >
              Open Your Dashboard →
            </button>
          ) : (
            <>
              <button
                className="btn btn-primary btn-lg"
                onClick={() => nav("/login")}
              >
                Sign In
              </button>
              <button
                className="btn btn-outline btn-lg"
                onClick={() => nav("/register")}
              >
                Register Employee
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
              padding: "8px 16px",
              borderRadius: "var(--radius-full)",
              background: "#ffffff",
              border: "1px solid var(--border-medium)",
              boxShadow: "var(--shadow-xs)",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)" }}>
              Try Demo:
            </span>
            <button
              className="btn btn-sm"
              style={{ background: "#eef2ff", color: "#4338ca", border: "1px solid #c7d2fe" }}
              disabled={Boolean(demoLoadingRole)}
              onClick={() => quickLogin("alex@company.com", "password123", "employee")}
            >
              {demoLoadingRole === "employee" ? "Signing in..." : "👨‍💼 Alex (Employee)"}
            </button>
            <button
              className="btn btn-sm"
              style={{ background: "#fdf4ff", color: "#7e22ce", border: "1px solid #f0abfc" }}
              disabled={Boolean(demoLoadingRole)}
              onClick={() => quickLogin("manager@company.com", "manager123", "manager")}
            >
              {demoLoadingRole === "manager" ? "Signing in..." : "👩‍💼 Eleanor (Manager)"}
            </button>
          </div>
        )}
      </div>

      {/* TWO WORKSPACE ROLE CARDS */}
      <div style={{ marginBottom: "16px" }}>
        <h2 style={{ fontSize: "19px", color: "var(--text-main)" }}>Choose Your Portal</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "13.5px" }}>
          Log in as an employee to record your attendance, or as a manager to oversee your team.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "20px",
          marginBottom: "36px",
        }}
      >
        {/* EMPLOYEE PORTAL CARD */}
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
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
              <div
                style={{
                  width: "42px",
                  height: "42px",
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
                <h3 style={{ fontSize: "17px", color: "#0f172a" }}>Employee Portal</h3>
                <span style={{ fontSize: "12px", color: "#64748b" }}>Mark Attendance & View History</span>
              </div>
            </div>

            <p style={{ color: "#475569", fontSize: "13.5px", lineHeight: "1.5", marginBottom: "16px" }}>
              Check in and check out each day, choose whether you are in the office or working remotely, and track your working hours.
            </p>

            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px", fontSize: "13px", color: "#334155" }}>
              <li style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <span style={{ color: "#10b981", fontWeight: 700 }}>✓</span> One-click check-in and check-out
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <span style={{ color: "#10b981", fontWeight: 700 }}>✓</span> Select work mode: 🏢 Office or 🌐 Remote
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <span style={{ color: "#10b981", fontWeight: 700 }}>✓</span> Monthly calendar view with color codes
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: "#10b981", fontWeight: 700 }}>✓</span> See total hours and on-time status
              </li>
            </ul>
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
            <button
              className="btn btn-primary"
              style={{ flex: 1, padding: "11px", fontWeight: 700 }}
              onClick={() => quickLogin("alex@company.com", "password123", "employee")}
              disabled={Boolean(demoLoadingRole)}
            >
              {demoLoadingRole === "employee" ? "Entering..." : "▶ Open Employee View"}
            </button>
            <button
              className="btn btn-outline"
              style={{ padding: "11px 16px", fontWeight: 600 }}
              onClick={() => nav("/login")}
            >
              Sign In
            </button>
          </div>
        </div>

        {/* MANAGER PORTAL CARD */}
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
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
              <div
                style={{
                  width: "42px",
                  height: "42px",
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
                <h3 style={{ fontSize: "17px", color: "#0f172a" }}>Manager Portal</h3>
                <span style={{ fontSize: "12px", color: "#64748b" }}>Team Attendance & Reports</span>
              </div>
            </div>

            <p style={{ color: "#475569", fontSize: "13.5px", lineHeight: "1.5", marginBottom: "16px" }}>
              See who is present today, review team hours, adjust attendance when needed, and export records for payroll.
            </p>

            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px", fontSize: "13px", color: "#334155" }}>
              <li style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <span style={{ color: "#0284c7", fontWeight: 700 }}>✓</span> Today's attendance summary at a glance
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <span style={{ color: "#0284c7", fontWeight: 700 }}>✓</span> Filter by department, status, and work mode
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <span style={{ color: "#0284c7", fontWeight: 700 }}>✓</span> Edit or adjust records with notes
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: "#0284c7", fontWeight: 700 }}>✓</span> Download attendance reports as CSV
              </li>
            </ul>
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
            <button
              className="btn btn-primary"
              style={{ flex: 1, padding: "11px", fontWeight: 700, background: "#0284c7", borderColor: "#0284c7" }}
              onClick={() => quickLogin("manager@company.com", "manager123", "manager")}
              disabled={Boolean(demoLoadingRole)}
            >
              {demoLoadingRole === "manager" ? "Entering..." : "▶ Open Manager View"}
            </button>
            <button
              className="btn btn-outline"
              style={{ padding: "11px 16px", fontWeight: 600 }}
              onClick={() => nav("/login")}
            >
              Sign In
            </button>
          </div>
        </div>
      </div>

      {/* KEY FEATURES */}
      <div style={{ marginBottom: "16px" }}>
        <h2 style={{ fontSize: "19px", color: "var(--text-main)" }}>Key Features</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "13.5px" }}>
          Everything you need to track and manage everyday attendance smoothly.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "16px",
        }}
      >
        <div className="card">
          <div style={{ fontSize: "22px", marginBottom: "8px" }}>⏱️</div>
          <h4 style={{ fontSize: "14.5px", marginBottom: "4px" }}>Quick Check-In & Out</h4>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.5" }}>
            Record arrival and departure times with a single click. Arrival after 09:30 AM is marked as late.
          </p>
        </div>

        <div className="card">
          <div style={{ fontSize: "22px", marginBottom: "8px" }}>🌐</div>
          <h4 style={{ fontSize: "14.5px", marginBottom: "4px" }}>Office & Remote Mode</h4>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.5" }}>
            Easily choose whether you are working in the office or working from home for the day.
          </p>
        </div>

        <div className="card">
          <div style={{ fontSize: "22px", marginBottom: "8px" }}>📊</div>
          <h4 style={{ fontSize: "14.5px", marginBottom: "4px" }}>Live Work Hours</h4>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.5" }}>
            Active shifts display real-time elapsed hours so employees always know their daily progress.
          </p>
        </div>

        <div className="card">
          <div style={{ fontSize: "22px", marginBottom: "8px" }}>📥</div>
          <h4 style={{ fontSize: "14.5px", marginBottom: "4px" }}>Download CSV Reports</h4>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.5" }}>
            Export attendance records filtered by date, department, or individual employee.
          </p>
        </div>
      </div>
    </div>
  );
}
