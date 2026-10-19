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

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Format time (HH:mm)
  const formatTime = (isoString) => {
    if (!isoString) return "-";
    const d = new Date(isoString);
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
      const res = await API.post("/attendance/checkin");
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
    <div style={{ width: "100%", paddingBottom: "32px" }}>
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
          background: "#ffffff",
          border: "1px solid #e2e8f0",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span style={{ color: "var(--accent-blue)", fontSize: "13px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              {user?.department || "General"} Department
            </span>
            <span style={{ color: "#cbd5e1" }}>•</span>
            <span style={{ color: "#64748b", fontSize: "13px" }}>ID: {user?.employeeId}</span>
          </div>
          <h1 style={{ fontSize: "26px", color: "#0f172a" }}>
            {greeting}, {user?.name}
          </h1>
          <p style={{ color: "#64748b", fontSize: "14px", marginTop: "4px" }}>
            Employee workstation & shift dashboard
          </p>
        </div>

        {/* LIVE CLOCK DISPLAY */}
        <div
          style={{
            background: "#f8fafc",
            padding: "14px 22px",
            borderRadius: "6px",
            border: "1px solid #e2e8f0",
            textAlign: "right",
          }}
        >
          <div
            style={{
              fontFamily: "monospace",
              fontSize: "24px",
              fontWeight: "700",
              color: "#0f172a",
              letterSpacing: "0.05em",
            }}
          >
            {currentTime.toLocaleTimeString([], { hour12: true })}
          </div>
          <div style={{ color: "#64748b", fontSize: "12px", marginTop: "2px" }}>
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
          border: "1px solid #e2e8f0",
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
            <span style={{ fontSize: "11px", textTransform: "uppercase", color: "#64748b", fontWeight: 700, letterSpacing: "0.05em" }}>
              Today's Shift Status
            </span>
            <h2 style={{ fontSize: "18px", color: "#0f172a", marginTop: "2px" }}>Daily Attendance Record</h2>
          </div>

          <div>
            {!isCheckedIn && <span className="badge badge-absent">Not Checked In</span>}
            {isCheckedIn && !isCheckedOut && (
              <span className={`badge ${todayData?.status === "late" ? "badge-late" : "badge-present"}`}>
                ● Active Shift ({todayData?.status})
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
            background: "#f8fafc",
            padding: "16px",
            borderRadius: "6px",
            border: "1px solid #e2e8f0",
          }}
        >
          <div>
            <span style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Check-In Timestamp</span>
            <p style={{ fontSize: "17px", fontWeight: 700, color: "#0f172a", marginTop: "4px" }}>
              {formatTime(todayData?.attendance?.checkInTime)}
            </p>
          </div>

          <div>
            <span style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Check-Out Timestamp</span>
            <p style={{ fontSize: "17px", fontWeight: 700, color: "#0f172a", marginTop: "4px" }}>
              {formatTime(todayData?.attendance?.checkOutTime)}
            </p>
          </div>

          <div>
            <span style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Shift Duration</span>
            <p style={{ fontSize: "17px", fontWeight: 700, color: "#0f172a", marginTop: "4px" }}>
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
            <span style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Policy Standard</span>
            <p style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
              Grace punch: 09:30 AM
            </p>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
          <button
            className="btn btn-success"
            style={{ padding: "12px 24px", minWidth: "160px" }}
            onClick={handleCheckIn}
            disabled={isCheckedIn || actionLoading}
          >
            {actionLoading ? "Processing..." : isCheckedIn ? "✓ Checked In" : "▶ Mark Check-In"}
          </button>

          <button
            className="btn btn-primary"
            style={{ padding: "12px 24px", minWidth: "160px", background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)" }}
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
              📅 View History →
            </Link>
          </div>
        </div>
      </div>

      {/* METRIC STATS GRID */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Attendance Rate</span>
            <span className="stat-icon">📈</span>
          </div>
          <div className="stat-value">{summary?.attendancePercentage || 100}%</div>
          <span className="stat-subtitle">Calculated on recorded shifts</span>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Days Present</span>
            <span className="stat-icon">✅</span>
          </div>
          <div className="stat-value">{summary?.presentCount || 0}</div>
          <span className="stat-subtitle">Full working days</span>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Late Arrivals</span>
            <span className="stat-icon">⏰</span>
          </div>
          <div className="stat-value" style={{ color: "#fbbf24" }}>
            {summary?.lateCount || 0}
          </div>
          <span className="stat-subtitle">After 09:30 AM grace period</span>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Total Hours Worked</span>
            <span className="stat-icon">⏱️</span>
          </div>
          <div className="stat-value" style={{ color: "var(--accent-cyan)" }}>
            {summary?.totalHours || 0}h
          </div>
          <span className="stat-subtitle">Avg {summary?.avgHours || 0}h per working day</span>
        </div>
      </div>

      {/* RECENT ACTIVITY TABLE */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2 style={{ fontSize: "18px" }}>Recent Attendance Logs</h2>
          <Link to="/employee/history" style={{ fontSize: "13px", fontWeight: 600 }}>
            See All Logs
          </Link>
        </div>

        <div className="table-wrapper">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Check-In</th>
                <th>Check-Out</th>
                <th>Working Hours</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {!summary?.recentRecords || summary.recentRecords.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "30px", color: "var(--text-dim)" }}>
                    No previous attendance records found. Check in today to start your record!
                  </td>
                </tr>
              ) : (
                summary.recentRecords.map((r) => (
                  <tr key={r._id}>
                    <td style={{ fontWeight: 600 }}>{r.date}</td>
                    <td>{formatTime(r.checkInTime)}</td>
                    <td>{formatTime(r.checkOutTime)}</td>
                    <td>{r.totalHours ? `${r.totalHours} hrs` : "-"}</td>
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
