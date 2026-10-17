import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, clearError } from "../features/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "../components/Toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const auth = useSelector((s) => s.auth);
  const nav = useNavigate();
  const { addToast } = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    dispatch(clearError());

    const res = await dispatch(login({ email, password }));
    if (res.meta.requestStatus === "fulfilled") {
      addToast(`Welcome back, ${res.payload.user.name}!`, "success");
      const role = res.payload.user.role;
      if (role === "manager") nav("/manager");
      else nav("/employee");
    } else {
      addToast(res.payload || "Login failed", "error");
    }
  };

  const autofill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div style={{ maxWidth: "440px", margin: "60px auto", padding: "0 16px" }}>
      <div className="card glass-card">
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              background: "var(--primary-gradient)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
              margin: "0 auto 12px",
              boxShadow: "var(--glow-primary)",
            }}
          >
            🔒
          </div>
          <h2 style={{ fontSize: "24px" }}>Welcome Back</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>
            Sign in to access your attendance workspace
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              className="form-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. alex@company.com"
              required
            />
          </div>

          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label className="form-label">Password</label>
              <Link
                to="/forget-password"
                style={{ fontSize: "12px", color: "var(--primary)", textDecoration: "none" }}
              >
                Forgot Password?
              </Link>
            </div>
            <input
              className="form-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "8px", padding: "12px" }}
            disabled={auth.loading}
          >
            {auth.loading ? "Signing In..." : "Sign In"}
          </button>

          {auth.error && (
            <p style={{ color: "#f87171", fontSize: "13px", marginTop: "12px", textAlign: "center" }}>
              {auth.error}
            </p>
          )}
        </form>

        {/* QUICK DEMO CREDENTIALS */}
        <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid var(--border-subtle)" }}>
          <p style={{ fontSize: "12px", color: "var(--text-dim)", textAlign: "center", marginBottom: "10px" }}>
            Quick Demo Autofill:
          </p>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ flex: 1, fontSize: "12px" }}
              onClick={() => autofill("alex@company.com", "password123")}
            >
              👤 Employee
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ flex: 1, fontSize: "12px" }}
              onClick={() => autofill("manager@company.com", "manager123")}
            >
              📊 Manager
            </button>
          </div>
        </div>

        <div style={{ marginTop: "20px", textAlign: "center", fontSize: "13px", color: "var(--text-muted)" }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ fontWeight: 600 }}>
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}
