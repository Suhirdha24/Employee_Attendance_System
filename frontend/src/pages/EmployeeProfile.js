import React from "react";
import { useSelector } from "react-redux";

export default function EmployeeProfile() {
  const { user } = useSelector((s) => s.auth);

  return (
    <div className="card profile-card">
      <h2>My Profile</h2><br></br>
      <p><strong>Name:</strong> {user.name}</p><br></br>
      <p><strong>Employee ID:</strong> {user.employeeId}</p><br></br>
      <p><strong>Email:</strong> {user.email}</p><br></br>
      <p><strong>Role:</strong> {user.role}</p>
    </div>
  );
}
