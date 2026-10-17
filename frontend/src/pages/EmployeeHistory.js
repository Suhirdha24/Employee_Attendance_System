import React, { useEffect, useState, useMemo } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import API from "../api/api";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

export default function EmployeeHistory() {
  const auth = useSelector((s) => s.auth);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("table"); // 'table' | 'calendar'
  const [searchDate, setSearchDate] = useState("");
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(new Date());

  const formatTime = (isoString) => {
    if (!isoString) return "-";
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const loadHistory = async () => {
    try {
      setLoading(true);
      const res = await API.get("/attendance/my-history");
      setHistory(res.data);
    } catch (err) {
      console.error("Load history error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  // Filtered table records
  const filteredHistory = useMemo(() => {
    if (!searchDate) return history;
    return history.filter((h) => h.date.includes(searchDate));
  }, [history, searchDate]);

  // Map history by date string (YYYY-MM-DD)
  const historyMap = useMemo(() => {
    const map = new Map();
    history.forEach((h) => {
      map.set(h.date, h);
    });
    return map;
  }, [history]);

  // Calendar tile class generator
  const getTileClassName = ({ date, view }) => {
    if (view !== "month") return "";
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const dateStr = `${yyyy}-${mm}-${dd}`;

    const record = historyMap.get(dateStr);
    if (!record) return "";

    if (record.status === "present") return "tile-present";
    if (record.status === "late") return "tile-late";
    if (record.status === "half-day") return "tile-half-day";
    if (record.status === "absent") return "tile-absent";
    return "";
  };

  // Selected date record on calendar
  const selectedRecord = useMemo(() => {
    const yyyy = selectedCalendarDate.getFullYear();
    const mm = String(selectedCalendarDate.getMonth() + 1).padStart(2, "0");
    const dd = String(selectedCalendarDate.getDate()).padStart(2, "0");
    const dateStr = `${yyyy}-${mm}-${dd}`;
    return historyMap.get(dateStr) || null;
  }, [selectedCalendarDate, historyMap]);

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
      {/* HEADER BAR */}
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
          <h1 style={{ fontSize: "26px" }}>Attendance History & Calendar</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>
            Review past attendance records, shift durations, and monthly heatmaps
          </p>
        </div>

        {/* VIEW TOGGLE */}
        <div style={{ display: "flex", gap: "8px", background: "var(--bg-surface)", padding: "4px", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
          <button
            className={`btn btn-sm ${view === "table" ? "btn-primary" : "btn-outline"}`}
            style={{ border: "none" }}
            onClick={() => setView("table")}
          >
            📋 Table View
          </button>
          <button
            className={`btn btn-sm ${view === "calendar" ? "btn-primary" : "btn-outline"}`}
            style={{ border: "none" }}
            onClick={() => setView("calendar")}
          >
            📅 Calendar Heatmap
          </button>
        </div>
      </div>

      {/* TABLE VIEW */}
      {view === "table" && (
        <div className="card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "14px",
              marginBottom: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                className="form-input"
                type="text"
                placeholder="Filter by date (YYYY-MM)..."
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                style={{ width: "240px", padding: "8px 12px" }}
              />
              {searchDate && (
                <button className="btn btn-outline btn-sm" onClick={() => setSearchDate("")}>
                  Clear
                </button>
              )}
            </div>

            <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              Showing {filteredHistory.length} of {history.length} records
            </div>
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
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", padding: "30px", color: "var(--text-dim)" }}>
                      {loading ? "Loading attendance records..." : "No attendance records match the filter."}
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((h) => (
                    <tr key={h._id}>
                      <td style={{ fontWeight: 600 }}>{h.date}</td>
                      <td>{formatTime(h.checkInTime)}</td>
                      <td>{formatTime(h.checkOutTime)}</td>
                      <td>{h.totalHours ? `${h.totalHours} hrs` : "-"}</td>
                      <td>
                        <span className={`badge badge-${h.status}`}>
                          {h.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CALENDAR HEATMAP VIEW */}
      {view === "calendar" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
          <div className="card">
            <h2 style={{ fontSize: "18px", marginBottom: "16px" }}>Monthly Heatmap</h2>
            <Calendar
              onChange={setSelectedCalendarDate}
              value={selectedCalendarDate}
              tileClassName={getTileClassName}
            />

            {/* LEGEND */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginTop: "20px", paddingTop: "16px", borderTop: "1px solid var(--border-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-muted)" }}>
                <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: "rgba(16, 185, 129, 0.4)", border: "1px solid #34d399" }} />
                <span>Present</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-muted)" }}>
                <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: "rgba(245, 158, 11, 0.4)", border: "1px solid #fbbf24" }} />
                <span>Late (>09:30 AM)</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-muted)" }}>
                <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: "rgba(168, 85, 247, 0.4)", border: "1px solid #c084fc" }} />
                <span>Half-Day (<4.5 hrs)</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-muted)" }}>
                <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: "rgba(239, 68, 68, 0.2)", border: "1px solid #f87171" }} />
                <span>Absent</span>
              </div>
            </div>
          </div>

          {/* SELECTED DATE DETAILS DRAWER */}
          <div className="card glass-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <span style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                Selected Date Log
              </span>
              <h2 style={{ fontSize: "22px", marginTop: "4px", marginBottom: "16px" }}>
                {selectedCalendarDate.toLocaleDateString(undefined, {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </h2>

              {selectedRecord ? (
                <div style={{ background: "var(--bg-surface)", padding: "18px", borderRadius: "12px", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>Status</span>
                    <span className={`badge badge-${selectedRecord.status}`}>
                      {selectedRecord.status}
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Check-In</span>
                      <p style={{ fontSize: "16px", fontWeight: 700, color: "#fff", marginTop: "2px" }}>
                        {formatTime(selectedRecord.checkInTime)}
                      </p>
                    </div>

                    <div>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Check-Out</span>
                      <p style={{ fontSize: "16px", fontWeight: 700, color: "#fff", marginTop: "2px" }}>
                        {formatTime(selectedRecord.checkOutTime)}
                      </p>
                    </div>

                    <div style={{ gridColumn: "span 2", marginTop: "4px" }}>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Hours Worked</span>
                      <p style={{ fontSize: "20px", fontWeight: 800, color: "var(--accent-cyan)", marginTop: "2px" }}>
                        {selectedRecord.totalHours ? `${selectedRecord.totalHours} hrs` : "In Progress"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ padding: "30px 16px", textAlign: "center", background: "var(--bg-surface)", borderRadius: "12px", color: "var(--text-dim)" }}>
                  <div style={{ fontSize: "28px", marginBottom: "8px" }}>📅</div>
                  <p style={{ fontSize: "14px" }}>No attendance record registered for this date.</p>
                  <p style={{ fontSize: "12px", marginTop: "4px" }}>Select another date from the calendar to view its log.</p>
                </div>
              )}
            </div>

            <div style={{ marginTop: "20px" }}>
              <Link to="/employee" className="btn btn-outline" style={{ width: "100%", textDecoration: "none" }}>
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
