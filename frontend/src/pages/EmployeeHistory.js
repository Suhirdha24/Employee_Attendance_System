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
  const [view, setView] = useState("calendar"); // Default to calendar view as shown in user flow
  const [searchDate, setSearchDate] = useState("");
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(new Date());

  const formatTime = (isoString) => {
    if (!isoString) return "-";
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
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
    <div style={{ width: "100%", paddingBottom: "48px" }}>
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
          <span style={{ fontSize: "12px", color: "var(--primary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            My Attendance
          </span>
          <h1 style={{ fontSize: "28px", marginTop: "2px", color: "var(--text-main)" }}>
            Attendance History
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "2px" }}>
            Review your past attendance records and monthly timesheets.
          </p>
        </div>

        {/* VIEW TOGGLE BUTTONS */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ display: "inline-flex", background: "var(--bg-surface)", padding: "3px", borderRadius: "6px", border: "1px solid var(--border-subtle)" }}>
            <button
              onClick={() => setView("calendar")}
              className={`btn btn-sm ${view === "calendar" ? "btn-primary" : "btn-outline"}`}
              style={{ border: "none", boxShadow: view === "calendar" ? "var(--shadow-sm)" : "none" }}
            >
              📅 Calendar
            </button>
            <button
              onClick={() => setView("table")}
              className={`btn btn-sm ${view === "table" ? "btn-primary" : "btn-outline"}`}
              style={{ border: "none", boxShadow: view === "table" ? "var(--shadow-sm)" : "none" }}
            >
              📋 Table
            </button>
          </div>

          <Link to="/employee" className="btn btn-outline btn-sm" style={{ textDecoration: "none" }}>
            ← Dashboard
          </Link>
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
              marginBottom: "20px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <input
                type="date"
                className="form-input"
                style={{ width: "200px" }}
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
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
                  <th>Date</th>
                  <th>Work Mode</th>
                  <th>Check-In</th>
                  <th>Check-Out</th>
                  <th>Hours</th>
                  <th>Status</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "36px", color: "var(--text-dim)" }}>
                      {loading ? "Loading attendance records from directory..." : "No attendance logs match the specified filter."}
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((h) => (
                    <tr key={h._id}>
                      <td style={{ fontWeight: 600, color: "var(--text-main)" }}>{h.date}</td>
                      <td>
                        <span className={`badge-workmode ${(h.workMode || "Office").toLowerCase()}`}>
                          {h.workMode === "Remote" ? "🌐 Remote" : "🏢 Office"}
                        </span>
                      </td>
                      <td style={{ fontFamily: "monospace" }}>{formatTime(h.checkInTime)}</td>
                      <td style={{ fontFamily: "monospace" }}>{formatTime(h.checkOutTime)}</td>
                      <td style={{ fontWeight: 600 }}>{h.totalHours ? `${h.totalHours} hrs` : "-"}</td>
                      <td>
                        <span className={`status-pill ${h.status}`}>
                          {h.status}
                        </span>
                      </td>
                      <td style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>
                        {h.remarks || "-"}
                        {h.modifiedByManager && (
                          <span style={{ display: "block", fontSize: "10.5px", color: "var(--accent-blue)", fontWeight: 600 }}>
                            (Manager Adjusted)
                          </span>
                        )}
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: "24px", alignItems: "stretch" }}>
          {/* LEFT COLUMN: MONTHLY HEATMAP */}
          <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ marginBottom: "16px" }}>
                <span style={{ fontSize: "12px", color: "var(--primary)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.04em" }}>
                  Monthly Overview
                </span>
                <h2 style={{ fontSize: "20px", marginTop: "2px", color: "var(--text-main)" }}>
                  Monthly Attendance Calendar
                </h2>
              </div>

              <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                <Calendar
                  onChange={setSelectedCalendarDate}
                  value={selectedCalendarDate}
                  tileClassName={getTileClassName}
                  maxDate={new Date()}
                />
              </div>
            </div>

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

          {/* RIGHT COLUMN: SELECTED DATE DETAILS DRAWER */}
          <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ marginBottom: "16px" }}>
                <span style={{ fontSize: "12px", color: "var(--primary)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.04em" }}>
                  Selected Shift Log
                </span>
                <h2 style={{ fontSize: "20px", marginTop: "2px", color: "var(--text-main)" }}>
                  {selectedCalendarDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </h2>
              </div>

              {selectedRecord ? (
                <div style={{ background: "var(--bg-surface)", padding: "20px", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <span style={{ color: "var(--text-muted)", fontSize: "13px", fontWeight: 600 }}>Classification Status</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span className={`badge-workmode ${(selectedRecord.workMode || "Office").toLowerCase()}`}>
                        {selectedRecord.workMode === "Remote" ? "🌐 Remote" : "🏢 Office"}
                      </span>
                      <span className={`status-pill ${selectedRecord.status}`}>
                        {selectedRecord.status}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div style={{ background: "#ffffff", padding: "14px", borderRadius: "6px", border: "1px solid var(--border-subtle)" }}>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Check-In Time</span>
                      <p style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-main)", marginTop: "3px", fontFamily: "monospace" }}>
                        {formatTime(selectedRecord.checkInTime)}
                      </p>
                    </div>

                    <div style={{ background: "#ffffff", padding: "14px", borderRadius: "6px", border: "1px solid var(--border-subtle)" }}>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Check-Out Time</span>
                      <p style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-main)", marginTop: "3px", fontFamily: "monospace" }}>
                        {formatTime(selectedRecord.checkOutTime)}
                      </p>
                    </div>

                    <div style={{ gridColumn: "span 2", background: "#ffffff", padding: "16px", borderRadius: "6px", border: "1px solid var(--border-subtle)", marginTop: "4px" }}>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Logged Work Duration</span>
                      <p style={{ fontSize: "22px", fontWeight: 800, color: "var(--primary)", marginTop: "3px" }}>
                        {selectedRecord.totalHours ? `${selectedRecord.totalHours} hrs` : "In Progress"}
                      </p>
                    </div>

                    {selectedRecord.remarks && (
                      <div style={{ gridColumn: "span 2", background: "#ffffff", padding: "12px 16px", borderRadius: "6px", border: "1px solid var(--border-subtle)" }}>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Shift Remarks</span>
                        <p style={{ fontSize: "13px", color: "var(--text-main)", marginTop: "3px" }}>
                          {selectedRecord.remarks}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ padding: "48px 24px", textAlign: "center", background: "var(--bg-surface)", borderRadius: "8px", border: "1px solid var(--border-subtle)", color: "var(--text-muted)" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "#ffffff", border: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", color: "var(--text-muted)" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                  </div>
                  <p style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-main)" }}>No Shift Entry Recorded</p>
                  <p style={{ fontSize: "13px", marginTop: "4px", color: "var(--text-muted)" }}>
                    Select an active calendar date to inspect punch times and hours logged.
                  </p>
                </div>
              )}
            </div>

            <div style={{ marginTop: "24px" }}>
              <Link to="/employee" className="btn btn-outline" style={{ width: "100%", textDecoration: "none", padding: "10px" }}>
                ← Return to Dashboard
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
