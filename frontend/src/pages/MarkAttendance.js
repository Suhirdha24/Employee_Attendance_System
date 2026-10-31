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
  const [remarks, setRemarks] = useState("");

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
      if (res.data?.attendance?.workMode) {
        setWorkMode(res.data.attendance.workMode);
      }
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
      const res = await API.post("/attendance/checkin", { workMode, remarks });
      addToast(res.data?.message || "Check-In recorded successfully!", "success");
      setRemarks("");
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
      const res = await API.post("/attendance/checkout", { remarks });
      addToast(res.data?.message || "Check-Out recorded successfully!", "success");
      setRemarks("");
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
    <div style={{ maxWidth: "800px", margin: "0 auto", paddingBottom: "48px" }}>
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
          <span style={{ fontSize: "12px", color: "var(--primary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Daily Attendance
          </span>
          <h1 style={{ fontSize: "28px", color: "var(--text-main)", marginTop: "2px", letterSpacing: "-0.02em" }}>
            Mark Attendance
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "2px" }}>
            Check in and check out for today's work shift.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <Link to="/employee" className="btn btn-outline btn-sm">
            ← Dashboard
          </Link>
          <Link to="/employee/history" className="btn btn-primary btn-sm">
            View Timesheet →
          </Link>
        </div>
      </div>

      {/* TERMINAL CARD */}
      <div
        className="card"
        style={{
          textAlign: "center",
          padding: "44px 32px 36px",
          marginBottom: "24px",
          boxShadow: "var(--shadow-md)",
          borderTop: "4px solid var(--primary)",
        }}
      >
        {/* WORK MODE SELECTOR */}
        <div style={{ marginBottom: "24px" }}>
          <span style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px" }}>
            Choose Work Mode
          </span>
          <div
            style={{
              display: "inline-flex",
              background: "var(--bg-surface)",
              padding: "4px",
              borderRadius: "var(--radius-full)",
              border: "1px solid var(--border-medium)",
            }}
          >
            <button
              type="button"
              disabled={isCheckedIn}
              onClick={() => setWorkMode("Office")}
              style={{
                padding: "8px 22px",
                borderRadius: "var(--radius-full)",
                fontSize: "13.5px",
                fontWeight: 600,
                background: workMode === "Office" ? "var(--primary)" : "transparent",
                color: workMode === "Office" ? "#ffffff" : "var(--text-body)",
                border: "none",
                boxShadow: workMode === "Office" ? "0 2px 4px rgba(79, 70, 229, 0.3)" : "none",
                cursor: isCheckedIn ? "default" : "pointer",
                transition: "all 0.15s ease",
              }}
            >
              🏢 In-Office
            </button>
            <button
              type="button"
              disabled={isCheckedIn}
              onClick={() => setWorkMode("Remote")}
              style={{
                padding: "8px 22px",
                borderRadius: "var(--radius-full)",
                fontSize: "13.5px",
                fontWeight: 600,
                background: workMode === "Remote" ? "var(--primary)" : "transparent",
                color: workMode === "Remote" ? "#ffffff" : "var(--text-body)",
                border: "none",
                boxShadow: workMode === "Remote" ? "0 2px 4px rgba(79, 70, 229, 0.3)" : "none",
                cursor: isCheckedIn ? "default" : "pointer",
                transition: "all 0.15s ease",
              }}
            >
              🌐 Remote (WFH)
            </button>
          </div>
        </div>

        {/* DATE & LARGE DIGITAL CLOCK */}
        <div style={{ color: "var(--text-muted)", fontSize: "14px", fontWeight: 600, marginBottom: "6px" }}>
          {currentTime.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        </div>

        <div
          style={{
            fontSize: "clamp(40px, 8vw, 56px)",
            fontWeight: "800",
            fontFamily: "var(--font-mono)",
            color: "var(--text-main)",
            letterSpacing: "0.04em",
            marginBottom: "18px",
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
                padding: "6px 16px",
                background: "var(--status-absent-bg)",
                color: "var(--status-absent-text)",
                border: "1px solid var(--status-absent-border)",
                borderRadius: "var(--radius-full)",
                fontSize: "13px",
                fontWeight: 700,
              }}
            >
              Not Checked In Yet
            </span>
          )}

          {isCheckedIn && !isCheckedOut && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "7px 18px",
                background: "var(--status-present-bg)",
                color: "var(--status-present-text)",
                border: "1px solid var(--status-present-border)",
                borderRadius: "var(--radius-full)",
                fontSize: "13.5px",
                fontWeight: 700,
              }}
            >
              <span className="pulse-indicator"></span>
              Active Shift ({todayData?.status}) • Duration: {activeDuration} • {todayData?.attendance?.workMode || workMode}
            </span>
          )}

          {isCheckedOut && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "7px 18px",
                background: "var(--primary-light)",
                color: "var(--primary)",
                border: "1px solid var(--primary-border)",
                borderRadius: "var(--radius-full)",
                fontSize: "13.5px",
                fontWeight: 700,
              }}
            >
              ✓ Shift Finalized ({todayData?.attendance?.totalHours || 0} hrs logged)
            </span>
          )}
        </div>

        {/* REMARKS INPUT (IF NOT COMPLETED) */}
        {!isCheckedOut && (
          <div style={{ maxWidth: "440px", margin: "0 auto 24px" }}>
            <input
              type="text"
              className="form-input"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Optional remarks (e.g. transit delay, sprint deliverables, doctor visit)..."
              style={{ fontSize: "13px", padding: "11px 16px", textAlign: "center" }}
            />
          </div>
        )}

        {/* PUNCH ACTION BUTTONS */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "32px" }}>
          {!isCheckedIn && (
            <div>
              <button
                className="btn btn-success"
                onClick={handleCheckIn}
                disabled={actionLoading || loading}
                style={{
                  fontSize: "16px",
                  padding: "16px 44px",
                  borderRadius: "var(--radius-lg)",
                  boxShadow: "0 4px 14px rgba(16, 185, 129, 0.35)",
                }}
              >
                {actionLoading ? "Recording Punch..." : "▶ Punch Check-In Now"}
              </button>
              {isAfterLateCutoff && (
                <div style={{ color: "#b45309", fontSize: "13px", marginTop: "12px", background: "#fffbeb", padding: "8px 16px", borderRadius: "var(--radius-sm)", border: "1px solid #fde68a", display: "inline-block" }}>
                  ⚠️ Notice: Current time is after 09:30 AM cutoff. Shift will be classified as <strong>Late</strong>.
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
                  fontSize: "16px",
                  padding: "16px 44px",
                  borderRadius: "var(--radius-lg)",
                  boxShadow: "0 4px 14px rgba(239, 68, 68, 0.35)",
                }}
              >
                {actionLoading ? "Recording Punch..." : "⏹ Punch Check-Out Now"}
              </button>
              <div style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "12px" }}>
                Active shift duration: <strong style={{ color: "var(--text-main)" }}>{activeDuration}</strong>. Shifts under 4.5 hrs are classified as Half-Day.
              </div>
            </div>
          )}

          {isCheckedOut && (
            <div
              style={{
                padding: "16px 28px",
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: "var(--radius-md)",
                color: "#166534",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              Daily punch records finalized. Thank you for your work today!
              {todayData?.attendance?.remarks && (
                <div style={{ fontSize: "12.5px", color: "#4b5563", marginTop: "6px", fontWeight: 400 }}>
                  Note: "{todayData.attendance.remarks}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* LOGGED SHIFT DETAILS STRIP */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "12px",
            borderTop: "1px solid var(--border-subtle)",
            paddingTop: "24px",
            textAlign: "left",
          }}
        >
          <div style={{ background: "var(--bg-surface)", padding: "14px 18px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Check-In Time</div>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-main)", marginTop: "4px", fontFamily: "var(--font-mono)" }}>
              {isCheckedIn ? formatTime(todayData?.attendance?.checkInTime) : "--:--"}
            </div>
          </div>

          <div style={{ background: "var(--bg-surface)", padding: "14px 18px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Check-Out Time</div>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-main)", marginTop: "4px", fontFamily: "var(--font-mono)" }}>
              {isCheckedOut ? formatTime(todayData?.attendance?.checkOutTime) : "--:--"}
            </div>
          </div>

          <div style={{ background: "var(--bg-surface)", padding: "14px 18px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Shift Duration</div>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--primary)", marginTop: "4px", fontFamily: "var(--font-mono)" }}>
              {isCheckedOut
                ? `${todayData?.attendance?.totalHours || 0} hrs`
                : activeDuration
                ? activeDuration
                : "--"}
            </div>
          </div>

          <div style={{ background: "var(--bg-surface)", padding: "14px 18px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Work Mode</div>
            <div style={{ marginTop: "4px" }}>
              <span className={`badge-workmode ${(todayData?.attendance?.workMode || workMode).toLowerCase()}`}>
                {(todayData?.attendance?.workMode || workMode) === "Remote" ? "🌐 Remote" : "🏢 Office"}
              </span>
            </div>
          </div>

          <div style={{ background: "var(--bg-surface)", padding: "14px 18px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Audit Status</div>
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
          border: "1px solid var(--border-subtle)",
        }}
      >
        <h3 style={{ fontSize: "16px", color: "var(--text-main)", marginBottom: "10px" }}>Corporate Attendance Policy</h3>
        <ul style={{ color: "var(--text-body)", fontSize: "13.5px", lineHeight: "1.7", paddingLeft: "20px" }}>
          <li>
            <strong>Standard Shift Target:</strong> 8.5 Hours standard working day (09:00 AM – 05:30 PM).
          </li>
          <li>
            <strong>Grace Cutoff:</strong> Punches recorded before 09:30 AM are audited as <strong>Present</strong>. Punches after 09:30 AM are classified as <strong>Late</strong>.
          </li>
          <li>
            <strong>Half-Day Policy:</strong> Shifts with total logged duration under 4.5 hours are classified as <strong>Half-Day</strong>.
          </li>
          <li>
            <strong>Remote Work:</strong> Working from home or out of office? Simply select <em>Working Remotely</em> when checking in.
          </li>
        </ul>
      </div>
    </div>
  );
}
