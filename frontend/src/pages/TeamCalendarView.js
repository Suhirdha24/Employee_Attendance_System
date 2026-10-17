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
      // Derive list of unique employees
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
        <div style={{ display: "flex", justifyContent: "center", marginTop: "4px" }}>
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: isHigh ? "#10b981" : isMedium ? "#f59e0b" : "#ef4444",
              display: "inline-block",
            }}
          />
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", paddingBottom: "48px" }}>
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
          <span style={{ fontSize: "12px", color: "var(--accent-purple)", fontWeight: 700, textTransform: "uppercase" }}>
            Schedule & Availability
          </span>
          <h1 style={{ fontSize: "30px", marginTop: "2px" }}>Team Calendar View</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "2px" }}>
            Browse day-by-day attendance records, team presence heatmaps, and individual punch logs
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Link to="/manager" className="btn btn-outline">
            ← Dashboard
          </Link>
          <Link to="/manager/all-attendance" className="btn btn-outline">
            All Records Table
          </Link>
          <Link to="/manager/reports" className="btn btn-primary">
            Reports & Analytics →
          </Link>
        </div>
      </div>

      {/* MAIN TWO-COLUMN LAYOUT */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "24px" }}>
        {/* LEFT COLUMN: INTERACTIVE CALENDAR */}
        <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h2 style={{ fontSize: "18px" }}>Select Date</h2>
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
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
              width: "100%",
              display: "flex",
              justifyContent: "space-around",
              fontSize: "12px",
              color: "var(--text-muted)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }} />
              High Presence (&gt;80%)
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f59e0b" }} />
              Partial (50-80%)
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444" }} />
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
              <span style={{ fontSize: "12px", color: "var(--accent-blue)", fontWeight: 700 }}>
                {selectedDate.toLocaleDateString("en-US", { weekday: "long" })}
              </span>
              <h2 style={{ fontSize: "20px" }}>{selectedDateStr}</h2>
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
              gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
              gap: "10px",
              marginBottom: "20px",
            }}
          >
            <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "12px", borderRadius: "8px", textAlign: "center" }}>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Turnout</div>
              <div style={{ fontSize: "18px", fontWeight: 700, marginTop: "2px", color: "var(--accent-cyan)" }}>
                {dayMetrics.rate}%
              </div>
            </div>
            <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "12px", borderRadius: "8px", textAlign: "center" }}>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Present</div>
              <div style={{ fontSize: "18px", fontWeight: 700, marginTop: "2px", color: "#34d399" }}>
                {dayMetrics.present}
              </div>
            </div>
            <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "12px", borderRadius: "8px", textAlign: "center" }}>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Late</div>
              <div style={{ fontSize: "18px", fontWeight: 700, marginTop: "2px", color: "#fbbf24" }}>
                {dayMetrics.late}
              </div>
            </div>
            <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "12px", borderRadius: "8px", textAlign: "center" }}>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Half-Day</div>
              <div style={{ fontSize: "18px", fontWeight: 700, marginTop: "2px", color: "#c084fc" }}>
                {dayMetrics.halfDay}
              </div>
            </div>
            <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "12px", borderRadius: "8px", textAlign: "center" }}>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Absent</div>
              <div style={{ fontSize: "18px", fontWeight: 700, marginTop: "2px", color: "#f87171" }}>
                {dayMetrics.absent}
              </div>
            </div>
          </div>

          {/* DAY ATTENDANCE LIST */}
          <div style={{ maxHeight: "380px", overflowY: "auto", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: "8px" }}>
            <table className="custom-table" style={{ fontSize: "13px" }}>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>In</th>
                  <th>Out</th>
                  <th>Hours</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "30px" }}>
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
                        <div style={{ fontWeight: 600 }}>{r.name}</div>
                        <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>{r.employeeId}</div>
                      </td>
                      <td>{r.department}</td>
                      <td>{formatTime(r.checkInTime)}</td>
                      <td>{formatTime(r.checkOutTime)}</td>
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
