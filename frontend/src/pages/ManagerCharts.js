import React, { useEffect, useState } from "react";
import API from "../api/api";
import { useSelector } from "react-redux";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import { Link } from "react-router-dom";
import "../styles/ManagerDashboard.css";

export default function ManagerCharts() {
  const auth = useSelector((s) => s.auth);
  const [todayList, setTodayList] = useState([]);

  const loadToday = async () => {
    try {
      const res = await API.get("/attendance/all-today");
      setTodayList(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadToday();
  }, []);

  const chartData = todayList.map((e) => ({
    name: e.name,
    hours: e.totalHours === "-" ? 0 : Number(e.totalHours),
  }));

  return (
    <div className="manager-wrapper">

      {/* SIDEBAR */}
      <aside className="sidebar">
        <h2 className="logo">📊 Manager</h2>

        <nav className="menu">
          <Link to="/manager"><button>📅 Today's Report</button></Link>
          <Link to="/manager"><button>📁 All Records</button></Link>
          <button className="active">📈 Visualization</button>
        </nav>
      </aside>

      {/* CHART PAGE */}
      <main className="main-content">
        <h2>📈 Daily Working Hours Chart</h2>

        <div className="chart-box">
          <BarChart width={700} height={350} data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis label={{ value: "Hours", angle: -90, position: "insideLeft" }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="hours" fill="#4b7bec" />
          </BarChart>
        </div>
      </main>

    </div>
  );
}
