import React, { useEffect, useState, useMemo } from "react";
import API from "../api/api";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useToast } from "../components/Toast";

export default function ManagerDashboard() {
  const auth = useSelector((s) => s.auth);
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState("today"); // 'today' | 'all'
  const [summary, setSummary] = useState(null);
  const [todayList, setTodayList] = useState([]);
  const [allList, setAllList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Selected Employee for Drill-down Modal
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [empModalLoading, setEmpModalLoading] = useState(false);

  const formatTime = (isoString) => {
    if (!isoString || isoString === "-") return "-";
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [sumRes, todayRes, allRes] = await Promise.all([
        API.get("/attendance/summary"),
        API.get("/attendance/all-today"),
        API.get("/attendance/all"),
      ]);
      setSummary(sumRes.data);
      setTodayList(todayRes.data);
      setAllList(allRes.data);
    } catch (err) {
      console.error("Manager data load error:", err);
      addToast("Failed to load attendance records", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter current active list
  const displayedList = useMemo(() => {
    const sourceList = activeTab === "today" ? todayList : allList;

    return sourceList.filter((item) => {
      // Search match
      const q = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        (item.name && item.name.toLowerCase().includes(q)) ||
        (item.employeeId && item.employeeId.toLowerCase().includes(q)) ||
        (item.department && item.department.toLowerCase().includes(q));

      // Department match
      const matchDept =
        selectedDept === "all" ||
        (item.department && item.department.toLowerCase() === selectedDept.toLowerCase());

      // Status match
      const matchStatus =
        selectedStatus === "all" ||
        (item.status && item.status.toLowerCase() === selectedStatus.toLowerCase());

      return matchSearch && matchDept && matchStatus;
    });
  }, [activeTab, todayList, allList, searchTerm, selectedDept, selectedStatus]);

  // Export CSV
  const handleExportCSV = () => {
    if (displayedList.length === 0) {
      return addToast("No records available to export", "warning");
    }

    const headers = [
      "Employee Name",
      "Employee ID",
      "Department",
      "Date",
      "Check-In",
      "Check-Out",
      "Hours Worked",
      "Status",
    ];

    const rows = displayedList.map((item) => [
      `"${item.name || "-"}"`,
      `"${item.employeeId || "-"}"`,
      `"${item.department || "General"}"`,
      item.date,
      `"${formatTime(item.checkInTime)}"`,
      `"${formatTime(item.checkOutTime)}"`,
      item.totalHours || "0",
      `"${item.status}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Attendance_Report_${activeTab}_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
    addToast("CSV report exported successfully!", "success");
  };

  // Open Employee Details Modal
  const openEmployeeDrilldown = async (userId) => {
    if (!userId || userId.toString().startsWith("virtual-")) return;
    try {
      setEmpModalLoading(true);
      const res = await API.get(`/attendance/employee/${userId}`);
      setSelectedEmp(res.data);
    } catch (err) {
      addToast("Could not load employee details", "error");
    } finally {
      setEmpModalLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
      {/* HEADER & TOP CONTROLS */}
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
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span style={{ fontSize: "11px", color: "var(--accent-blue)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Workforce Operations
            </span>
          </div>
          <h1 style={{ fontSize: "26px", color: "#0f172a" }}>Manager Operations Portal</h1>
          <p style={{ color: "#64748b", fontSize: "14px", marginTop: "2px" }}>
            Real-time presence monitoring, shift compliance audits, and team attendance records
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button className="btn btn-outline btn-sm" onClick={handleExportCSV}>
            Export CSV
          </button>
          <Link to="/manager/all-attendance" className="btn btn-outline btn-sm" style={{ textDecoration: "none" }}>
            All Records
          </Link>
          <Link to="/manager/calendar" className="btn btn-outline btn-sm" style={{ textDecoration: "none" }}>
            Team Calendar
          </Link>
          <Link to="/manager/reports" className="btn btn-outline btn-sm" style={{ textDecoration: "none" }}>
            Reports
          </Link>
          <Link to="/manager/charts" className="btn btn-primary btn-sm" style={{ textDecoration: "none" }}>
            Analytics →
          </Link>
        </div>
      </div>

      {/* KPI STAT CARDS */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Total Staff</span>
          </div>
          <div className="stat-value">{summary?.totalEmployees || 0}</div>
          <span className="stat-subtitle">Enrolled employees</span>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Present Today</span>
          </div>
          <div className="stat-value" style={{ color: "#059669" }}>
            {summary?.presentToday || 0}
          </div>
          <span className="stat-subtitle">{summary?.attendancePercentage || 0}% active shift compliance</span>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Late Arrivals</span>
          </div>
          <div className="stat-value" style={{ color: "#d97706" }}>
            {summary?.lateToday || 0}
          </div>
          <span className="stat-subtitle">Punched after 09:30 AM</span>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Absent Today</span>
          </div>
          <div className="stat-value" style={{ color: "#dc2626" }}>
            {summary?.absentToday || 0}
          </div>
          <span className="stat-subtitle">No punch recorded today</span>
        </div>
      </div>

      {/* FILTER & CONTROL BAR */}
      <div className="card" style={{ marginBottom: "24px" }}>
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
          {/* TAB SWITCHER */}
          <div style={{ display: "flex", gap: "8px", background: "var(--bg-surface)", padding: "4px", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
            <button
              className={`btn btn-sm ${activeTab === "today" ? "btn-primary" : "btn-outline"}`}
              style={{ border: "none" }}
              onClick={() => setActiveTab("today")}
            >
              📅 Today's Live Roster ({todayList.length})
            </button>
            <button
              className={`btn btn-sm ${activeTab === "all" ? "btn-primary" : "btn-outline"}`}
              style={{ border: "none" }}
              onClick={() => setActiveTab("all")}
            >
              📁 All Historical Records ({allList.length})
            </button>
          </div>

          <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            Showing <strong>{displayedList.length}</strong> records
          </div>
        </div>

        {/* SEARCH & FILTERS ROW */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
          <div>
            <label className="form-label">Search Employee</label>
            <input
              className="form-input"
              type="text"
              placeholder="Search by name, ID, dept..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label">Filter Department</label>
            <select
              className="form-select"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              <option value="all">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="UI/UX Design">UI/UX Design</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Marketing">Marketing</option>
              <option value="Finance">Finance</option>
              <option value="Management">Management</option>
            </select>
          </div>

          <div>
            <label className="form-label">Filter Status</label>
            <select
              className="form-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="present">Present</option>
              <option value="late">Late</option>
              <option value="half-day">Half-Day</option>
              <option value="absent">Absent</option>
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button
              className="btn btn-outline"
              style={{ width: "100%", padding: "12px" }}
              onClick={() => {
                setSearchTerm("");
                setSelectedDept("all");
                setSelectedStatus("all");
              }}
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* ATTENDANCE TABLE */}
      <div className="card">
        <div className="table-wrapper">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Employee ID</th>
                <th>Department</th>
                <th>Date</th>
                <th>Check-In</th>
                <th>Check-Out</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedList.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center", padding: "36px", color: "var(--text-dim)" }}>
                    {loading ? "Loading attendance records..." : "No attendance records match your current filter."}
                  </td>
                </tr>
              ) : (
                displayedList.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "6px",
                            background: "var(--primary-light)",
                            color: "var(--primary)",
                            border: "1px solid var(--primary-border)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "13px",
                            fontWeight: 700,
                          }}
                        >
                          {item.name?.charAt(0) || "E"}
                        </div>
                        <span style={{ fontWeight: 600, color: "var(--text-main)" }}>{item.name || "-"}</span>
                      </div>
                    </td>
                    <td style={{ fontFamily: "monospace", fontWeight: 600, color: "var(--text-main)" }}>
                      {item.employeeId || "-"}
                    </td>
                    <td>{item.department || "General"}</td>
                    <td style={{ fontWeight: 500 }}>{item.date}</td>
                    <td style={{ fontFamily: "monospace" }}>{formatTime(item.checkInTime)}</td>
                    <td style={{ fontFamily: "monospace" }}>{formatTime(item.checkOutTime)}</td>
                    <td style={{ fontWeight: 600 }}>{item.totalHours ? `${item.totalHours} hrs` : "-"}</td>
                    <td>
                      <span className={`status-pill ${item.status}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => openEmployeeDrilldown(item.userId)}
                        disabled={!item.userId || item.userId.toString().startsWith("virtual-")}
                      >
                        Audit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EMPLOYEE DRILL-DOWN MODAL */}
      {selectedEmp && (
        <div className="modal-backdrop" onClick={() => setSelectedEmp(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "700px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
              <div>
                <span style={{ fontSize: "12px", color: "var(--primary)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.04em" }}>
                  Employee Attendance Profile
                </span>
                <h2 style={{ fontSize: "20px", marginTop: "2px", color: "var(--text-main)" }}>{selectedEmp.employee?.name}</h2>
                <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "2px" }}>
                  Staff ID: <strong>{selectedEmp.employee?.employeeId}</strong> • {selectedEmp.employee?.department} Department
                </p>
              </div>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setSelectedEmp(null)}
              >
                ✕ Close
              </button>
            </div>

            {/* EMPLOYEE METRICS */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "20px", textAlign: "center" }}>
              <div style={{ background: "var(--status-present-bg)", padding: "12px", borderRadius: "6px", border: "1px solid var(--status-present-border)" }}>
                <span style={{ fontSize: "11px", color: "var(--status-present-text)", textTransform: "uppercase" }}>Present</span>
                <p style={{ fontSize: "18px", fontWeight: 700, color: "var(--status-present-text)", marginTop: "2px" }}>
                  {selectedEmp.stats?.presentDays}
                </p>
              </div>
              <div style={{ background: "var(--status-late-bg)", padding: "12px", borderRadius: "6px", border: "1px solid var(--status-late-border)" }}>
                <span style={{ fontSize: "11px", color: "var(--status-late-text)", textTransform: "uppercase" }}>Late</span>
                <p style={{ fontSize: "18px", fontWeight: 700, color: "var(--status-late-text)", marginTop: "2px" }}>
                  {selectedEmp.stats?.lateDays}
                </p>
              </div>
              <div style={{ background: "var(--status-half-bg)", padding: "12px", borderRadius: "6px", border: "1px solid var(--status-half-border)" }}>
                <span style={{ fontSize: "11px", color: "var(--status-half-text)", textTransform: "uppercase" }}>Half-Day</span>
                <p style={{ fontSize: "18px", fontWeight: 700, color: "var(--status-half-text)", marginTop: "2px" }}>
                  {selectedEmp.stats?.halfDays}
                </p>
              </div>
              <div style={{ background: "var(--bg-surface)", padding: "12px", borderRadius: "6px", border: "1px solid var(--border-subtle)" }}>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Total Logged</span>
                <p style={{ fontSize: "18px", fontWeight: 700, color: "var(--primary)", marginTop: "2px" }}>
                  {selectedEmp.stats?.totalHours}h
                </p>
              </div>
            </div>

            {/* RECENT RECORDS */}
            <h3 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "10px", color: "var(--text-main)" }}>Recent Shift Records</h3>
            <div style={{ maxHeight: "280px", overflowY: "auto", border: "1px solid var(--border-medium)", borderRadius: "6px" }}>
              <table className="custom-table" style={{ fontSize: "13px" }}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>In</th>
                    <th>Out</th>
                    <th>Hours</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedEmp.history?.slice(0, 15).map((h) => (
                    <tr key={h._id}>
                      <td style={{ fontWeight: 500 }}>{h.date}</td>
                      <td style={{ fontFamily: "monospace" }}>{formatTime(h.checkInTime)}</td>
                      <td style={{ fontFamily: "monospace" }}>{formatTime(h.checkOutTime)}</td>
                      <td style={{ fontWeight: 600 }}>{h.totalHours ? `${h.totalHours} hrs` : "-"}</td>
                      <td>
                        <span className={`status-pill ${h.status}`}>{h.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
