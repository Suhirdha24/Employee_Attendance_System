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
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Drill-down Modal
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [empModalLoading, setEmpModalLoading] = useState(false);

  const formatTime = (isoString) => {
    if (!isoString || isoString === "-") return "-";
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const loadRecords = async () => {
    try {
      setLoading(true);
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (selectedStatus !== "all") params.status = selectedStatus;
      if (selectedDept !== "all") params.department = selectedDept;

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

      return matchSearch && matchDept && matchStatus;
    });
  }, [records, searchTerm, selectedDept, selectedStatus]);

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
        "Check-In",
        "Check-Out",
        "Hours Worked",
        "Status",
      ];

      const rows = filteredRecords.map((item) => [
        `"${(item.name || "").replace(/"/g, '""')}"`,
        `"${item.employeeId || ""}"`,
        `"${item.department || "General"}"`,
        item.date,
        item.checkInTime ? `"${formatTime(item.checkInTime)}"` : `"-"`,
        item.checkOutTime ? `"${formatTime(item.checkOutTime)}"` : `"-"`,
        item.totalHours || "0",
        `"${item.status || "absent"}"`,
      ]);

      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `all_employees_attendance_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addToast("CSV export downloaded successfully!", "success");
    } catch (err) {
      console.error("Export error:", err);
      addToast("Failed to export CSV", "error");
    }
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
          <span style={{ fontSize: "12px", color: "var(--accent-blue)", fontWeight: 700, textTransform: "uppercase" }}>
            Manager Suite
          </span>
          <h1 style={{ fontSize: "30px", marginTop: "2px" }}>All Employees Attendance</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "2px" }}>
            Historical and daily attendance logs across all departments and team members
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button className="btn btn-primary" onClick={handleExportCSV}>
            📥 Export Attendance (CSV)
          </button>
          <Link to="/manager/calendar" className="btn btn-outline">
            📅 Team Calendar
          </Link>
          <Link to="/manager/reports" className="btn btn-outline">
            📊 Reports
          </Link>
        </div>
      </div>

      {/* FILTER CONTROLS BAR */}
      <div
        className="card"
        style={{
          marginBottom: "24px",
          display: "flex",
          flexWrap: "wrap",
          gap: "16px",
          alignItems: "center",
          padding: "18px 24px",
        }}
      >
        {/* SEARCH */}
        <div style={{ flex: "1 1 240px" }}>
          <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>
            Search Name, ID, or Dept
          </label>
          <input
            type="text"
            className="input-field"
            placeholder="Search employee, ID, department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* DEPARTMENT FILTER */}
        <div style={{ flex: "1 1 160px" }}>
          <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>
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
          <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>
            Status
          </label>
          <select
            className="input-field"
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

        {/* START DATE */}
        <div style={{ flex: "1 1 140px" }}>
          <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>
            Start Date
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
          <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>
            End Date
          </label>
          <input
            type="date"
            className="input-field"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        {/* CLEAR FILTERS */}
        <div style={{ alignSelf: "flex-end" }}>
          <button
            className="btn btn-outline"
            style={{ padding: "10px 16px" }}
            onClick={() => {
              setSearchTerm("");
              setSelectedDept("all");
              setSelectedStatus("all");
              setStartDate("");
              setEndDate("");
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* METRIC BADGES STRIP */}
      <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginBottom: "20px" }}>
        <div className="badge-pill">Total Filtered: <strong>{filteredRecords.length}</strong></div>
        <div className="badge-pill" style={{ color: "#34d399", borderColor: "rgba(16, 185, 129, 0.3)" }}>
          Present: <strong>{filteredRecords.filter((r) => r.status === "present").length}</strong>
        </div>
        <div className="badge-pill" style={{ color: "#fbbf24", borderColor: "rgba(245, 158, 11, 0.3)" }}>
          Late: <strong>{filteredRecords.filter((r) => r.status === "late").length}</strong>
        </div>
        <div className="badge-pill" style={{ color: "#c084fc", borderColor: "rgba(168, 85, 247, 0.3)" }}>
          Half-Day: <strong>{filteredRecords.filter((r) => r.status === "half-day").length}</strong>
        </div>
      </div>

      {/* ATTENDANCE TABLE */}
      <div className="card" style={{ padding: "0", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Employee ID</th>
                <th>Department</th>
                <th>Date</th>
                <th>Check-In</th>
                <th>Check-Out</th>
                <th>Hours</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center", padding: "40px" }}>
                    Loading attendance records...
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                    No matching attendance records found.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                            color: "#fff",
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
                          <div style={{ fontWeight: 600 }}>{item.name}</div>
                          <div style={{ fontSize: "12px", color: "var(--text-dim)" }}>{item.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontFamily: "monospace", color: "var(--accent-cyan)" }}>
                      {item.employeeId}
                    </td>
                    <td>{item.department || "General"}</td>
                    <td style={{ fontWeight: 500 }}>{item.date}</td>
                    <td>{formatTime(item.checkInTime)}</td>
                    <td>{formatTime(item.checkOutTime)}</td>
                    <td style={{ fontWeight: 600 }}>
                      {typeof item.totalHours === "number" ? `${item.totalHours}h` : item.totalHours}
                    </td>
                    <td>
                      <span className={`status-pill ${item.status || "absent"}`}>
                        {item.status || "absent"}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => handleViewEmployee(item.userId)}
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DRILL-DOWN MODAL */}
      {selectedEmp && (
        <div className="modal-backdrop" onClick={() => setSelectedEmp(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "700px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
              <div>
                <h2 style={{ fontSize: "22px" }}>{selectedEmp.employee.name}</h2>
                <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                  {selectedEmp.employee.employeeId} • {selectedEmp.employee.department} • {selectedEmp.employee.email}
                </p>
              </div>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setSelectedEmp(null)}
                style={{ borderRadius: "50%", width: "32px", height: "32px", padding: 0 }}
              >
                ✕
              </button>
            </div>

            {/* STATS STRIP */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "24px" }}>
              <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "12px", borderRadius: "8px", textAlign: "center" }}>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Total Days</div>
                <div style={{ fontSize: "18px", fontWeight: 700, marginTop: "4px" }}>{selectedEmp.stats.totalDays}</div>
              </div>
              <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "12px", borderRadius: "8px", textAlign: "center" }}>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Present</div>
                <div style={{ fontSize: "18px", fontWeight: 700, marginTop: "4px", color: "#34d399" }}>
                  {selectedEmp.stats.presentDays}
                </div>
              </div>
              <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "12px", borderRadius: "8px", textAlign: "center" }}>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Late</div>
                <div style={{ fontSize: "18px", fontWeight: 700, marginTop: "4px", color: "#fbbf24" }}>
                  {selectedEmp.stats.lateDays}
                </div>
              </div>
              <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "12px", borderRadius: "8px", textAlign: "center" }}>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Total Hours</div>
                <div style={{ fontSize: "18px", fontWeight: 700, marginTop: "4px", color: "var(--accent-blue)" }}>
                  {selectedEmp.stats.totalHours}h
                </div>
              </div>
            </div>

            {/* RECENT ATTENDANCE HISTORY LIST */}
            <h4 style={{ fontSize: "15px", marginBottom: "12px" }}>Recent Attendance Entries</h4>
            <div style={{ maxHeight: "280px", overflowY: "auto", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "8px" }}>
              <table className="custom-table" style={{ fontSize: "13px" }}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Hours</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedEmp.history.slice(0, 15).map((h) => (
                    <tr key={h._id}>
                      <td>{h.date}</td>
                      <td>{formatTime(h.checkInTime)}</td>
                      <td>{formatTime(h.checkOutTime)}</td>
                      <td>{h.totalHours ? `${h.totalHours}h` : "-"}</td>
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
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
