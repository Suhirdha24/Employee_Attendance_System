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
      addToast("Password reset successfully. Please sign in with your new password.", "success");
      localStorage.removeItem("resetUserId");
      setTimeout(() => nav("/login"), 1200);
    } catch (err) {
      addToast(err.response?.data?.message || "Error resetting password", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "420px", margin: "60px auto", padding: "0 16px" }}>
      <div className="card" style={{ padding: "36px 32px" }}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "8px",
              background: "var(--status-present-bg)",
              color: "var(--status-present-text)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              fontWeight: 800,
              margin: "0 auto 14px",
              border: "1px solid var(--status-present-border)",
            }}
          >
            SEC
          </div>
          <h2 style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-main)" }}>Set New Password</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "4px" }}>
            Enter and confirm your new corporate account password
          </p>
        </div>

        <form onSubmit={submit} autoComplete="off">
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="Minimum 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", padding: "11px", marginTop: "4px" }}
            disabled={loading}
          >
            {loading ? "Updating Credentials..." : "Update Password"}
          </button>
        </form>

        <div style={{ marginTop: "24px", textAlign: "center", fontSize: "13px" }}>
          <Link to="/login" style={{ color: "var(--text-muted)" }}>
            Cancel & Return to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
