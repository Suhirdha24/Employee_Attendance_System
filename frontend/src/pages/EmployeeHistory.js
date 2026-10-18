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
    <div style={{ maxWidth: "1180px", margin: "0 auto", paddingBottom: "48px" }}>
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
          <span style={{ fontSize: "12px", color: "var(--accent-blue)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Personal Attendance Audit
          </span>
          <h1 style={{ fontSize: "26px", marginTop: "2px" }}>Attendance Log & Timesheet</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "2px" }}>
            Audit past punches, verified working durations, and monthly presence heatmaps
          </p>
        </div>

        {/* VIEW TOGGLE */}
        <div style={{ display: "flex", gap: "6px", background: "var(--bg-surface)", padding: "4px", borderRadius: "6px", border: "1px solid var(--border-subtle)" }}>
          <button
            className={`btn btn-sm ${view === "table" ? "btn-primary" : "btn-outline"}`}
            style={{ border: view === "table" ? undefined : "none", background: view === "table" ? undefined : "transparent" }}
            onClick={() => setView("table")}
          >
            Tabular View
          </button>
          <button
            className={`btn btn-sm ${view === "calendar" ? "btn-primary" : "btn-outline"}`}
            style={{ border: view === "calendar" ? undefined : "none", background: view === "calendar" ? undefined : "transparent" }}
            onClick={() => setView("calendar")}
          >
            Calendar Heatmap
          </button>
        </div>
      </div>

      {/* TABLE VIEW */}
      {view === "table" && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div
            style={{
              padding: "18px 24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "14px",
              borderBottom: "1px solid var(--border-subtle)",
              background: "#fafbfc",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                className="input-field"
                type="text"
                placeholder="Filter by date (e.g. 2026-10)..."
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                style={{ width: "240px" }}
              />
              {searchDate && (
                <button className="btn btn-outline btn-sm" onClick={() => setSearchDate("")}>
                  Reset
                </button>
              )}
            </div>

            <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              Displaying <strong>{filteredHistory.length}</strong> of <strong>{history.length}</strong> logged entries
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Shift Date</th>
                  <th>Check-In Time</th>
                  <th>Check-Out Time</th>
                  <th>Verified Duration</th>
                  <th>Compliance Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", padding: "36px", color: "var(--text-dim)" }}>
                      {loading ? "Loading attendance records from directory..." : "No attendance logs match the specified filter."}
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((h) => (
                    <tr key={h._id}>
                      <td style={{ fontWeight: 600, color: "var(--text-main)" }}>{h.date}</td>
                      <td style={{ fontFamily: "monospace" }}>{formatTime(h.checkInTime)}</td>
                      <td style={{ fontFamily: "monospace" }}>{formatTime(h.checkOutTime)}</td>
                      <td style={{ fontWeight: 600 }}>{h.totalHours ? `${h.totalHours} hrs` : "-"}</td>
                      <td>
                        <span className={`status-pill ${h.status}`}>
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "24px" }}>
          <div className="card">
            <h2 style={{ fontSize: "18px", marginBottom: "16px" }}>Monthly Attendance Map</h2>
            <Calendar
              onChange={setSelectedCalendarDate}
              value={selectedCalendarDate}
              tileClassName={getTileClassName}
              maxDate={new Date()}
            />

            {/* LEGEND */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginTop: "20px", paddingTop: "16px", borderTop: "1px solid var(--border-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-muted)" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: "var(--status-present-border)", border: "1px solid var(--status-present-text)" }} />
                <span>Present</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-muted)" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: "var(--status-late-border)", border: "1px solid var(--status-late-text)" }} />
                <span>Late (&gt;09:30)</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-muted)" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: "var(--status-half-border)", border: "1px solid var(--status-half-text)" }} />
                <span>Half-Day (&lt;4.5h)</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-muted)" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: "var(--status-absent-border)", border: "1px solid var(--status-absent-text)" }} />
                <span>Absent</span>
              </div>
            </div>
          </div>

          {/* SELECTED DATE DETAILS DRAWER */}
          <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <span style={{ fontSize: "12px", color: "var(--accent-blue)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.04em" }}>
                Selected Shift Log
              </span>
              <h2 style={{ fontSize: "20px", marginTop: "4px", marginBottom: "18px" }}>
                {selectedCalendarDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </h2>

              {selectedRecord ? (
                <div style={{ background: "var(--bg-surface)", padding: "18px", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>Classification</span>
                    <span className={`status-pill ${selectedRecord.status}`}>
                      {selectedRecord.status}
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div style={{ background: "#ffffff", padding: "12px", borderRadius: "6px", border: "1px solid var(--border-subtle)" }}>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Check-In</span>
                      <p style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-main)", marginTop: "2px", fontFamily: "monospace" }}>
                        {formatTime(selectedRecord.checkInTime)}
                      </p>
                    </div>

                    <div style={{ background: "#ffffff", padding: "12px", borderRadius: "6px", border: "1px solid var(--border-subtle)" }}>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Check-Out</span>
                      <p style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-main)", marginTop: "2px", fontFamily: "monospace" }}>
                        {formatTime(selectedRecord.checkOutTime)}
                      </p>
                    </div>

                    <div style={{ gridColumn: "span 2", background: "#ffffff", padding: "14px", borderRadius: "6px", border: "1px solid var(--border-subtle)", marginTop: "4px" }}>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Logged Work Duration</span>
                      <p style={{ fontSize: "20px", fontWeight: 800, color: "var(--primary)", marginTop: "2px" }}>
                        {selectedRecord.totalHours ? `${selectedRecord.totalHours} hrs` : "In Progress"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ padding: "36px 16px", textAlign: "center", background: "var(--bg-surface)", borderRadius: "8px", border: "1px solid var(--border-subtle)", color: "var(--text-muted)" }}>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-main)" }}>No Shift Entry Recorded</p>
                  <p style={{ fontSize: "12px", marginTop: "4px" }}>Click on any active calendar day to inspect detailed punch timings.</p>
                </div>
              )}
            </div>

            <div style={{ marginTop: "20px" }}>
              <Link to="/employee" className="btn btn-outline" style={{ width: "100%", textDecoration: "none" }}>
                ← Return to Dashboard
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
