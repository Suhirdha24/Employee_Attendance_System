import React, { useEffect, useState } from "react";
import API from "../api/api";
import { useSelector } from "react-redux";
import "../styles/ManagerDashboard.css";

import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from "chart.js";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);

export default function ManagerDashboard() {
  const auth = useSelector((s) => s.auth);
  const [todayList, setTodayList] = useState([]);
  const [allList, setAllList] = useState([]);
  const [showToday, setShowToday] = useState(true);

  // Load today's attendance
  const loadToday = async () => {
    try {
      const res = await API.get("/attendance/all-today");
      setTodayList(res.data);
    } catch (err) {
      console.log(err);
      alert("Failed to load today's attendance");
    }
  };

  // Load all attendance
  const loadAll = async () => {
    try {
      const res = await API.get("/attendance/all");
      setAllList(res.data);
    } catch (err) {
      console.log(err);
      alert("Failed to load all attendance");
    }
  };

  useEffect(() => {
    loadToday();
    loadAll();
  }, []);

  // -----------------------
  // CSV EXPORT FUNCTION
  // -----------------------
  const exportCSV = (data, filename) => {
    if (!data || data.length === 0) return alert("No records to export!");

    const headers = [
      "Name",
      "Employee ID",
      "Date",
      "Check-in",
      "Check-out",
      "Hours",
      "Status",
    ];

    const rows = data.map((item) => [
      item.name || "-",
      item.employeeId || "-",
      item.date,
      item.checkInTime || "-",
      item.checkOutTime || "-",
      item.totalHours || "-",
      item.status,
    ]);

    let csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename + ".csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // ----------------------------------------------
  // 📊 CHART CONFIGURATIONS
  // ----------------------------------------------

  // Bar Chart – Present vs Absent
  const barData = {
    labels: ["Present", "Absent"],
    datasets: [
      {
        label: "Today",
        data: [
          todayList.filter((e) => e.status === "present").length,
          todayList.filter((e) => e.status === "absent").length,
        ],
        backgroundColor: ["#16a34a", "#dc2626"],
      },
    ],
  };

  // Line Chart – Last 7 records
  const lineData = {
    labels: allList.slice(0, 7).map((r) => r.date),
    datasets: [
      {
        label: "Hours Worked",
        data: allList.slice(0, 7).map((r) => r.totalHours || 0),
        borderColor: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.3)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  return (
    <div className="manager-wrapper">
      {/* ------------ SIDEBAR ------------ */}
      <aside className="sidebar">
        <h2 className="logo">📊 Manager</h2>
        <br></br>

        <nav className="menu">
          <button
            className={showToday ? "active" : ""}
            onClick={() => setShowToday(true)}
          >
            📅 Today's Report
          </button>

          <button
            className={!showToday ? "active" : ""}
            onClick={() => setShowToday(false)}
          >
            📁 All Records
          </button>

          <button
            className="export-btn"
            onClick={() =>
              exportCSV(
                showToday ? todayList : allList,
                showToday ? "today_report" : "all_records"
              )
            }
          >
            📤 Export CSV
          </button>
        </nav>
      </aside>

      {/* ------------ MAIN CONTENT ------------ */}
      <main className="main-content">
        <header className="page-header">
          <h1>Welcome, {auth?.user?.name}</h1>
          <span className="subtitle">Manager Dashboard</span>
        </header>

        {/* SUMMARY CARDS */}
        <div className="summary-row">
          <div className="summary-card green">
            <h3>{todayList.filter((e) => e.status === "present").length}</h3>
            <p>Present Today</p>
          </div>

          <div className="summary-card red">
            <h3>{todayList.filter((e) => e.status === "absent").length}</h3>
            <p>Absent Today</p>
          </div>

          <div className="summary-card blue">
            <h3>{allList.length}</h3>
            <p>Total Records</p>
          </div>
        </div>

        {/* ----------- CHARTS SECTION ----------- */}
        <h2 className="chart-title">📈 Attendance Analytics</h2>

        <div className="chart-box">
          <h3>Today: Present vs Absent</h3>
          <Bar data={barData} />
        </div>

        <div className="chart-box">
          <h3>Last 7 Records: Hours Worked</h3>
          <Line data={lineData} />
        </div>

        {/* ----------- TABLE SECTION ----------- */}
        <h2 className="table-title">
          {showToday ? "📅 Today's Attendance" : "📁 All Attendance Records"}
        </h2>

        <div className="table-container">
          <table className="styled-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Employee ID</th>
                <th>Date</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Hours</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {(showToday ? todayList : allList).map((item) => (
                <tr key={item._id}>
                  <td>{item.name || "-"}</td>
                  <td>{item.employeeId || "-"}</td>
                  <td>{item.date}</td>
                  <td>{item.checkInTime || "-"}</td>
                  <td>{item.checkOutTime || "-"}</td>
                  <td>{item.totalHours || "-"}</td>
                  <td
                    className={
                      item.status === "present" ? "present" : "absent"
                    }
                  >
                    {item.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
