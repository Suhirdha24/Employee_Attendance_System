import React, { useEffect, useState } from "react";
import API from "../api/api";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

export default function ManagerCharts() {
  const [dashboardData, setDashboardData] = useState(null);
  const [todayList, setTodayList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([API.get("/dashboard/manager"), API.get("/attendance/all-today")])
      .then(([dashRes, todayRes]) => {
        setDashboardData(dashRes.data);
        setTodayList(todayRes.data);
      })
      .catch((err) => console.error("Error loading analytics:", err))
      .finally(() => setLoading(false));
  }, []);

  // Employee hours data for today
  const employeeHoursData = todayList.map((e) => ({
    name: e.name ? e.name.split(" ")[0] : "Emp",
    fullName: e.name,
    department: e.department || "General",
    hours: typeof e.totalHours === "number" ? e.totalHours : parseFloat(e.totalHours) || 0,
    status: e.status,
  }));

  // Daily trends for the past 7 days
  const dailyTrends = dashboardData?.dailyTrends || [];

  return (
    <div style={{ width: "100%", paddingBottom: "48px" }}>
      {/* HEADER */}
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
            Data Intelligence
          </span>
          <h1 style={{ fontSize: "28px", marginTop: "2px" }}>Workforce Analytics & Trend Visualizer</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "2px" }}>
            Visual analysis of daily shift durations, 7-day presence curves, and departmental workloads
          </p>
        </div>

        <Link to="/manager" className="btn btn-outline" style={{ textDecoration: "none" }}>
          ← Back to Operations Portal
        </Link>
      </div>

      {/* CHARTS GRID */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(480px, 1fr))", gap: "24px" }}>
        {/* CHART 1: TODAY'S HOURS BY EMPLOYEE */}
        <div className="card">
          <div style={{ marginBottom: "16px" }}>
            <h2 style={{ fontSize: "18px", color: "var(--text-main)" }}>Today: Working Hours per Employee</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
              Active shift durations recorded for employees today
            </p>
          </div>

          <div style={{ width: "100%", height: 320 }}>
            {employeeHoursData.length === 0 ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)" }}>
                {loading ? "Loading chart data..." : "No employee activity logged yet today."}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={employeeHoursData} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} unit="h" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      boxShadow: "var(--shadow-md)",
                      color: "#0f172a",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                  <Bar dataKey="hours" name="Hours Worked" fill="#1e3a8a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* CHART 2: 7-DAY ATTENDANCE & HOURS TREND */}
        <div className="card">
          <div style={{ marginBottom: "16px" }}>
            <h2 style={{ fontSize: "18px", color: "var(--text-main)" }}>7-Day Team Trend: Turnout & Aggregate Hours</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
              Daily present staff count and combined company hours
            </p>
          </div>

          <div style={{ width: "100%", height: 320 }}>
            {dailyTrends.length === 0 ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)" }}>
                {loading ? "Loading trend series..." : "No trend history recorded yet."}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyTrends} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      boxShadow: "var(--shadow-md)",
                      color: "#0f172a",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                  <Line
                    type="monotone"
                    dataKey="present"
                    name="Employees Present"
                    stroke="#059669"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="hours"
                    name="Total Team Hours"
                    stroke="#2563eb"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
