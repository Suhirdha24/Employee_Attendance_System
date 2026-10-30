import React, { useEffect, useState, useMemo } from "react";
import API from "../api/api";
import { Link } from "react-router-dom";
import { useToast } from "../components/Toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function ReportsPage() {
  const { addToast } = useToast();

  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedDept, setSelectedDept] = useState("all");
  const [timeRange, setTimeRange] = useState("30"); // '7' | '30' | 'all'

  const loadData = async () => {
    try {
      setLoading(true);
      const [attRes, todayRes] = await Promise.all([
        API.get("/attendance/all"),
        API.get("/attendance/today-status"),
      ]);
      setAttendance(attRes.data);
      setEmployees(todayRes.data);
    } catch (err) {
      console.error("Reports data load error:", err);
      addToast("Failed to load reports data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter attendance by time range and department
  const filteredAttendance = useMemo(() => {
    let list = attendance;

    if (timeRange !== "all") {
      const days = parseInt(timeRange, 10);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      const cutoffStr = cutoff.toISOString().slice(0, 10);
      list = list.filter((r) => r.date >= cutoffStr);
    }

    if (selectedDept !== "all") {
      list = list.filter(
        (r) => r.department && r.department.toLowerCase() === selectedDept.toLowerCase()
      );
    }

    return list;
  }, [attendance, timeRange, selectedDept]);

  // Overall KPI Metrics
  const metrics = useMemo(() => {
    const totalRecords = filteredAttendance.length;
    const present = filteredAttendance.filter((r) => r.status === "present").length;
    const late = filteredAttendance.filter((r) => r.status === "late").length;
    const halfDay = filteredAttendance.filter((r) => r.status === "half-day").length;
    const remote = filteredAttendance.filter((r) => r.workMode === "Remote").length;
    const office = filteredAttendance.filter((r) => r.workMode !== "Remote").length;

    const totalHours = filteredAttendance.reduce(
      (sum, r) => sum + (typeof r.totalHours === "number" ? r.totalHours : parseFloat(r.totalHours) || 0),
      0
    );

    const attendanceRate = totalRecords > 0 ? (((present + late + halfDay * 0.5) / totalRecords) * 100).toFixed(1) : 0;
    const punctualityRate = (present + late) > 0 ? ((present / (present + late)) * 100).toFixed(1) : 100;
    const avgHours = totalRecords > 0 ? (totalHours / totalRecords).toFixed(1) : 0;

    return {
      totalRecords,
      present,
      late,
      halfDay,
      remote,
      office,
      totalHours: parseFloat(totalHours.toFixed(1)),
      attendanceRate,
      punctualityRate,
      avgHours,
    };
  }, [filteredAttendance]);

  // Department-wise breakdown
  const departmentStats = useMemo(() => {
    const depts = ["Engineering", "UI/UX Design", "Human Resources", "Marketing", "Finance"];

    return depts.map((d) => {
      const records = filteredAttendance.filter(
        (r) => r.department && r.department.toLowerCase() === d.toLowerCase()
      );
      const deptEmployees = employees.filter(
        (e) => e.department && e.department.toLowerCase() === d.toLowerCase()
      );

      const count = records.length;
      const present = records.filter((r) => r.status === "present").length;
      const late = records.filter((r) => r.status === "late").length;
      const halfDay = records.filter((r) => r.status === "half-day").length;
      const totalH = records.reduce(
        (sum, r) => sum + (typeof r.totalHours === "number" ? r.totalHours : parseFloat(r.totalHours) || 0),
        0
      );

      const rate = count > 0 ? (((present + late + halfDay * 0.5) / count) * 100).toFixed(1) : 0;
      const avg = count > 0 ? (totalH / count).toFixed(1) : 0;

      return {
        name: d,
        headcount: deptEmployees.length,
        totalRecords: count,
        attendanceRate: parseFloat(rate),
        avgHours: parseFloat(avg),
        totalHours: parseFloat(totalH.toFixed(1)),
      };
    });
  }, [filteredAttendance, employees]);

  // Status breakdown for Pie Chart
  const statusPieData = useMemo(() => {
    return [
      { name: "Present", value: metrics.present, color: "#059669" },
      { name: "Late", value: metrics.late, color: "#d97706" },
      { name: "Half-Day", value: metrics.halfDay, color: "#4f46e5" },
    ].filter((item) => item.value > 0);
  }, [metrics]);

  // Work Mode breakdown for Pie Chart
  const workModePieData = useMemo(() => {
    return [
      { name: "In-Office", value: metrics.office, color: "#1e3a8a" },
      { name: "Remote", value: metrics.remote, color: "#0284c7" },
    ].filter((item) => item.value > 0);
  }, [metrics]);

  // Export Report to CSV
  const handleExportReportCSV = () => {
    if (filteredAttendance.length === 0) {
      return addToast("No data to export", "warning");
    }

    const headers = [
      "Employee Name",
      "Employee ID",
      "Department",
      "Date",
      "Work Mode",
      "Check-In",
      "Check-Out",
      "Hours Logged",
      "Status",
      "Remarks",
    ];

    const rows = filteredAttendance.map((r) => [
      `"${(r.name || "").replace(/"/g, '""')}"`,
      `"${r.employeeId || ""}"`,
      `"${r.department || "General"}"`,
      r.date,
      `"${r.workMode || "Office"}"`,
      r.checkInTime ? `"${new Date(r.checkInTime).toLocaleTimeString()}"` : `"-"`,
      r.checkOutTime ? `"${new Date(r.checkOutTime).toLocaleTimeString()}"` : `"-"`,
      r.totalHours || "0",
      `"${r.status || "absent"}"`,
      `"${(r.remarks || "").replace(/"/g, '""')}"`,
    ]);

    const csv = [headers.join(","), ...rows.map((e) => e.join(","))].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `attendance_report_${timeRange}_days_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast("Audit report exported successfully as CSV", "success");
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
            Reports & Analytics
          </span>
          <h1 style={{ fontSize: "28px", marginTop: "2px" }}>Attendance Reports</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "2px" }}>
            Department summaries, attendance breakdown, and exportable reports.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button className="btn btn-primary btn-sm" onClick={handleExportReportCSV}>
            📥 Export Report (CSV)
          </button>
          <Link to="/manager" className="btn btn-outline btn-sm" style={{ textDecoration: "none" }}>
            ← Operations Portal
          </Link>
        </div>
      </div>

      {/* TIMEFRAME & DEPT FILTERS BAR */}
      <div
        className="card"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "4px", fontWeight: 600 }}>
              Audit Timeframe
            </label>
            <select
              className="input-field"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              style={{ width: "auto" }}
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days (Monthly Cycle)</option>
              <option value="all">All-Time Historical</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "4px", fontWeight: 600 }}>
              Department Scope
            </label>
            <select
              className="input-field"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              style={{ width: "auto" }}
            >
              <option value="all">All Organizational Units</option>
              <option value="Engineering">Engineering</option>
              <option value="UI/UX Design">UI/UX Design</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Marketing">Marketing</option>
              <option value="Finance">Finance</option>
            </select>
          </div>
        </div>

        <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>
          Auditing <strong>{metrics.totalRecords}</strong> records across <strong>{employees.length}</strong> active staff members
        </div>
      </div>

      {/* KPI CARDS GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div className="card" style={{ borderLeft: "4px solid var(--primary)" }}>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Attendance Rate</div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--primary)", marginTop: "6px" }}>
            {metrics.attendanceRate}%
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-dim)", marginTop: "4px" }}>Weighted compliance score</div>
        </div>

        <div className="card" style={{ borderLeft: "4px solid #059669" }}>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Punctuality Rate</div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#059669", marginTop: "6px" }}>
            {metrics.punctualityRate}%
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-dim)", marginTop: "4px" }}>On-time arrivals (&le; 09:30 AM)</div>
        </div>

        <div className="card" style={{ borderLeft: "4px solid #2563eb" }}>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Work Mode Split</div>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-main)", marginTop: "6px" }}>
            {metrics.office} / {metrics.remote}
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-dim)", marginTop: "4px" }}>🏢 Office vs 🌐 Remote shifts</div>
        </div>

        <div className="card" style={{ borderLeft: "4px solid var(--accent-blue)" }}>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Total Verified Hours</div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--accent-blue)", marginTop: "6px" }}>
            {metrics.totalHours}h
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-dim)", marginTop: "4px" }}>Cumulative workforce time</div>
        </div>

        <div className="card" style={{ borderLeft: "4px solid #d97706" }}>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Daily Avg Hours</div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#d97706", marginTop: "6px" }}>
            {metrics.avgHours}h
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-dim)", marginTop: "4px" }}>Average hours per shift</div>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: "24px", marginBottom: "24px" }}>
        {/* CHART 1: ATTENDANCE CLASSIFICATION BREAKDOWN */}
        <div className="card">
          <h3 style={{ fontSize: "16px", marginBottom: "4px", color: "var(--text-main)" }}>Shift Classification Breakdown</h3>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>
            Proportion of present, late arrivals, and half-day shifts
          </p>

          <div style={{ width: "100%", height: "260px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={50}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid var(--border-medium)",
                    borderRadius: "6px",
                    boxShadow: "var(--shadow-md)",
                    fontSize: "12px",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: WORK MODE DISTRIBUTION */}
        <div className="card">
          <h3 style={{ fontSize: "16px", marginBottom: "4px", color: "var(--text-main)" }}>Work Mode Distribution</h3>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>
            Office workstation vs authorized remote attendance
          </p>

          <div style={{ width: "100%", height: "260px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={workModePieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={50}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {workModePieData.map((entry, index) => (
                    <Cell key={`cell-wm-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid var(--border-medium)",
                    borderRadius: "6px",
                    boxShadow: "var(--shadow-md)",
                    fontSize: "12px",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* DEPARTMENT-WISE BENCHMARK AUDIT TABLE */}
      <div className="card" style={{ padding: "0", overflow: "hidden" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-subtle)" }}>
          <h3 style={{ fontSize: "16px", color: "var(--text-main)" }}>Department Performance Benchmarks</h3>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
            Detailed breakdown of headcount, shift logs, compliance percentage, and productive hours
          </p>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Unit / Department</th>
                <th>Headcount</th>
                <th>Audited Shifts</th>
                <th>Avg Working Hours</th>
                <th>Total Production Hours</th>
                <th>Compliance Rate</th>
              </tr>
            </thead>
            <tbody>
              {departmentStats.map((dept) => (
                <tr key={dept.name}>
                  <td style={{ fontWeight: 600, color: "var(--text-main)" }}>{dept.name}</td>
                  <td>{dept.headcount} employees</td>
                  <td>{dept.totalRecords} shifts</td>
                  <td>{dept.avgHours} hrs/day</td>
                  <td style={{ fontWeight: 600, color: "var(--primary)" }}>{dept.totalHours} hrs</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ flex: 1, height: "6px", background: "var(--bg-surface)", borderRadius: "3px", overflow: "hidden" }}>
                        <div
                          style={{
                            width: `${Math.min(100, dept.attendanceRate)}%`,
                            height: "100%",
                            background: dept.attendanceRate >= 90 ? "#059669" : dept.attendanceRate >= 75 ? "#d97706" : "#dc2626",
                          }}
                        />
                      </div>
                      <span style={{ fontSize: "12px", fontWeight: 700, width: "42px" }}>
                        {dept.attendanceRate}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
