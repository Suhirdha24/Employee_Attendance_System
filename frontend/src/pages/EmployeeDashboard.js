import React, { useEffect, useState, useMemo } from "react";
import API from "../api/api";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useToast } from "../components/Toast";

export default function EmployeeDashboard() {
  const auth = useSelector((state) => state.auth);
  const user = auth?.user;
  const { addToast } = useToast();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayData, setTodayData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [workMode, setWorkMode] = useState("Office");
  const [remarks, setRemarks] = useState("");

  // Live clock updating every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (isoString) => {
    if (!isoString) return "-";
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [todayRes, summaryRes] = await Promise.all([
        API.get("/attendance/today"),
        API.get("/attendance/my-summary"),
      ]);
      setTodayData(todayRes.data);
      setSummary(summaryRes.data);
      if (todayRes.data?.attendance?.workMode) {
        setWorkMode(todayRes.data.attendance.workMode);
      }
    } catch (err) {
      console.error("Dashboard data load error:", err);
      addToast("Failed to load attendance records", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      const res = await API.post("/attendance/checkin", { workMode, remarks });
      addToast(res.data?.message || "Check-in successful! Have a great day.", "success");
      setRemarks("");
      await loadData();
    } catch (err) {
      addToast(err.response?.data?.message || "Check-in failed. Please try again.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
      const res = await API.post("/attendance/checkout", { remarks });
      addToast(res.data?.message || "Check-out successful! Great job today.", "success");
      setRemarks("");
      await loadData();
    } catch (err) {
      addToast(err.response?.data?.message || "Check-out failed. Please try again.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Compute live active duration
  const activeDuration = useMemo(() => {
    if (todayData?.attendance?.checkInTime && !todayData?.attendance?.checkOutTime) {
      const start = new Date(todayData.attendance.checkInTime);
      const diffMs = Math.max(0, currentTime - start);
      const totalSecs = Math.floor(diffMs / 1000);
      const hours = Math.floor(totalSecs / 3600);
      const mins = Math.floor((totalSecs % 3600) / 60);
      const secs = totalSecs % 60;
      return `${String(hours).padStart(2, "0")}h ${String(mins).padStart(2, "0")}m ${String(secs).padStart(2, "0")}s`;
    }
    return null;
  }, [todayData, currentTime]);

  const greeting = useMemo(() => {
    const hr = currentTime.getHours();
    if (hr < 12) return "Good morning";
    if (hr < 17) return "Good afternoon";
    return "Good evening";
  }, [currentTime]);

  const isCheckedIn = Boolean(todayData?.attendance?.checkInTime);
  const isCheckedOut = Boolean(todayData?.attendance?.checkOutTime);

  return (
    <div style={{ width: "100%", paddingBottom: "40px" }}>
      {/* 1. TOP GREETING & DIGITAL CLOCK */}
      <div
        className="card"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "24px",
          background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "var(--primary-light)",
              color: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              fontWeight: 800,
              border: "1px solid var(--primary-border)",
            }}
          >
            {user?.name?.charAt(0) || "U"}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span style={{ color: "var(--primary)", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                {user?.department || "General"}
              </span>
              <span style={{ color: "var(--border-medium)" }}>•</span>
              <span style={{ color: "var(--text-muted)", fontSize: "12px", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                {user?.employeeId}
              </span>
            </div>
            <h1 style={{ fontSize: "24px", color: "var(--text-main)", letterSpacing: "-0.02em" }}>
              {greeting}, {user?.name?.split(" ")[0] || "Employee"}!
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "2px" }}>
              Here is your attendance summary and shift details for today.
            </p>
          </div>
        </div>

        {/* LIVE TIME BADGE */}
        <div
          style={{
            background: "#ffffff",
            padding: "12px 20px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-subtle)",
            boxShadow: "var(--shadow-xs)",
            textAlign: "right",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "22px",
              fontWeight: "700",
              color: "var(--text-main)",
              letterSpacing: "0.03em",
            }}
          >
            {currentTime.toLocaleTimeString([], { hour12: true })}
          </div>
          <div style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "2px", fontWeight: 500 }}>
            {currentTime.toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </div>
        </div>
      </div>

      {/* 2. MAIN ATTENDANCE ACTION CARD (THE CENTRAL ACTION BOX) */}
      <div
        className="card"
        style={{
          marginBottom: "24px",
          borderTop: `4px solid ${
            isCheckedOut
              ? "#10b981"
              : isCheckedIn
              ? "#3b82f6"
              : "var(--primary)"
          }`,
          boxShadow: "var(--shadow-md)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "18px" }}>
          <div>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Today's Attendance
            </span>
            <h2 style={{ fontSize: "20px", color: "var(--text-main)", marginTop: "2px" }}>
              {!isCheckedIn
                ? "Ready to Start Your Shift?"
                : !isCheckedOut
                ? "You Are Currently Checked In"
                : "Shift Completed for Today"}
            </h2>
          </div>

          {/* STATUS PILL */}
          <div>
            {!isCheckedIn && (
              <span className="badge badge-absent" style={{ padding: "6px 14px", fontSize: "13px" }}>
                Not Checked In Yet
              </span>
            )}
            {isCheckedIn && !isCheckedOut && (
              <span className={`badge ${todayData?.status === "late" ? "badge-late" : "badge-present"}`} style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 14px", fontSize: "13px" }}>
                <span className="pulse-indicator"></span>
                On Shift ({todayData?.status === "late" ? "Late Arrival" : "On Time"})
              </span>
            )}
            {isCheckedOut && (
              <span className="badge badge-present" style={{ padding: "6px 14px", fontSize: "13px" }}>
                ✓ Completed ({todayData?.status})
              </span>
            )}
          </div>
        </div>

        {/* WORK MODE SELECTION (WHEN NOT CHECKED IN) */}
        {!isCheckedIn && (
          <div style={{ marginBottom: "20px" }}>
            <label className="form-label" style={{ marginBottom: "8px" }}>
              Select where you are working today:
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", maxWidth: "480px" }}>
              <button
                type="button"
                className={`workmode-btn ${workMode === "Office" ? "active-office" : ""}`}
                onClick={() => setWorkMode("Office")}
              >
                <span style={{ fontSize: "18px" }}>🏢</span>
                <span>Working in Office</span>
              </button>
              <button
                type="button"
                className={`workmode-btn ${workMode === "Remote" ? "active-remote" : ""}`}
                onClick={() => setWorkMode("Remote")}
              >
                <span style={{ fontSize: "18px" }}>🌐</span>
                <span>Working Remotely</span>
              </button>
            </div>
          </div>
        )}

        {/* CURRENT SHIFT DETAILS (WHEN ACTIVE OR COMPLETED) */}
        {isCheckedIn && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "12px",
              background: "var(--bg-surface)",
              padding: "16px 20px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-subtle)",
              marginBottom: "20px",
            }}
          >
            <div>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Work Mode</span>
              <p style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-main)", marginTop: "3px" }}>
                {(todayData?.attendance?.workMode || workMode) === "Remote" ? "🌐 Remote" : "🏢 Office"}
              </p>
            </div>

            <div>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Check-In Time</span>
              <p style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-main)", marginTop: "3px", fontFamily: "var(--font-mono)" }}>
                {formatTime(todayData?.attendance?.checkInTime)}
              </p>
            </div>

            <div>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Check-Out Time</span>
              <p style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-main)", marginTop: "3px", fontFamily: "var(--font-mono)" }}>
                {formatTime(todayData?.attendance?.checkOutTime)}
              </p>
            </div>

            <div>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                {!isCheckedOut ? "Elapsed Time" : "Total Time"}
              </span>
              <p style={{ fontSize: "16px", fontWeight: 700, color: "var(--primary)", marginTop: "3px", fontFamily: "var(--font-mono)" }}>
                {activeDuration ? (
                  <span>{activeDuration}</span>
                ) : todayData?.attendance?.totalHours ? (
                  `${todayData.attendance.totalHours} hrs`
                ) : (
                  "-"
                )}
              </p>
            </div>
          </div>
        )}

        {/* OPTIONAL NOTE INPUT */}
        {!isCheckedOut && (
          <div style={{ marginBottom: "20px" }}>
            <label className="form-label" style={{ fontSize: "12.5px" }}>
              Add a note (optional):
            </label>
            <input
              className="form-input"
              type="text"
              placeholder={!isCheckedIn ? "e.g. Arriving from client visit, transit delay..." : "e.g. Completed daily tasks..."}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              style={{ maxWidth: "560px" }}
            />
          </div>
        )}

        {/* SAVED NOTE DISPLAY */}
        {todayData?.attendance?.remarks && (
          <div style={{ background: "#ffffff", padding: "10px 14px", borderRadius: "var(--radius-sm)", fontSize: "13px", color: "var(--text-body)", marginBottom: "20px", border: "1px solid var(--border-subtle)" }}>
            <strong>Note:</strong> {todayData.attendance.remarks}
          </div>
        )}

        {/* ACTION BUTTONS (PROMINENT & TACTILE) */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          {!isCheckedIn ? (
            <button
              className="btn btn-success btn-lg"
              onClick={handleCheckIn}
              disabled={actionLoading}
              style={{ padding: "14px 32px", fontSize: "15px", fontWeight: 700 }}
            >
              {actionLoading ? "Recording Check-In..." : "▶ Check In for Today"}
            </button>
          ) : !isCheckedOut ? (
            <button
              className="btn btn-primary btn-lg"
              onClick={handleCheckOut}
              disabled={actionLoading}
              style={{ padding: "14px 32px", fontSize: "15px", fontWeight: 700 }}
            >
              {actionLoading ? "Recording Check-Out..." : "⏹ Check Out for Today"}
            </button>
          ) : (
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#059669", fontWeight: 600, fontSize: "14px" }}>
              ✓ You are all done for today. See you tomorrow!
            </div>
          )}

          <div style={{ marginLeft: "auto", display: "flex", gap: "10px" }}>
            <Link to="/employee/history" className="btn btn-outline" style={{ textDecoration: "none" }}>
              📅 View My Timesheet →
            </Link>
          </div>
        </div>
      </div>

      {/* 3. METRIC STATS CARDS */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Attendance Rate</span>
            <div className="stat-icon-wrap" style={{ background: "#ecfdf5", color: "#059669" }}>📈</div>
          </div>
          <div className="stat-value">{summary?.attendancePercentage || 100}%</div>
          <span className="stat-subtitle">Overall attendance score</span>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Days Present</span>
            <div className="stat-icon-wrap" style={{ background: "#eef2ff", color: "#4f46e5" }}>✅</div>
          </div>
          <div className="stat-value">{summary?.presentCount || 0}</div>
          <span className="stat-subtitle">Days attended this period</span>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Late Arrivals</span>
            <div className="stat-icon-wrap" style={{ background: "#fffbeb", color: "#d97706" }}>⏰</div>
          </div>
          <div className="stat-value" style={{ color: "#d97706" }}>
            {summary?.lateCount || 0}
          </div>
          <span className="stat-subtitle">Check-in after 09:30 AM</span>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Total Hours Worked</span>
            <div className="stat-icon-wrap" style={{ background: "#f0f9ff", color: "#0284c7" }}>⏱️</div>
          </div>
          <div className="stat-value" style={{ color: "var(--accent-cyan)" }}>
            {summary?.totalHours || 0}h
          </div>
          <span className="stat-subtitle">Avg {summary?.avgHours || 0}h per work day</span>
        </div>
      </div>

      {/* 4. RECENT ACTIVITY TABLE */}
      <div className="card" style={{ padding: "0", overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-subtle)" }}>
          <div>
            <h3 style={{ fontSize: "17px", color: "var(--text-main)" }}>Recent Attendance Logs</h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
              Your latest 10 shift records
            </p>
          </div>
          <Link to="/employee/history" className="btn btn-outline btn-sm">
            View All →
          </Link>
        </div>

        <div className="table-wrapper" style={{ border: "none" }}>
          <table className="modern-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Work Mode</th>
                <th>Check-In</th>
                <th>Check-Out</th>
                <th>Hours</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {!summary?.recentRecords || summary.recentRecords.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
                    {loading ? "Loading attendance records..." : "No recent attendance records found. Check in today to start!"}
                  </td>
                </tr>
              ) : (
                summary.recentRecords.map((r) => (
                  <tr key={r._id}>
                    <td style={{ fontWeight: 600, color: "var(--text-main)" }}>{r.date}</td>
                    <td>
                      <span className={`badge-workmode ${(r.workMode || "Office").toLowerCase()}`}>
                        {r.workMode === "Remote" ? "🌐 Remote" : "🏢 Office"}
                      </span>
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)" }}>{formatTime(r.checkInTime)}</td>
                    <td style={{ fontFamily: "var(--font-mono)" }}>{formatTime(r.checkOutTime)}</td>
                    <td style={{ fontWeight: 700, color: "var(--text-main)" }}>{r.totalHours ? `${r.totalHours} hrs` : "-"}</td>
                    <td>
                      <span className={`badge badge-${r.status}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
