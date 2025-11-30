import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import API from "../api/api";
import { useSelector } from "react-redux";

export default function EmployeeHistory() {
  const auth = useSelector((s) => s.auth);
  const userId = auth?.user?.id;

  const [history, setHistory] = useState([]);
  const [view, setView] = useState("table"); // table | calendar

  const loadHistory = async () => {
    const res = await API.get(`/attendance/my-history?userId=${userId}`);
    setHistory(res.data);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const isPresent = (date) => {
    const formatted = date.toISOString().split("T")[0];
    return history.some((h) => h.date === formatted);
  };

  return (
    <div className="history-wrapper">
      <h2>Attendance History</h2>

      <div className="toggle-buttons">
        <button className={view === "table" ? "active" : ""} onClick={() => setView("table")}>
          📋 Table View
        </button><br></br>

        <button className={view === "calendar" ? "active" : ""} onClick={() => setView("calendar")}>
          📅 Calendar View
        </button><br></br>
      </div>

      {/* TABLE VIEW */}
      {view === "table" && (
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
            {history.map((item) => (
              <tr key={item._id}>
                <td>{item.date}</td>
                <td>{item.checkInTime || "-"}</td>
                <td>{item.checkOutTime || "-"}</td>
                <td>{item.totalHours || "-"}</td>
                <td className={item.status === "present" ? "present" : "absent"}>
                  {item.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* CALENDAR VIEW */}
      {view === "calendar" && (
        <Calendar
          tileClassName={({ date }) =>
            isPresent(date) ? "present-day" : "absent-day"
          }
        />
      )}
    </div>
  );
}
