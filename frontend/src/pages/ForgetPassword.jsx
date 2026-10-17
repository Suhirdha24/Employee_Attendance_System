import React, { useState } from "react";
import API from "../api/api";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../components/Toast";

export default function ForgetPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await API.post("/auth/request-reset", { email });
      addToast("Email verified! Redirecting to password reset...", "success");
      localStorage.setItem("resetUserId", res.data.id);
      setTimeout(() => nav("/reset-password"), 1000);
    } catch (err) {
      addToast(err.response?.data?.message || "Email not registered", "error");
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
              background: "rgba(245, 158, 11, 0.15)",
              color: "#fbbf24",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              margin: "0 auto 12px",
            }}
          >
            🔑
          </div>
          <h2 style={{ fontSize: "22px" }}>Forgot Password</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "4px" }}>
            Enter your registered email to reset your account password
          </p>
        </div>

        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Registered Email</label>
            <input
              className="form-input"
              type="email"
              placeholder="e.g. alex@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", padding: "12px" }}
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify & Continue"}
          </button>
        </form>

        <div style={{ marginTop: "20px", textAlign: "center", fontSize: "13px" }}>
          <Link to="/login" style={{ color: "var(--text-muted)" }}>
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
