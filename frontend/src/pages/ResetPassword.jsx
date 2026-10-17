import React, { useState } from "react";
import API from "../api/api";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../components/Toast";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const id = localStorage.getItem("resetUserId");
  const { addToast } = useToast();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();

    if (!id) {
      addToast("Session expired. Please request password reset again.", "error");
      return nav("/forget-password");
    }

    if (newPassword.length < 6) {
      return addToast("Password must be at least 6 characters", "warning");
    }

    if (newPassword !== confirmPassword) {
      return addToast("Passwords do not match", "warning");
    }

    setLoading(true);

    try {
      await API.post("/auth/reset-password", { id, newPassword });
      addToast("Password reset successfully! Please sign in.", "success");
      localStorage.removeItem("resetUserId");
      setTimeout(() => nav("/login"), 1500);
    } catch (err) {
      addToast(err.response?.data?.message || "Error resetting password", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "420px", margin: "60px auto", padding: "0 16px" }}>
      <div className="card glass-card">
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: "rgba(16, 185, 129, 0.15)",
              color: "#34d399",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              margin: "0 auto 12px",
            }}
          >
            🛡️
          </div>
          <h2 style={{ fontSize: "22px" }}>Set New Password</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "4px" }}>
            Enter and confirm your new secure password
          </p>
        </div>

        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-success"
            style={{ width: "100%", padding: "12px" }}
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>

        <div style={{ marginTop: "20px", textAlign: "center", fontSize: "13px" }}>
          <Link to="/login" style={{ color: "var(--text-muted)" }}>
            Cancel & Return to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
