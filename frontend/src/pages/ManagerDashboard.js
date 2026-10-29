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
  const [selectedWorkMode, setSelectedWorkMode] = useState("all");

  // Selected Employee for Drill-down Modal
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [empModalLoading, setEmpModalLoading] = useState(false);

  // Rectify Modal State
  const [rectifyRecord, setRectifyRecord] = useState(null);
  const [rectifyStatus, setRectifyStatus] = useState("present");
  const [rectifyHours, setRectifyHours] = useState("8.0");
  const [rectifyWorkMode, setRectifyWorkMode] = useState("Office");
  const [rectifyRemarks, setRectifyRemarks] = useState("");
  const [rectifySaving, setRectifySaving] = useState(false);

  // Live timer for active shifts
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 5000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (isoString) => {
    if (!isoString || isoString === "-") return "-";
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getActiveDuration = (checkInIso, checkOutIso) => {
    if (checkInIso && checkInIso !== "-" && (!checkOutIso || checkOutIso === "-")) {
      const start = new Date(checkInIso);
      const diffMs = Math.max(0, currentTime - start);
      const totalMins = Math.floor(diffMs / (1000 * 60));
      const hours = Math.floor(totalMins / 60);
      const mins = totalMins % 60;
      return `${hours}h ${mins}m`;
    }
    return null;
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

      // Work mode match
      const matchWorkMode =
        selectedWorkMode === "all" ||
        (item.workMode && item.workMode.toLowerCase() === selectedWorkMode.toLowerCase());

      return matchSearch && matchDept && matchStatus && matchWorkMode;
    });
  }, [activeTab, todayList, allList, searchTerm, selectedDept, selectedStatus, selectedWorkMode]);

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
      "Work Mode",
      "Check-In",
      "Check-Out",
      "Hours Worked",
      "Status",
      "Remarks",
    ];

    const rows = displayedList.map((item) => [
      `"${item.name || "-"}"`,
      `"${item.employeeId || "-"}"`,
      `"${item.department || "General"}"`,
      item.date,
      `"${item.workMode || "Office"}"`,
      `"${formatTime(item.checkInTime)}"`,
      `"${formatTime(item.checkOutTime)}"`,
      item.totalHours || "0",
      `"${item.status}"`,
      `"${(item.remarks || "").replace(/"/g, '""')}"`,
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
    if (!userId || userId.toString().startsWith("virtual-")) {
      return addToast("Virtual record (not yet clocked in today)", "info");
    }
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

  // Open Rectify Modal
  const openRectify = (record) => {
    if (!record._id || record._id.toString().startsWith("virtual-")) {
      return addToast("Please select an existing attendance log to rectify", "info");
    }
    setRectifyRecord(record);
    setRectifyStatus(record.status || "present");
    setRectifyHours(record.totalHours !== "-" ? record.totalHours : "8.0");
    setRectifyWorkMode(record.workMode || "Office");
    setRectifyRemarks(record.remarks || "");
  };

  const handleSaveRectify = async (e) => {
    e.preventDefault();
    if (!rectifyRecord) return;
    setRectifySaving(true);
    try {
      await API.put(`/attendance/${rectifyRecord._id}`, {
        status: rectifyStatus,
        totalHours: parseFloat(rectifyHours) || 0,
        workMode: rectifyWorkMode,
        remarks: rectifyRemarks,
      });
      addToast("Attendance adjusted successfully!", "success");
      setRectifyRecord(null);
      await loadData();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to adjust record", "error");
    } finally {
      setRectifySaving(false);
    }
  };

  return (
    <div style={{ width: "100%", paddingBottom: "48px" }}>
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
            📥 Export CSV
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
          <span className="stat-subtitle">Enrolled workforce members</span>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Present Today</span>
          </div>
          <div className="stat-value" style={{ color: "#059669" }}>
            {summary?.presentToday || 0}
          </div>
          <span className="stat-subtitle">
            {summary?.officeToday || 0} Office • {summary?.remoteToday || 0} Remote
          </span>
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px" }}>
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

          <div>
            <label className="form-label">Filter Work Mode</label>
            <select
              className="form-select"
              value={selectedWorkMode}
              onChange={(e) => setSelectedWorkMode(e.target.value)}
            >
              <option value="all">All Modes</option>
              <option value="Office">🏢 Office</option>
              <option value="Remote">🌐 Remote</option>
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
                setSelectedWorkMode("all");
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
                <th>Work Mode</th>
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
                  <td colSpan="10" style={{ textAlign: "center", padding: "36px", color: "var(--text-dim)" }}>
                    {loading ? "Loading attendance records..." : "No attendance records match your current filter."}
                  </td>
                </tr>
              ) : (
                displayedList.map((item) => {
                  const activeDuration = getActiveDuration(item.checkInTime, item.checkOutTime);

                  return (
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
                      <td>
                        <span className={`badge-workmode ${(item.workMode || "Office").toLowerCase()}`}>
                          {item.workMode === "Remote" ? "🌐 Remote" : "🏢 Office"}
                        </span>
                      </td>
                      <td style={{ fontFamily: "monospace" }}>{formatTime(item.checkInTime)}</td>
                      <td style={{ fontFamily: "monospace" }}>{formatTime(item.checkOutTime)}</td>
                      <td style={{ fontWeight: 600 }}>
                        {activeDuration ? (
                          <span style={{ color: "#059669", display: "inline-flex", alignItems: "center", gap: "5px" }}>
                            <span className="pulse-indicator"></span>
                            {activeDuration}
                          </span>
                        ) : item.totalHours && item.totalHours !== "-" ? (
                          `${item.totalHours} hrs`
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>
                        <span className={`badge badge-${item.status}`}>
                          {item.status}
                        </span>
                        {item.modifiedByManager && (
                          <span style={{ display: "block", fontSize: "10px", color: "var(--accent-blue)", fontWeight: 600, marginTop: "2px" }}>
                            Adjusted
                          </span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => openEmployeeDrilldown(item.userId)}
                          >
                            Details
                          </button>
                          {!item._id.toString().startsWith("virtual-") && (
                            <button
                              className="btn btn-outline btn-sm"
                              style={{ background: "#f8fafc" }}
                              onClick={() => openRectify(item)}
                            >
                              ✏️
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECTIFY / ADJUST MODAL */}
      {rectifyRecord && (
        <div className="rectify-modal-backdrop" onClick={() => setRectifyRecord(null)}>
          <div className="rectify-modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ fontSize: "17px", color: "#0f172a" }}>Adjust Shift Attendance</h3>
                <p style={{ color: "#64748b", fontSize: "13px", marginTop: "2px" }}>
                  {rectifyRecord.name} ({rectifyRecord.employeeId}) • Shift: {rectifyRecord.date}
                </p>
              </div>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setRectifyRecord(null)}
                style={{ width: "28px", height: "28px", padding: 0 }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRectify} style={{ padding: "20px 24px" }}>
              <div className="form-group">
                <label className="form-label">Classification Status</label>
                <select
                  className="form-select"
                  value={rectifyStatus}
                  onChange={(e) => setRectifyStatus(e.target.value)}
                >
                  <option value="present">Present</option>
                  <option value="late">Late</option>
                  <option value="half-day">Half-Day</option>
                  <option value="absent">Absent</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Total Working Hours</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="24"
                  className="form-input"
                  value={rectifyHours}
                  onChange={(e) => setRectifyHours(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Work Mode</label>
                <select
                  className="form-select"
                  value={rectifyWorkMode}
                  onChange={(e) => setRectifyWorkMode(e.target.value)}
                >
                  <option value="Office">In-Office</option>
                  <option value="Remote">Authorized Remote</option>
                  <option value="On-Site">Client On-Site</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Manager Audit Note / Justification</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Approved medical leave, transit delay excuse, manual shift log"
                  value={rectifyRemarks}
                  onChange={(e) => setRectifyRemarks(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setRectifyRecord(null)}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={rectifySaving}
                  style={{ flex: 1 }}
                >
                  {rectifySaving ? "Saving..." : "Confirm Adjustment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DRILL-DOWN MODAL */}
      {selectedEmp && (
        <div
          className="modal-backdrop"
          onClick={() => setSelectedEmp(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.45)",
            backdropFilter: "blur(2px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "16px",
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#ffffff",
              borderRadius: "8px",
              padding: "24px",
              maxWidth: "680px",
              width: "100%",
              boxShadow: "var(--shadow-lg)",
              border: "1px solid #cbd5e1",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div>
                <h2 style={{ fontSize: "20px", color: "#0f172a" }}>{selectedEmp.employee.name}</h2>
                <p style={{ color: "#64748b", fontSize: "13px", marginTop: "2px" }}>
                  Staff ID: <strong>{selectedEmp.employee.employeeId}</strong> • {selectedEmp.employee.department} • {selectedEmp.employee.email}
                </p>
              </div>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setSelectedEmp(null)}
                style={{ width: "28px", height: "28px", padding: 0 }}
              >
                ✕
              </button>
            </div>

            {/* QUICK STATS */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "20px" }}>
              <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "6px", textAlign: "center", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase" }}>Shifts</span>
                <p style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a", marginTop: "2px" }}>{selectedEmp.stats.totalDays}</p>
              </div>
              <div style={{ background: "#ecfdf5", padding: "12px", borderRadius: "6px", textAlign: "center", border: "1px solid #a7f3d0" }}>
                <span style={{ fontSize: "11px", color: "#065f46", textTransform: "uppercase" }}>Present</span>
                <p style={{ fontSize: "18px", fontWeight: 700, color: "#065f46", marginTop: "2px" }}>{selectedEmp.stats.presentDays}</p>
              </div>
              <div style={{ background: "#fffbeb", padding: "12px", borderRadius: "6px", textAlign: "center", border: "1px solid #fde68a" }}>
                <span style={{ fontSize: "11px", color: "#92400e", textTransform: "uppercase" }}>Late</span>
                <p style={{ fontSize: "18px", fontWeight: 700, color: "#92400e", marginTop: "2px" }}>{selectedEmp.stats.lateDays}</p>
              </div>
              <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "6px", textAlign: "center", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase" }}>Total Hours</span>
                <p style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a", marginTop: "2px" }}>{selectedEmp.stats.totalHours}h</p>
              </div>
            </div>

            {/* HISTORY LIST */}
            <h3 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "8px", color: "#0f172a" }}>Recent Shift Logs</h3>
            <div style={{ maxHeight: "240px", overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: "6px" }}>
              <table className="modern-table" style={{ fontSize: "12.5px" }}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Mode</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Hours</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedEmp.history.slice(0, 10).map((h) => (
                    <tr key={h._id}>
                      <td style={{ fontWeight: 500 }}>{h.date}</td>
                      <td>
                        <span className={`badge-workmode ${(h.workMode || "Office").toLowerCase()}`}>
                          {h.workMode === "Remote" ? "🌐 Remote" : "🏢 Office"}
                        </span>
                      </td>
                      <td style={{ fontFamily: "monospace" }}>{formatTime(h.checkInTime)}</td>
                      <td style={{ fontFamily: "monospace" }}>{formatTime(h.checkOutTime)}</td>
                      <td style={{ fontWeight: 600 }}>{h.totalHours ? `${h.totalHours}h` : "-"}</td>
                      <td>
                        <span className={`badge badge-${h.status}`}>{h.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: "16px", textAlign: "right" }}>
              <button className="btn btn-outline" onClick={() => setSelectedEmp(null)}>
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
