import React, { useEffect, useState, useMemo } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import API from "../api/api";
import { Link } from "react-router-dom";
import { useToast } from "../components/Toast";

export default function TeamCalendarView() {
  const { addToast } = useToast();

  const [allAttendance, setAllAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [deptFilter, setDeptFilter] = useState("all");

  const formatDateStr = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const formatTime = (isoString) => {
    if (!isoString || isoString === "-") return "-";
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [attRes, todayRes] = await Promise.all([
        API.get("/attendance/all"),
        API.get("/attendance/today-status"),
      ]);

      setAllAttendance(attRes.data);
      setEmployees(todayRes.data);
    } catch (err) {
      console.error("Team calendar load error:", err);
      addToast("Failed to load attendance records", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedDateStr = useMemo(() => formatDateStr(selectedDate), [selectedDate]);

  // Aggregate attendance by date
  const dateMap = useMemo(() => {
    const map = {};
    allAttendance.forEach((item) => {
      if (!map[item.date]) {
        map[item.date] = [];
      }
      map[item.date].push(item);
    });
    return map;
  }, [allAttendance]);

  // Selected date team attendance records
  const selectedDayRecords = useMemo(() => {
    const dayRecords = dateMap[selectedDateStr] || [];

    // Filter by department
    let targetEmployees = employees;
    if (deptFilter !== "all") {
      targetEmployees = targetEmployees.filter(
        (e) => e.department && e.department.toLowerCase() === deptFilter.toLowerCase()
      );
    }

    // Build complete record for each employee on selected date
    return targetEmployees.map((emp) => {
      const match = dayRecords.find(
        (r) =>
          (r.userId && r.userId.toString() === emp.userId?.toString()) ||
          (r.employeeId && r.employeeId === emp.employeeId)
      );

      return {
        userId: emp.userId,
        name: emp.name,
        employeeId: emp.employeeId,
        department: emp.department || "General",
        email: emp.email,
        date: selectedDateStr,
        checkInTime: match ? match.checkInTime : "-",
        checkOutTime: match ? match.checkOutTime : "-",
        totalHours: match ? match.totalHours : "-",
        status: match ? match.status : "absent",
      };
    });
  }, [dateMap, selectedDateStr, employees, deptFilter]);

  // Metrics for selected day
  const dayMetrics = useMemo(() => {
    const total = selectedDayRecords.length;
    const present = selectedDayRecords.filter((r) => r.status === "present").length;
    const late = selectedDayRecords.filter((r) => r.status === "late").length;
    const halfDay = selectedDayRecords.filter((r) => r.status === "half-day").length;
    const absent = selectedDayRecords.filter((r) => r.status === "absent").length;
    const rate = total > 0 ? (((present + late + halfDay * 0.5) / total) * 100).toFixed(0) : 0;

    return { total, present, late, halfDay, absent, rate };
  }, [selectedDayRecords]);

  // Calendar tile decorator
  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const dStr = formatDateStr(date);
      const recs = dateMap[dStr];
      if (!recs || recs.length === 0) return null;

      const presentCount = recs.filter((r) => r.status === "present" || r.status === "late").length;
      const isHigh = presentCount >= 4;
      const isMedium = presentCount >= 2;

      return (
        <div style={{ display: "flex", justifyContent: "center", marginTop: "3px" }}>
          <span
            style={{
              width: "5px",
              height: "5px",
              borderRadius: "50%",
              backgroundColor: isHigh ? "var(--status-present-text)" : isMedium ? "var(--status-late-text)" : "var(--status-absent-text)",
              display: "inline-block",
            }}
          />
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: "100%", paddingBottom: "48px" }}>
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
          <span style={{ fontSize: "12px", color: "var(--primary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Schedule & Availability
          </span>
          <h1 style={{ fontSize: "28px", marginTop: "2px" }}>Team Calendar & Daily Schedule</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "2px" }}>
            Audit daily team turnout, departmental presence rates, and specific shift logs
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Link to="/manager" className="btn btn-outline">
            ← Dashboard
          </Link>
          <Link to="/manager/all-attendance" className="btn btn-outline">
            Attendance Table
          </Link>
          <Link to="/manager/reports" className="btn btn-primary">
            Audit Reports →
          </Link>
        </div>
      </div>

      {/* MAIN TWO-COLUMN LAYOUT */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "24px" }}>
        {/* LEFT COLUMN: INTERACTIVE CALENDAR */}
        <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h2 style={{ fontSize: "18px", color: "var(--text-main)" }}>Select Working Day</h2>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setSelectedDate(new Date())}
            >
              Today
            </button>
          </div>

          <div className="calendar-wrapper" style={{ width: "100%", maxWidth: "420px" }}>
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              tileContent={tileContent}
              maxDate={new Date()}
            />
          </div>

          {/* CALENDAR LEGEND */}
          <div
            style={{
              marginTop: "20px",
              paddingTop: "16px",
              borderTop: "1px solid var(--border-subtle)",
              width: "100%",
              display: "flex",
              justifyContent: "space-around",
              fontSize: "12px",
              color: "var(--text-muted)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#059669" }} />
              High Turnout (&gt;80%)
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#d97706" }} />
              Moderate (50-80%)
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#dc2626" }} />
              Low (&lt;50%)
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SELECTED DAY DRILL-DOWN */}
        <div className="card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
              marginBottom: "18px",
            }}
          >
            <div>
              <span style={{ fontSize: "12px", color: "var(--primary)", fontWeight: 700, textTransform: "uppercase" }}>
                {selectedDate.toLocaleDateString("en-US", { weekday: "long" })}
              </span>
              <h2 style={{ fontSize: "20px", color: "var(--text-main)" }}>{selectedDateStr}</h2>
            </div>

            {/* DEPARTMENT FILTER */}
            <select
              className="input-field"
              style={{ width: "auto", minWidth: "160px" }}
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
            >
              <option value="all">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="UI/UX Design">UI/UX Design</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Marketing">Marketing</option>
              <option value="Finance">Finance</option>
            </select>
          </div>

          {/* DAY METRICS STRIP */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
              gap: "8px",
              marginBottom: "20px",
            }}
          >
            <div style={{ background: "var(--bg-surface)", padding: "10px", borderRadius: "6px", border: "1px solid var(--border-subtle)", textAlign: "center" }}>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Turnout</div>
              <div style={{ fontSize: "18px", fontWeight: 700, marginTop: "2px", color: "var(--primary)" }}>
                {dayMetrics.rate}%
              </div>
            </div>
            <div style={{ background: "var(--status-present-bg)", padding: "10px", borderRadius: "6px", border: "1px solid var(--status-present-border)", textAlign: "center" }}>
              <div style={{ fontSize: "11px", color: "var(--status-present-text)", textTransform: "uppercase" }}>Present</div>
              <div style={{ fontSize: "18px", fontWeight: 700, marginTop: "2px", color: "var(--status-present-text)" }}>
                {dayMetrics.present}
              </div>
            </div>
            <div style={{ background: "var(--status-late-bg)", padding: "10px", borderRadius: "6px", border: "1px solid var(--status-late-border)", textAlign: "center" }}>
              <div style={{ fontSize: "11px", color: "var(--status-late-text)", textTransform: "uppercase" }}>Late</div>
              <div style={{ fontSize: "18px", fontWeight: 700, marginTop: "2px", color: "var(--status-late-text)" }}>
                {dayMetrics.late}
              </div>
            </div>
            <div style={{ background: "var(--status-half-bg)", padding: "10px", borderRadius: "6px", border: "1px solid var(--status-half-border)", textAlign: "center" }}>
              <div style={{ fontSize: "11px", color: "var(--status-half-text)", textTransform: "uppercase" }}>Half-Day</div>
              <div style={{ fontSize: "18px", fontWeight: 700, marginTop: "2px", color: "var(--status-half-text)" }}>
                {dayMetrics.halfDay}
              </div>
            </div>
            <div style={{ background: "var(--status-absent-bg)", padding: "10px", borderRadius: "6px", border: "1px solid var(--status-absent-border)", textAlign: "center" }}>
              <div style={{ fontSize: "11px", color: "var(--status-absent-text)", textTransform: "uppercase" }}>Absent</div>
              <div style={{ fontSize: "18px", fontWeight: 700, marginTop: "2px", color: "var(--status-absent-text)" }}>
                {dayMetrics.absent}
              </div>
            </div>
          </div>

          {/* DAY ATTENDANCE LIST */}
          <div style={{ maxHeight: "380px", overflowY: "auto", border: "1px solid var(--border-medium)", borderRadius: "6px" }}>
            <table className="custom-table" style={{ fontSize: "13px" }}>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>In</th>
                  <th>Out</th>
                  <th>Duration</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                      Loading team attendance...
                    </td>
                  </tr>
                ) : selectedDayRecords.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                      No employee records found for this date.
                    </td>
                  </tr>
                ) : (
                  selectedDayRecords.map((r, idx) => (
                    <tr key={idx}>
                      <td>
                        <div style={{ fontWeight: 600, color: "var(--text-main)" }}>{r.name}</div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "monospace" }}>{r.employeeId}</div>
                      </td>
                      <td>{r.department}</td>
                      <td style={{ fontFamily: "monospace" }}>{formatTime(r.checkInTime)}</td>
                      <td style={{ fontFamily: "monospace" }}>{formatTime(r.checkOutTime)}</td>
                      <td style={{ fontWeight: 600 }}>
                        {typeof r.totalHours === "number" ? `${r.totalHours}h` : r.totalHours}
                      </td>
                      <td>
                        <span className={`status-pill ${r.status}`}>{r.status}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
