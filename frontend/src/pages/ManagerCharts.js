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
    <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
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
          <span style={{ fontSize: "12px", color: "var(--accent-cyan)", fontWeight: 700, textTransform: "uppercase" }}>
            Data Intelligence
          </span>
          <h1 style={{ fontSize: "28px", marginTop: "2px" }}>Workforce Analytics & Trends</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "2px" }}>
            Visual analysis of shift durations, 7-day presence curves, and team workloads
          </p>
        </div>

        <Link to="/manager" className="btn btn-outline" style={{ textDecoration: "none" }}>
          ← Back to Command Center
        </Link>
      </div>

      {/* CHARTS GRID */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(480px, 1fr))", gap: "24px" }}>
        {/* CHART 1: TODAY'S HOURS BY EMPLOYEE */}
        <div className="card">
          <div style={{ marginBottom: "16px" }}>
            <h2 style={{ fontSize: "18px" }}>Today: Working Hours per Employee</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
              Logged shift durations for all employees today
            </p>
          </div>

          <div style={{ width: "100%", height: 320 }}>
            {employeeHoursData.length === 0 ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-dim)" }}>
                {loading ? "Loading chart data..." : "No employee activity logged yet today."}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={employeeHoursData} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.06)" />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} unit="h" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(17, 24, 39, 0.95)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                  <Bar dataKey="hours" name="Hours Worked" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* CHART 2: 7-DAY ATTENDANCE & HOURS TREND */}
        <div className="card">
          <div style={{ marginBottom: "16px" }}>
            <h2 style={{ fontSize: "18px" }}>7-Day Team Trend: Presence & Total Hours</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
              Aggregated daily present count and total company hours
            </p>
          </div>

          <div style={{ width: "100%", height: 320 }}>
            {dailyTrends.length === 0 ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-dim)" }}>
                {loading ? "Loading trends..." : "No trend history recorded yet."}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyTrends} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.06)" />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={11} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(17, 24, 39, 0.95)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                  <Line
                    type="monotone"
                    dataKey="present"
                    name="Employees Present"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="hours"
                    name="Total Team Hours"
                    stroke="#06b6d4"
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
