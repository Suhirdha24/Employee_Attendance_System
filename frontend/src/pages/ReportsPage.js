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
      { name: "Present", value: metrics.present, color: "#10b981" },
      { name: "Late", value: metrics.late, color: "#f59e0b" },
      { name: "Half-Day", value: metrics.halfDay, color: "#a855f7" },
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
      "Check-In",
      "Check-Out",
      "Hours Logged",
      "Status",
    ];

    const rows = filteredAttendance.map((r) => [
      `"${(r.name || "").replace(/"/g, '""')}"`,
      `"${r.employeeId || ""}"`,
      `"${r.department || "General"}"`,
      r.date,
      r.checkInTime ? `"${new Date(r.checkInTime).toLocaleTimeString()}"` : `"-"`,
      r.checkOutTime ? `"${new Date(r.checkOutTime).toLocaleTimeString()}"` : `"-"`,
      r.totalHours || "0",
      `"${r.status || "absent"}"`,
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
    addToast("Report exported successfully as CSV!", "success");
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
          <span style={{ fontSize: "12px", color: "var(--accent-green)", fontWeight: 700, textTransform: "uppercase" }}>
            Executive Reporting
          </span>
          <h1 style={{ fontSize: "30px", marginTop: "2px" }}>Attendance Reports & Audits</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "2px" }}>
            Comprehensive performance metrics, department evaluations, and audit exports
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button className="btn btn-primary" onClick={handleExportReportCSV}>
            📥 Download Report CSV
          </button>
          <Link to="/manager" className="btn btn-outline">
            Dashboard
          </Link>
          <Link to="/manager/charts" className="btn btn-outline">
            Visual Analytics
          </Link>
        </div>
      </div>

      {/* FILTER BAR */}
      <div
        className="card"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "24px",
          padding: "16px 24px",
        }}
      >
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
              Timeframe
            </label>
            <select
              className="input-field"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              style={{ width: "auto" }}
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days (Monthly)</option>
              <option value="all">All Time Records</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
              Department Filter
            </label>
            <select
              className="input-field"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              style={{ width: "auto" }}
            >
              <option value="all">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="UI/UX Design">UI/UX Design</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Marketing">Marketing</option>
              <option value="Finance">Finance</option>
            </select>
          </div>
        </div>

        <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>
          Analyzing <strong>{metrics.totalRecords}</strong> entries across <strong>{employees.length}</strong> employees
        </div>
      </div>

      {/* KPI CARDS GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "18px",
          marginBottom: "28px",
        }}
      >
        <div className="card" style={{ borderLeft: "4px solid var(--accent-cyan)" }}>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase" }}>Attendance Rate</div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--accent-cyan)", marginTop: "6px" }}>
            {metrics.attendanceRate}%
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-dim)", marginTop: "4px" }}>Weighted compliance score</div>
        </div>

        <div className="card" style={{ borderLeft: "4px solid #10b981" }}>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase" }}>Punctuality Rate</div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#10b981", marginTop: "6px" }}>
            {metrics.punctualityRate}%
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-dim)", marginTop: "4px" }}>Checked in before 09:30 AM</div>
        </div>

        <div className="card" style={{ borderLeft: "4px solid var(--accent-blue)" }}>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase" }}>Avg Daily Hours</div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--accent-blue)", marginTop: "6px" }}>
            {metrics.avgHours} hrs
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-dim)", marginTop: "4px" }}>Per employee active shift</div>
        </div>

        <div className="card" style={{ borderLeft: "4px solid var(--accent-purple)" }}>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase" }}>Total Logged Hours</div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--accent-purple)", marginTop: "6px" }}>
            {metrics.totalHours} h
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-dim)", marginTop: "4px" }}>Total workforce productivity</div>
        </div>
      </div>

      {/* CHARTS ROW */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
          gap: "24px",
          marginBottom: "28px",
        }}
      >
        {/* CHART: DEPARTMENT ATTENDANCE RATE */}
        <div className="card">
          <h2 style={{ fontSize: "18px", marginBottom: "4px" }}>Department Attendance Compliance (%)</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "16px" }}>
            Comparative turnout rates across organizational departments
          </p>

          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentStats} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.06)" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} />
                <YAxis stroke="#9ca3af" fontSize={12} domain={[0, 100]} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(17, 24, 39, 0.95)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="attendanceRate" name="Attendance %" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART: STATUS BREAKDOWN PIE */}
        <div className="card">
          <h2 style={{ fontSize: "18px", marginBottom: "4px" }}>Attendance Status Distribution</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "16px" }}>
            Proportion of Present, Late, and Half-day occurrences
          </p>

          <div style={{ width: "100%", height: 260, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {statusPieData.length === 0 ? (
              <div style={{ color: "var(--text-muted)" }}>No attendance records in selected timeframe.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* DEPARTMENT AUDIT SUMMARY TABLE */}
      <div className="card" style={{ padding: "0", overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <h2 style={{ fontSize: "18px" }}>Department Audit Summary</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "2px" }}>
            Detailed breakdown of departmental headcount, working hours, and performance
          </p>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Headcount</th>
                <th>Audited Records</th>
                <th>Attendance Rate</th>
                <th>Avg Working Hours</th>
                <th>Total Hours</th>
                <th style={{ textAlign: "right" }}>Health Rating</th>
              </tr>
            </thead>
            <tbody>
              {departmentStats.map((dept, idx) => {
                const isHealthy = dept.attendanceRate >= 80;
                return (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600 }}>{dept.name}</td>
                    <td>{dept.headcount} members</td>
                    <td>{dept.totalRecords} shifts</td>
                    <td style={{ fontWeight: 700, color: isHealthy ? "#34d399" : "#fbbf24" }}>
                      {dept.attendanceRate}%
                    </td>
                    <td>{dept.avgHours} hrs/day</td>
                    <td>{dept.totalHours} hrs</td>
                    <td style={{ textAlign: "right" }}>
                      <span
                        className="badge-pill"
                        style={{
                          color: isHealthy ? "#34d399" : "#fbbf24",
                          borderColor: isHealthy ? "rgba(16, 185, 129, 0.3)" : "rgba(245, 158, 11, 0.3)",
                        }}
                      >
                        {isHealthy ? "✓ Optimal" : "⚠️ Needs Review"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
