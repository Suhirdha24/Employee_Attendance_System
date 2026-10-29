import React, { useEffect, useState, useMemo } from "react";
import API from "../api/api";
import { Link } from "react-router-dom";
import { useToast } from "../components/Toast";

export default function AllEmployeesAttendance() {
  const { addToast } = useToast();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedWorkMode, setSelectedWorkMode] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Drill-down Modal
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [empModalLoading, setEmpModalLoading] = useState(false);

  // Rectify / Edit Modal
  const [rectifyRecord, setRectifyRecord] = useState(null);
  const [rectifyStatus, setRectifyStatus] = useState("present");
  const [rectifyHours, setRectifyHours] = useState("");
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

  const loadRecords = async () => {
    try {
      setLoading(true);
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (selectedStatus !== "all") params.status = selectedStatus;
      if (selectedDept !== "all") params.department = selectedDept;
      if (selectedWorkMode !== "all") params.workMode = selectedWorkMode;

      const res = await API.get("/attendance/all", { params });
      setRecords(res.data);
    } catch (err) {
      console.error("Error loading all attendance records:", err);
      addToast("Failed to load attendance records", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, [startDate, endDate]);

  // Client-side filtering for fast response on search term, dept, and status
  const filteredRecords = useMemo(() => {
    return records.filter((item) => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        (item.name && item.name.toLowerCase().includes(q)) ||
        (item.employeeId && item.employeeId.toLowerCase().includes(q)) ||
        (item.department && item.department.toLowerCase().includes(q)) ||
        (item.email && item.email.toLowerCase().includes(q));

      const matchDept =
        selectedDept === "all" ||
        (item.department && item.department.toLowerCase() === selectedDept.toLowerCase());

      const matchStatus =
        selectedStatus === "all" ||
        (item.status && item.status.toLowerCase() === selectedStatus.toLowerCase());

      const matchWorkMode =
        selectedWorkMode === "all" ||
        (item.workMode && item.workMode.toLowerCase() === selectedWorkMode.toLowerCase());

      return matchSearch && matchDept && matchStatus && matchWorkMode;
    });
  }, [records, searchTerm, selectedDept, selectedStatus, selectedWorkMode]);

  // Open drill-down modal for single employee
  const handleViewEmployee = async (userId) => {
    if (!userId) return;
    setEmpModalLoading(true);
    try {
      const res = await API.get(`/attendance/employee/${userId}`);
      setSelectedEmp(res.data);
    } catch (err) {
      console.error("Error loading employee drilldown:", err);
      addToast("Could not load employee details", "error");
    } finally {
      setEmpModalLoading(false);
    }
  };

  // Open rectify modal
  const openRectifyModal = (record) => {
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
      addToast("Attendance record rectified successfully!", "success");
      setRectifyRecord(null);
      await loadRecords();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to adjust attendance", "error");
    } finally {
      setRectifySaving(false);
    }
  };

  // Export CSV handler
  const handleExportCSV = async () => {
    try {
      if (filteredRecords.length === 0) {
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

      const rows = filteredRecords.map((item) => [
        `"${(item.name || "").replace(/"/g, '""')}"`,
        `"${item.employeeId || ""}"`,
        `"${item.department || "General"}"`,
        item.date,
        `"${item.workMode || "Office"}"`,
        item.checkInTime ? `"${formatTime(item.checkInTime)}"` : `"-"`,
        item.checkOutTime ? `"${formatTime(item.checkOutTime)}"` : `"-"`,
        item.totalHours || "0",
        `"${item.status || "absent"}"`,
        `"${(item.remarks || "").replace(/"/g, '""')}"`,
      ]);

      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `all_employees_attendance_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addToast("Attendance log exported successfully as CSV", "success");
    } catch (err) {
      console.error("Export error:", err);
      addToast("Failed to export CSV", "error");
    }
  };

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
            Workforce Master Audit
          </span>
          <h1 style={{ fontSize: "28px", marginTop: "2px", color: "var(--text-main)" }}>
            All Employees Attendance Records
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "2px" }}>
            Comprehensive chronological audit log across all units, teams, and departments
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button className="btn btn-outline btn-sm" onClick={handleExportCSV}>
            📥 Export CSV
          </button>
          <Link to="/manager" className="btn btn-primary btn-sm" style={{ textDecoration: "none" }}>
            ← Operations Portal
          </Link>
        </div>
      </div>

      {/* SEARCH & MULTI-FILTER CONTROL BAR */}
      <div className="card" style={{ marginBottom: "20px", display: "flex", flexWrap: "wrap", gap: "14px", alignItems: "center" }}>
        {/* SEARCH INPUT */}
        <div style={{ flex: "2 1 240px" }}>
          <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "5px", fontWeight: 600 }}>
            Search Staff
          </label>
          <input
            type="text"
            className="input-field"
            placeholder="Search by name, ID, unit, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* DEPARTMENT FILTER */}
        <div style={{ flex: "1 1 140px" }}>
          <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "5px", fontWeight: 600 }}>
            Department
          </label>
          <select
            className="input-field"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            <option value="all">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="UI/UX Design">UI/UX Design</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Marketing">Marketing</option>
            <option value="Finance">Finance</option>
          </select>
        </div>

        {/* STATUS FILTER */}
        <div style={{ flex: "1 1 140px" }}>
          <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "5px", fontWeight: 600 }}>
            Compliance Status
          </label>
          <select
            className="input-field"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Classifications</option>
            <option value="present">Present</option>
            <option value="late">Late</option>
            <option value="half-day">Half-Day</option>
            <option value="absent">Absent</option>
          </select>
        </div>

        {/* WORK MODE FILTER */}
        <div style={{ flex: "1 1 130px" }}>
          <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "5px", fontWeight: 600 }}>
            Work Mode
          </label>
          <select
            className="input-field"
            value={selectedWorkMode}
            onChange={(e) => setSelectedWorkMode(e.target.value)}
          >
            <option value="all">All Modes</option>
            <option value="Office">🏢 Office</option>
            <option value="Remote">🌐 Remote</option>
          </select>
        </div>

        {/* START DATE */}
        <div style={{ flex: "1 1 140px" }}>
          <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "5px", fontWeight: 600 }}>
            From Date
          </label>
          <input
            type="date"
            className="input-field"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        {/* END DATE */}
        <div style={{ flex: "1 1 140px" }}>
          <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "5px", fontWeight: 600 }}>
            To Date
          </label>
          <input
            type="date"
            className="input-field"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        {/* RESET */}
        <div style={{ alignSelf: "flex-end" }}>
          <button
            className="btn btn-outline"
            style={{ padding: "9px 16px" }}
            onClick={() => {
              setSearchTerm("");
              setSelectedDept("all");
              setSelectedStatus("all");
              setSelectedWorkMode("all");
              setStartDate("");
              setEndDate("");
            }}
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* QUICK FILTER CHIPS */}
      <div className="filter-chips" style={{ marginBottom: "16px" }}>
        <button
          className={`filter-chip ${selectedStatus === "all" && selectedWorkMode === "all" ? "active" : ""}`}
          onClick={() => {
            setSelectedStatus("all");
            setSelectedWorkMode("all");
          }}
        >
          All Records ({filteredRecords.length})
        </button>
        <button
          className={`filter-chip ${selectedStatus === "present" ? "active" : ""}`}
          onClick={() => setSelectedStatus(selectedStatus === "present" ? "all" : "present")}
        >
          ✅ Present ({records.filter((r) => r.status === "present").length})
        </button>
        <button
          className={`filter-chip ${selectedStatus === "late" ? "active" : ""}`}
          onClick={() => setSelectedStatus(selectedStatus === "late" ? "all" : "late")}
        >
          ⏰ Late ({records.filter((r) => r.status === "late").length})
        </button>
        <button
          className={`filter-chip ${selectedStatus === "half-day" ? "active" : ""}`}
          onClick={() => setSelectedStatus(selectedStatus === "half-day" ? "all" : "half-day")}
        >
          🌗 Half-Day ({records.filter((r) => r.status === "half-day").length})
        </button>
        <button
          className={`filter-chip ${selectedWorkMode === "Remote" ? "active" : ""}`}
          onClick={() => setSelectedWorkMode(selectedWorkMode === "Remote" ? "all" : "Remote")}
        >
          🌐 Remote ({records.filter((r) => r.workMode === "Remote").length})
        </button>
      </div>

      {/* ATTENDANCE TABLE */}
      <div className="card" style={{ padding: "0", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Staff ID</th>
                <th>Department</th>
                <th>Shift Date</th>
                <th>Mode</th>
                <th>Check-In</th>
                <th>Check-Out</th>
                <th>Duration</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                    Loading employee attendance records...
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                    No matching attendance records found.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((item) => {
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
                            {item.name ? item.name.charAt(0) : "E"}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: "var(--text-main)" }}>{item.name}</div>
                            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{item.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontFamily: "monospace", fontWeight: 600, color: "var(--text-main)" }}>
                        {item.employeeId}
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
                        ) : typeof item.totalHours === "number" ? (
                          `${item.totalHours}h`
                        ) : (
                          item.totalHours
                        )}
                      </td>
                      <td>
                        <span className={`status-pill ${item.status || "absent"}`}>
                          {item.status || "absent"}
                        </span>
                        {item.modifiedByManager && (
                          <span style={{ display: "block", fontSize: "10px", color: "var(--accent-blue)", fontWeight: 600 }}>
                            Adjusted
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => handleViewEmployee(item.userId)}
                          >
                            Audit
                          </button>
                          <button
                            className="btn btn-outline btn-sm"
                            style={{ background: "#f8fafc" }}
                            onClick={() => openRectifyModal(item)}
                          >
                            ✏️ Adjust
                          </button>
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

      {/* DRILL-DOWN AUDIT MODAL */}
      {selectedEmp && (
        <div className="modal-backdrop" onClick={() => setSelectedEmp(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "720px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
              <div>
                <h2 style={{ fontSize: "20px", color: "var(--text-main)" }}>{selectedEmp.employee.name}</h2>
                <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "2px" }}>
                  Staff ID: <strong>{selectedEmp.employee.employeeId}</strong> • {selectedEmp.employee.department} • {selectedEmp.employee.email}
                </p>
              </div>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setSelectedEmp(null)}
                style={{ borderRadius: "4px", width: "30px", height: "30px", padding: 0 }}
              >
                ✕
              </button>
            </div>

            {/* STATS STRIP */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "20px" }}>
              <div style={{ background: "var(--bg-surface)", padding: "12px", borderRadius: "6px", border: "1px solid var(--border-subtle)", textAlign: "center" }}>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Total Shifts</div>
                <div style={{ fontSize: "18px", fontWeight: 700, marginTop: "2px", color: "var(--text-main)" }}>{selectedEmp.stats.totalDays}</div>
              </div>
              <div style={{ background: "var(--status-present-bg)", padding: "12px", borderRadius: "6px", border: "1px solid var(--status-present-border)", textAlign: "center" }}>
                <div style={{ fontSize: "11px", color: "var(--status-present-text)", textTransform: "uppercase" }}>Present</div>
                <div style={{ fontSize: "18px", fontWeight: 700, marginTop: "2px", color: "var(--status-present-text)" }}>
                  {selectedEmp.stats.presentDays}
                </div>
              </div>
              <div style={{ background: "var(--status-late-bg)", padding: "12px", borderRadius: "6px", border: "1px solid var(--status-late-border)", textAlign: "center" }}>
                <div style={{ fontSize: "11px", color: "var(--status-late-text)", textTransform: "uppercase" }}>Late</div>
                <div style={{ fontSize: "18px", fontWeight: 700, marginTop: "2px", color: "var(--status-late-text)" }}>
                  {selectedEmp.stats.lateDays}
                </div>
              </div>
              <div style={{ background: "var(--bg-surface)", padding: "12px", borderRadius: "6px", border: "1px solid var(--border-subtle)", textAlign: "center" }}>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Total Logged</div>
                <div style={{ fontSize: "18px", fontWeight: 700, marginTop: "2px", color: "var(--primary)" }}>
                  {selectedEmp.stats.totalHours}h
                </div>
              </div>
            </div>

            {/* RECENT ATTENDANCE HISTORY LIST */}
            <h4 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "10px", color: "var(--text-main)" }}>Recent Verified Shift Entries</h4>
            <div style={{ maxHeight: "280px", overflowY: "auto", border: "1px solid var(--border-medium)", borderRadius: "6px" }}>
              <table className="custom-table" style={{ fontSize: "13px" }}>
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
                  {selectedEmp.history.slice(0, 15).map((h) => (
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
                        <span className={`status-pill ${h.status}`}>{h.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: "20px", textAlign: "right" }}>
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
