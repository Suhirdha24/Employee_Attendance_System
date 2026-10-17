import React, { useEffect, useState, useMemo } from "react";
import API from "../api/api";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useToast } from "../components/Toast";

export default function MarkAttendance() {
  const auth = useSelector((state) => state.auth);
  const user = auth?.user;
  const { addToast } = useToast();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayData, setTodayData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [workMode, setWorkMode] = useState("Office"); // 'Office' | 'Remote'

  // Live clock timer
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (isoString) => {
    if (!isoString) return "--:--";
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  const loadTodayStatus = async () => {
    try {
      setLoading(true);
      const res = await API.get("/attendance/today");
      setTodayData(res.data);
    } catch (err) {
      console.error("Error loading today's status:", err);
      addToast("Failed to fetch today's attendance status", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTodayStatus();
  }, []);

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      const res = await API.post("/attendance/checkin", { workMode });
      addToast(res.data?.message || "Check-In recorded successfully!", "success");
      await loadTodayStatus();
    } catch (err) {
      addToast(err.response?.data?.message || "Check-In failed. Please try again.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
      const res = await API.post("/attendance/checkout");
      addToast(res.data?.message || "Check-Out recorded successfully!", "success");
      await loadTodayStatus();
    } catch (err) {
      addToast(err.response?.data?.message || "Check-Out failed. Please try again.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const isCheckedIn = Boolean(todayData?.attendance?.checkInTime);
  const isCheckedOut = Boolean(todayData?.attendance?.checkOutTime);

  // Live active duration
  const activeDuration = useMemo(() => {
    if (isCheckedIn && !isCheckedOut && todayData?.attendance?.checkInTime) {
      const start = new Date(todayData.attendance.checkInTime);
      const diffMs = Math.max(0, currentTime - start);
      const totalSecs = Math.floor(diffMs / 1000);
      const hours = Math.floor(totalSecs / 3600);
      const mins = Math.floor((totalSecs % 3600) / 60);
      const secs = totalSecs % 60;
      return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }
    return null;
  }, [isCheckedIn, isCheckedOut, todayData, currentTime]);

  const isAfterLateCutoff = currentTime.getHours() > 9 || (currentTime.getHours() === 9 && currentTime.getMinutes() > 30);

  return (
    <div style={{ maxWidth: "960px", margin: "0 auto", paddingBottom: "48px" }}>
      {/* HEADER BREADCRUMB */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "28px",
        }}
      >
        <div>
          <span style={{ fontSize: "12px", color: "var(--accent-blue)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>
            Attendance Terminal
          </span>
          <h1 style={{ fontSize: "32px", marginTop: "4px" }}>Mark Today's Attendance</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "15px", marginTop: "4px" }}>
            Record your daily punch in / punch out with automatic shift verification
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <Link to="/employee" className="btn btn-outline">
            ← Dashboard
          </Link>
          <Link to="/employee/history" className="btn btn-primary">
            View History →
          </Link>
        </div>
      </div>

      {/* TERMINAL CARD */}
      <div
        className="card"
        style={{
          background: "linear-gradient(145deg, rgba(17, 24, 39, 0.95), rgba(31, 41, 55, 0.85))",
          border: "1px solid rgba(59, 130, 246, 0.25)",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
          textAlign: "center",
          padding: "40px 24px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* BACKGROUND GLOW ACCENT */}
        <div
          style={{
            position: "absolute",
            top: "-80px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "300px",
            height: "160px",
            background: isCheckedIn && !isCheckedOut
              ? "radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)",
            filter: "blur(40px)",
            pointerEvents: "none",
          }}
        />

        {/* WORK MODE TOGGLE */}
        <div
          style={{
            display: "inline-flex",
            background: "rgba(0, 0, 0, 0.3)",
            padding: "4px",
            borderRadius: "30px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            marginBottom: "24px",
          }}
        >
          <button
            type="button"
            onClick={() => setWorkMode("Office")}
            style={{
              padding: "8px 18px",
              borderRadius: "24px",
              fontSize: "13px",
              fontWeight: 600,
              background: workMode === "Office" ? "var(--accent-blue)" : "transparent",
              color: workMode === "Office" ? "#fff" : "var(--text-muted)",
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            🏢 In-Office
          </button>
          <button
            type="button"
            onClick={() => setWorkMode("Remote")}
            style={{
              padding: "8px 18px",
              borderRadius: "24px",
              fontSize: "13px",
              fontWeight: 600,
              background: workMode === "Remote" ? "var(--accent-purple)" : "transparent",
              color: workMode === "Remote" ? "#fff" : "var(--text-muted)",
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            🏠 Remote / WFH
          </button>
        </div>

        {/* CURRENT DATE & LIVE DIGITAL CLOCK */}
        <div style={{ marginBottom: "8px", color: "var(--text-muted)", fontSize: "16px", textTransform: "capitalize" }}>
          {currentTime.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        </div>

        <div
          style={{
            fontSize: "56px",
            fontWeight: 800,
            letterSpacing: "3px",
            fontFamily: "monospace",
            color: "var(--text-main)",
            textShadow: "0 0 30px rgba(59, 130, 246, 0.4)",
            marginBottom: "16px",
          }}
        >
          {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </div>

        {/* CURRENT STATUS BADGE */}
        <div style={{ marginBottom: "28px" }}>
          {!isCheckedIn && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 20px",
                background: "rgba(239, 68, 68, 0.12)",
                color: "#f87171",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "20px",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444" }} />
              Not Clocked In Today
            </div>
          )}

          {isCheckedIn && !isCheckedOut && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 20px",
                background: "rgba(16, 185, 129, 0.12)",
                color: "#34d399",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                borderRadius: "20px",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#10b981",
                  boxShadow: "0 0 10px #10b981",
                  animation: "pulse 1.5s infinite",
                }}
              />
              Active Session • {activeDuration}
            </div>
          )}

          {isCheckedOut && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 20px",
                background: "rgba(59, 130, 246, 0.12)",
                color: "#60a5fa",
                border: "1px solid rgba(59, 130, 246, 0.3)",
                borderRadius: "20px",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              <span>✓</span> Shift Completed ({todayData?.attendance?.totalHours || 0} hrs logged)
            </div>
          )}
        </div>

        {/* ACTION BUTTON */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "28px" }}>
          {!isCheckedIn && (
            <div>
              <button
                className="btn btn-primary"
                onClick={handleCheckIn}
                disabled={actionLoading || loading}
                style={{
                  fontSize: "18px",
                  padding: "16px 48px",
                  borderRadius: "12px",
                  boxShadow: "0 10px 25px rgba(59, 130, 246, 0.5)",
                  cursor: actionLoading ? "not-allowed" : "pointer",
                }}
              >
                {actionLoading ? "Recording Check-In..." : "🟢 Mark Check-In Now"}
              </button>
              {isAfterLateCutoff && (
                <div style={{ color: "#fbbf24", fontSize: "13px", marginTop: "12px" }}>
                  ⚠️ Notice: Current time is past 09:30 AM cutoff. Check-in will be logged as <strong>Late</strong>.
                </div>
              )}
            </div>
          )}

          {isCheckedIn && !isCheckedOut && (
            <div>
              <button
                className="btn"
                onClick={handleCheckOut}
                disabled={actionLoading || loading}
                style={{
                  fontSize: "18px",
                  padding: "16px 48px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #ef4444, #dc2626)",
                  color: "#fff",
                  border: "none",
                  boxShadow: "0 10px 25px rgba(239, 68, 68, 0.4)",
                  cursor: actionLoading ? "not-allowed" : "pointer",
                }}
              >
                {actionLoading ? "Recording Check-Out..." : "🔴 Mark Check-Out Now"}
              </button>
              <div style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "12px" }}>
                Active shift duration: <strong>{activeDuration}</strong>. Less than 4.5 hrs marks as Half-day.
              </div>
            </div>
          )}

          {isCheckedOut && (
            <div
              style={{
                padding: "16px 32px",
                background: "rgba(16, 185, 129, 0.08)",
                border: "1px solid rgba(16, 185, 129, 0.2)",
                borderRadius: "12px",
                color: "var(--text-muted)",
              }}
            >
              🎉 You have successfully clocked out for today. See you tomorrow!
            </div>
          )}
        </div>

        {/* SHIFT SUMMARY DETAILS GRID */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "16px",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            paddingTop: "24px",
            textAlign: "left",
          }}
        >
          <div style={{ background: "rgba(255, 255, 255, 0.02)", padding: "14px 18px", borderRadius: "10px" }}>
            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>CHECK-IN TIME</div>
            <div style={{ fontSize: "18px", fontWeight: 700, marginTop: "4px", color: isCheckedIn ? "var(--accent-green)" : "inherit" }}>
              {isCheckedIn ? formatTime(todayData?.attendance?.checkInTime) : "--:--"}
            </div>
          </div>

          <div style={{ background: "rgba(255, 255, 255, 0.02)", padding: "14px 18px", borderRadius: "10px" }}>
            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>CHECK-OUT TIME</div>
            <div style={{ fontSize: "18px", fontWeight: 700, marginTop: "4px", color: isCheckedOut ? "var(--accent-cyan)" : "inherit" }}>
              {isCheckedOut ? formatTime(todayData?.attendance?.checkOutTime) : "--:--"}
            </div>
          </div>

          <div style={{ background: "rgba(255, 255, 255, 0.02)", padding: "14px 18px", borderRadius: "10px" }}>
            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>HOURS WORKED</div>
            <div style={{ fontSize: "18px", fontWeight: 700, marginTop: "4px" }}>
              {isCheckedOut
                ? `${todayData?.attendance?.totalHours || 0} hrs`
                : activeDuration
                ? activeDuration
                : "--"}
            </div>
          </div>

          <div style={{ background: "rgba(255, 255, 255, 0.02)", padding: "14px 18px", borderRadius: "10px" }}>
            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>STATUS</div>
            <div style={{ marginTop: "4px" }}>
              {todayData?.attendance?.status ? (
                <span className={`status-pill ${todayData.attendance.status}`}>
                  {todayData.attendance.status}
                </span>
              ) : (
                <span className="status-pill absent">absent</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* POLICY & GUIDELINES */}
      <div
        className="card"
        style={{
          marginTop: "24px",
          background: "rgba(17, 24, 39, 0.4)",
          border: "1px solid rgba(255, 255, 255, 0.05)",
        }}
      >
        <h3 style={{ fontSize: "16px", marginBottom: "12px" }}>📋 Attendance Policy & Timings</h3>
        <ul style={{ color: "var(--text-muted)", fontSize: "14px", lineHeight: "1.7", paddingLeft: "20px" }}>
          <li>
            <strong>Standard Work Shift:</strong> 09:00 AM – 05:30 PM (8.5 Hours).
          </li>
          <li>
            <strong>Grace Period:</strong> Check-ins up to 09:30 AM are marked as <strong>Present</strong>. Check-ins after 09:30 AM are automatically flagged as <strong>Late</strong>.
          </li>
          <li>
            <strong>Half-Day Threshold:</strong> If total logged hours at punch-out are less than 4.5 hours, status will automatically be recorded as <strong>Half-Day</strong>.
          </li>
        </ul>
      </div>
    </div>
  );
}
