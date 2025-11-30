import React, { useState } from "react";
import API from "../api/api";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const id = localStorage.getItem("resetUserId");

  const submit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/password/reset", { id, newPassword });
      alert("Password reset successful!");
      window.location.href = "/";
    } catch (err) {
      alert("Error resetting password");
    }
  };

  return (
    <div className="card">
      <h2>Reset Password</h2>
      <form onSubmit={submit}>
        <input
          type="password"
          placeholder="Enter new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <button className="btn">Reset Password</button>
      </form>
    </div>
  );
}

