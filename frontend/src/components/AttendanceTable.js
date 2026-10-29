import React from 'react';

export default function AttendanceTable({ data = [] }) {
  const formatTime = (isoString) => {
    if (!isoString || isoString === '-') return '-';
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="custom-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Mode</th>
            <th>Check-In</th>
            <th>Check-Out</th>
            <th>Duration</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                No attendance logs found.
              </td>
            </tr>
          ) : (
            data.map((r) => (
              <tr key={r._id || r.date}>
                <td style={{ fontWeight: 600 }}>{r.date}</td>
                <td>
                  <span className={`badge-workmode ${(r.workMode || 'Office').toLowerCase()}`}>
                    {r.workMode === 'Remote' ? '🌐 Remote' : '🏢 Office'}
                  </span>
                </td>
                <td style={{ fontFamily: 'monospace' }}>{formatTime(r.checkInTime)}</td>
                <td style={{ fontFamily: 'monospace' }}>{formatTime(r.checkOutTime)}</td>
                <td style={{ fontWeight: 600 }}>
                  {typeof r.totalHours === 'number' ? `${r.totalHours} hrs` : r.totalHours || '-'}
                </td>
                <td>
                  <span className={`status-pill ${r.status || 'absent'}`}>
                    {r.status || 'absent'}
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
