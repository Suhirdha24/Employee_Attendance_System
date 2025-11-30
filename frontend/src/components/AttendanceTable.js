import React from 'react';

export default function AttendanceTable({ data = [] }){
  return (
    <table className="table">
      <thead>
        <tr><th>Date</th><th>Check-in</th><th>Check-out</th><th>Hours</th><th>Status</th></tr>
      </thead>
      <tbody>
        {data.length === 0 && <tr><td colSpan="5">No records</td></tr>}
        {data.map(r => (
          <tr key={r._id}>
            <td>{r.date}</td>
            <td>{r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString() : '-'}</td>
            <td>{r.checkOutTime ? new Date(r.checkOutTime).toLocaleTimeString() : '-'}</td>
            <td>{r.totalHours || '-'}</td>
            <td>{r.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
