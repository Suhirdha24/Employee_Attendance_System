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
      return `${String(hours).padStart(2, "0")}h ${String(mins).padStart(2, "0")}m ${String(secs).padStart(2, "0")}s`;
    }
    return null;
  }, [isCheckedIn, isCheckedOut, todayData, currentTime]);

  const isAfterLateCutoff =
    currentTime.getHours() > 9 || (currentTime.getHours() === 9 && currentTime.getMinutes() > 30);

  return (
    <div style={{ maxWidth: "880px", margin: "0 auto", paddingBottom: "48px" }}>
      {/* HEADER SECTION */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div>
          <span style={{ fontSize: "12px", color: "var(--accent-blue)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Staff Workstation
          </span>
          <h1 style={{ fontSize: "28px", color: "#0f172a", marginTop: "2px" }}>Mark Attendance</h1>
          <p style={{ color: "#64748b", fontSize: "14px", marginTop: "2px" }}>
            Record official daily punch in and punch out for shift tracking
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <Link to="/employee" className="btn btn-outline btn-sm">
            ← Dashboard
          </Link>
          <Link to="/employee/history" className="btn btn-primary btn-sm">
            View My History →
          </Link>
        </div>
      </div>

      {/* TERMINAL CARD */}
      <div
        className="card"
        style={{
          textAlign: "center",
          padding: "36px 28px",
          marginBottom: "24px",
          border: "1px solid #e2e8f0",
        }}
      >
        {/* WORK MODE SELECTOR */}
        <div style={{ marginBottom: "20px" }}>
          <div
            style={{
              display: "inline-flex",
              background: "#f1f5f9",
              padding: "4px",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
            }}
          >
            <button
              type="button"
              onClick={() => setWorkMode("Office")}
              style={{
                padding: "6px 16px",
                borderRadius: "4px",
                fontSize: "13px",
                fontWeight: 600,
                background: workMode === "Office" ? "#ffffff" : "transparent",
                color: workMode === "Office" ? "#0f172a" : "#64748b",
                border: workMode === "Office" ? "1px solid #cbd5e1" : "none",
                boxShadow: workMode === "Office" ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              In-Office Station
            </button>
            <button
              type="button"
              onClick={() => setWorkMode("Remote")}
              style={{
                padding: "6px 16px",
                borderRadius: "4px",
                fontSize: "13px",
                fontWeight: 600,
                background: workMode === "Remote" ? "#ffffff" : "transparent",
                color: workMode === "Remote" ? "#0f172a" : "#64748b",
                border: workMode === "Remote" ? "1px solid #cbd5e1" : "none",
                boxShadow: workMode === "Remote" ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              Authorized Remote / WFH
            </button>
          </div>
        </div>

        {/* CURRENT DATE & LIVE DIGITAL CLOCK */}
        <div style={{ color: "#64748b", fontSize: "14px", fontWeight: 500, marginBottom: "4px" }}>
          {currentTime.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        </div>

        <div
          style={{
            fontSize: "48px",
            fontWeight: "800",
            fontFamily: "monospace",
            color: "#0f172a",
            letterSpacing: "1px",
            marginBottom: "16px",
          }}
        >
          {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </div>

        {/* CURRENT STATUS CHIP */}
        <div style={{ marginBottom: "24px" }}>
          {!isCheckedIn && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "5px 14px",
                background: "#fef2f2",
                color: "#991b1b",
                border: "1px solid #fecaca",
                borderRadius: "4px",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              Not Punched In Today
            </span>
          )}

          {isCheckedIn && !isCheckedOut && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "5px 14px",
                background: "#ecfdf5",
                color: "#065f46",
                border: "1px solid #a7f3d0",
                borderRadius: "4px",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              ● Active Shift ({todayData?.status}) • Elapsed: {activeDuration}
            </span>
          )}

          {isCheckedOut && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "5px 14px",
                background: "#eff6ff",
                color: "#1d4ed8",
                border: "1px solid #bfdbfe",
                borderRadius: "4px",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              ✓ Shift Completed ({todayData?.attendance?.totalHours || 0} hrs logged)
            </span>
          )}
        </div>

        {/* PUNCH ACTION BUTTONS */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "28px" }}>
          {!isCheckedIn && (
            <div>
              <button
                className="btn btn-success"
                onClick={handleCheckIn}
                disabled={actionLoading || loading}
                style={{
                  fontSize: "15px",
                  padding: "14px 36px",
                  borderRadius: "6px",
                }}
              >
                {actionLoading ? "Recording Punch..." : "Record Check-In"}
              </button>
              {isAfterLateCutoff && (
                <div style={{ color: "#b45309", fontSize: "13px", marginTop: "10px", background: "#fffbeb", padding: "6px 12px", borderRadius: "4px", border: "1px solid #fde68a", display: "inline-block" }}>
                  Notice: Current time is after 09:30 AM grace cutoff. This check-in will be audited as <strong>Late</strong>.
                </div>
              )}
            </div>
          )}

          {isCheckedIn && !isCheckedOut && (
            <div>
              <button
                className="btn btn-danger"
                onClick={handleCheckOut}
                disabled={actionLoading || loading}
                style={{
                  fontSize: "15px",
                  padding: "14px 36px",
                  borderRadius: "6px",
                }}
              >
                {actionLoading ? "Recording Punch..." : "Record Check-Out"}
              </button>
              <div style={{ color: "#64748b", fontSize: "13px", marginTop: "10px" }}>
                Active shift duration: <strong>{activeDuration}</strong>. Shifts under 4.5 hrs are audited as Half-Day.
              </div>
            </div>
          )}

          {isCheckedOut && (
            <div
              style={{
                padding: "12px 24px",
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: "6px",
                color: "#166534",
                fontSize: "14px",
                fontWeight: 500,
              }}
            >
              Your daily attendance has been recorded and finalized for today.
            </div>
          )}
        </div>

        {/* LOGGED SHIFT DETAILS STRIP */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "12px",
            borderTop: "1px solid #e2e8f0",
            paddingTop: "20px",
            textAlign: "left",
          }}
        >
          <div style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Check-In Timestamp</div>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", marginTop: "4px" }}>
              {isCheckedIn ? formatTime(todayData?.attendance?.checkInTime) : "--:--"}
            </div>
          </div>

          <div style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Check-Out Timestamp</div>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", marginTop: "4px" }}>
              {isCheckedOut ? formatTime(todayData?.attendance?.checkOutTime) : "--:--"}
            </div>
          </div>

          <div style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Shift Duration</div>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", marginTop: "4px" }}>
              {isCheckedOut
                ? `${todayData?.attendance?.totalHours || 0} hrs`
                : activeDuration
                ? activeDuration
                : "--"}
            </div>
          </div>

          <div style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Audit Status</div>
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
          border: "1px solid #e2e8f0",
        }}
      >
        <h3 style={{ fontSize: "15px", color: "#0f172a", marginBottom: "10px" }}>Company Attendance Guidelines</h3>
        <ul style={{ color: "#475569", fontSize: "13px", lineHeight: "1.7", paddingLeft: "18px" }}>
          <li>
            <strong>Standard Work Shift:</strong> 09:00 AM – 05:30 PM (8.5 Hours standard).
          </li>
          <li>
            <strong>Grace Period:</strong> Punches recorded before 09:30 AM are audited as <strong>Present</strong>. Punches after 09:30 AM are automatically flagged as <strong>Late</strong>.
          </li>
          <li>
            <strong>Half-Day Threshold:</strong> If total logged hours at punch-out are less than 4.5 hours, status is recorded as <strong>Half-Day</strong>.
          </li>
        </ul>
      </div>
    </div>
  );
}
