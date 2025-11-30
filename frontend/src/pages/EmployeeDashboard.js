import React, { useEffect, useState } from "react";
import API from "../api/api";
import { useSelector } from "react-redux";
import "./Dashboard.css";

export default function EmployeeDashboard() {
  const auth = useSelector((state) => state.auth);
  const userId = auth?.user?.id;

  const [todayStatus, setTodayStatus] = useState(null);
  const [history, setHistory] = useState([]);

  // Format time
  const formatTime = (time) => {
    if (!time) return "-";
    const d = new Date(time);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const loadStatus = async () => {
    if (!userId) return;
    const res = await API.get(`/attendance/today?userId=${userId}`);
    setTodayStatus(res.data);
  };

  const loadHistory = async () => {
    if (!userId) return;
    const res = await API.get(`/attendance/my-history?userId=${userId}`);
    setHistory(res.data);
  };

  const handleCheckIn = async () => {
    try {
      await API.post("/attendance/checkin", { userId });
      alert("Check-in successful!");
      loadStatus();
      loadHistory();
    } catch (err) {
      alert(err.response?.data?.message || "Already checked in.");
    }
  };

  const handleCheckOut = async () => {
    try {
      await API.post("/attendance/checkout", { userId });
      alert("Check-out successful!");
      loadStatus();
      loadHistory();
    } catch (err) {
      alert(err.response?.data?.message || "Already checked out.");
    }
  };

  useEffect(() => {
    loadStatus();
    loadHistory();
  }, [userId]);

  return (
    <div className="dash-container">
      <h2 className="dash-title">Employee Dashboard</h2>
      <h3 className="dash-welcome">Welcome, {auth?.user?.name}</h3>

      {/* TODAY CARD */}
      <div className="dash-card">
        <h3>Today's Status</h3>
        <p className="status-text">
          Status:{" "}
          <span className={todayStatus?.status === "present" ? "green" : "red"}>
            {todayStatus?.status?.toUpperCase()}
          </span>
        </p>

        <div className="btn-group">
          <button onClick={handleCheckIn} className="btn-primary">
            Check In
          </button>
          <button onClick={handleCheckOut} className="btn-secondary">
            Check Out
          </button>
        </div>
      </div>

      {/* HISTORY TABLE */}
      <h3 className="dash-subtitle">My Attendance History</h3>
      <table className="styled-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Check-in</th>
            <th>Check-out</th>
            <th>Hours</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {history.length === 0 ? (
            <tr>
              <td colSpan="5">No Records Found</td>
            </tr>
          ) : (
            history.map((h) => (
              <tr key={h._id}>
                <td>{h.date}</td>
                <td>{formatTime(h.checkInTime)}</td>
                <td>{formatTime(h.checkOutTime)}</td>
                <td>{h.totalHours || "-"}</td>
                <td><br></br>
                  <span className={h.status === "present" ? "green" : "red"}>
                    {h.status}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
