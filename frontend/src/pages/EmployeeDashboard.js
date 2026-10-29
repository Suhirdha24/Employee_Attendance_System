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

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Format time (HH:mm)
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
      console.error("Dashboard load error:", err);
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
      const res = await API.post("/attendance/checkin", { workMode });
      addToast(res.data?.message || "Check-in recorded!", "success");
      loadData();
    } catch (err) {
      addToast(err.response?.data?.message || "Check-in failed", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
      const res = await API.post("/attendance/checkout");
      addToast(res.data?.message || "Check-out recorded!", "success");
      loadData();
    } catch (err) {
      addToast(err.response?.data?.message || "Check-out failed", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Compute live active session duration if checked in and not checked out
  const activeDuration = useMemo(() => {
    if (todayData?.attendance?.checkInTime && !todayData?.attendance?.checkOutTime) {
      const start = new Date(todayData.attendance.checkInTime);
      const diffMs = Math.max(0, currentTime - start);
      const totalMins = Math.floor(diffMs / (1000 * 60));
      const hours = Math.floor(totalMins / 60);
      const mins = totalMins % 60;
      const secs = Math.floor((diffMs / 1000) % 60);
      return `${hours}h ${mins}m ${secs}s`;
    }
    return null;
  }, [todayData, currentTime]);

  const greeting = useMemo(() => {
    const hr = currentTime.getHours();
    if (hr < 12) return "Good Morning";
    if (hr < 17) return "Good Afternoon";
    return "Good Evening";
  }, [currentTime]);

  const isCheckedIn = Boolean(todayData?.attendance?.checkInTime);
  const isCheckedOut = Boolean(todayData?.attendance?.checkOutTime);

  return (
    <div style={{ width: "100%", paddingBottom: "36px" }}>
      {/* HEADER GREETING & DIGITAL CLOCK */}
      <div
        className="card"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "20px",
          marginBottom: "24px",
          background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span style={{ color: "var(--primary)", fontSize: "12.5px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {user?.department || "General"} Department
            </span>
            <span style={{ color: "var(--border-medium)" }}>•</span>
            <span style={{ color: "var(--text-muted)", fontSize: "13px", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
              {user?.employeeId}
            </span>
          </div>
          <h1 style={{ fontSize: "28px", color: "var(--text-main)", letterSpacing: "-0.02em" }}>
            {greeting}, {user?.name}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>
            Staff workstation attendance telemetry & shift portal
          </p>
        </div>

        {/* LIVE CLOCK DISPLAY */}
        <div
          style={{
            background: "#ffffff",
            padding: "16px 24px",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border-subtle)",
            boxShadow: "var(--shadow-sm)",
            textAlign: "right",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "26px",
              fontWeight: "700",
              color: "var(--text-main)",
              letterSpacing: "0.04em",
            }}
          >
            {currentTime.toLocaleTimeString([], { hour12: true })}
          </div>
          <div style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "3px", fontWeight: 500 }}>
            {currentTime.toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </div>
        </div>
      </div>

      {/* TODAY'S ATTENDANCE ACTION CARD */}
      <div
        className="card"
        style={{
          marginBottom: "24px",
          borderTop: "4px solid var(--primary)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "20px",
          }}
        >
          <div>
            <span style={{ fontSize: "11.5px", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 700, letterSpacing: "0.06em" }}>
              Workstation Shift Terminal
            </span>
            <h2 style={{ fontSize: "20px", color: "var(--text-main)", marginTop: "2px" }}>
              Today's Attendance Status
            </h2>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            {/* WORK MODE CHIPS (BEFORE CHECK IN) */}
            {!isCheckedIn ? (
              <div style={{ display: "inline-flex", background: "var(--bg-surface)", padding: "3px", borderRadius: "var(--radius-full)", border: "1px solid var(--border-medium)" }}>
                <button
                  type="button"
                  onClick={() => setWorkMode("Office")}
                  style={{
                    padding: "4px 12px",
                    borderRadius: "var(--radius-full)",
                    border: "none",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    background: workMode === "Office" ? "var(--primary)" : "transparent",
                    color: workMode === "Office" ? "#ffffff" : "var(--text-muted)",
                    transition: "all 0.15s ease",
                  }}
                >
                  🏢 Office
                </button>
                <button
                  type="button"
                  onClick={() => setWorkMode("Remote")}
                  style={{
                    padding: "4px 12px",
                    borderRadius: "var(--radius-full)",
                    border: "none",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    background: workMode === "Remote" ? "var(--primary)" : "transparent",
                    color: workMode === "Remote" ? "#ffffff" : "var(--text-muted)",
                    transition: "all 0.15s ease",
                  }}
                >
                  🌐 Remote
                </button>
              </div>
            ) : (
              <span className={`badge-workmode ${(todayData?.attendance?.workMode || workMode).toLowerCase()}`}>
                {(todayData?.attendance?.workMode || workMode) === "Remote" ? "🌐 Remote" : "🏢 In-Office"}
              </span>
            )}

            {!isCheckedIn && <span className="badge badge-absent">Not Clocked In</span>}
            {isCheckedIn && !isCheckedOut && (
              <span className={`badge ${todayData?.status === "late" ? "badge-late" : "badge-present"}`} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <span className="pulse-indicator"></span>
                Active Shift ({todayData?.status})
              </span>
            )}
            {isCheckedOut && (
              <span className={`badge ${todayData?.status === "half-day" ? "badge-half-day" : "badge-present"}`}>
                ✓ Completed ({todayData?.status})
              </span>
            )}
          </div>
        </div>

        {/* DETAILS GRID */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "14px",
            marginBottom: "20px",
            background: "var(--bg-surface)",
            padding: "18px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <div>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Check-In Time</span>
            <p style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-main)", marginTop: "4px", fontFamily: "var(--font-mono)" }}>
              {formatTime(todayData?.attendance?.checkInTime)}
            </p>
          </div>

          <div>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Check-Out Time</span>
            <p style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-main)", marginTop: "4px", fontFamily: "var(--font-mono)" }}>
              {formatTime(todayData?.attendance?.checkOutTime)}
            </p>
          </div>

          <div>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Shift Duration</span>
            <p style={{ fontSize: "18px", fontWeight: 700, color: "var(--primary)", marginTop: "4px", fontFamily: "var(--font-mono)" }}>
              {activeDuration ? (
                <span>{activeDuration}</span>
              ) : todayData?.attendance?.totalHours ? (
                `${todayData.attendance.totalHours} hrs`
              ) : (
                "-"
              )}
            </p>
          </div>

          <div>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Grace Standard</span>
            <p style={{ fontSize: "13.5px", color: "var(--text-body)", marginTop: "4px", fontWeight: 500 }}>
              Cutoff: 09:30 AM
            </p>
          </div>
        </div>

        {todayData?.attendance?.remarks && (
          <div style={{ background: "#ffffff", padding: "12px 16px", borderRadius: "var(--radius-sm)", fontSize: "13px", color: "var(--text-body)", marginBottom: "20px", border: "1px solid var(--border-subtle)" }}>
            <strong>Shift Note:</strong> {todayData.attendance.remarks}
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", alignItems: "center" }}>
          <button
            className="btn btn-success btn-lg"
            onClick={handleCheckIn}
            disabled={isCheckedIn || actionLoading}
          >
            {actionLoading ? "Processing..." : isCheckedIn ? "✓ Checked In" : "▶ Mark Check-In"}
          </button>

          <button
            className="btn btn-primary btn-lg"
            onClick={handleCheckOut}
            disabled={!isCheckedIn || isCheckedOut || actionLoading}
          >
            {actionLoading ? "Processing..." : isCheckedOut ? "✓ Checked Out" : "⏹ Mark Check-Out"}
          </button>

          <div style={{ marginLeft: "auto", display: "flex", gap: "10px" }}>
            <Link
              to="/employee/mark-attendance"
              className="btn btn-outline"
              style={{ textDecoration: "none" }}
            >
              ⏱ Punch Terminal
            </Link>
            <Link
              to="/employee/history"
              className="btn btn-outline"
              style={{ textDecoration: "none" }}
            >
              📅 View Timesheet →
            </Link>
          </div>
        </div>
      </div>

      {/* METRIC STATS GRID */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Attendance Rate</span>
            <div className="stat-icon-wrap" style={{ background: "#ecfdf5", color: "#059669" }}>📈</div>
          </div>
          <div className="stat-value">{summary?.attendancePercentage || 100}%</div>
          <span className="stat-subtitle">Weighted compliance rating</span>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Days Present</span>
            <div className="stat-icon-wrap" style={{ background: "#eef2ff", color: "#4f46e5" }}>✅</div>
          </div>
          <div className="stat-value">{summary?.presentCount || 0}</div>
          <span className="stat-subtitle">Full working days completed</span>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Late Arrivals</span>
            <div className="stat-icon-wrap" style={{ background: "#fffbeb", color: "#d97706" }}>⏰</div>
          </div>
          <div className="stat-value" style={{ color: "#d97706" }}>
            {summary?.lateCount || 0}
          </div>
          <span className="stat-subtitle">Arrivals after 09:30 AM cutoff</span>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Total Hours Worked</span>
            <div className="stat-icon-wrap" style={{ background: "#f0f9ff", color: "#0284c7" }}>⏱️</div>
          </div>
          <div className="stat-value" style={{ color: "var(--accent-cyan)" }}>
            {summary?.totalHours || 0}h
          </div>
          <span className="stat-subtitle">Avg {summary?.avgHours || 0}h per working day</span>
        </div>
      </div>

      {/* RECENT ACTIVITY TABLE */}
      <div className="card" style={{ padding: "0", overflow: "hidden" }}>
        <div style={{ padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-subtle)" }}>
          <div>
            <h3 style={{ fontSize: "17px", color: "var(--text-main)" }}>Recent Shift Records</h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
              Latest 10 verified shift punches and calculated hours
            </p>
          </div>
          <Link to="/employee/history" className="btn btn-outline btn-sm">
            See All Logs →
          </Link>
        </div>

        <div className="table-wrapper" style={{ border: "none" }}>
          <table className="modern-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Mode</th>
                <th>Check-In</th>
                <th>Check-Out</th>
                <th>Working Hours</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {!summary?.recentRecords || summary.recentRecords.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "36px", color: "var(--text-muted)" }}>
                    No previous attendance records found. Clock in today to begin your history!
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
