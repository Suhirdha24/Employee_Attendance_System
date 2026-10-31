import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, clearError } from "../features/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "../components/Toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailActive, setIsEmailActive] = useState(false);
  const [isPasswordActive, setIsPasswordActive] = useState(false);

  const emailInputName = useMemo(() => `workforce_email_${Math.random().toString(36).substring(7)}`, []);
  const passInputName = useMemo(() => `workforce_pass_${Math.random().toString(36).substring(7)}`, []);

  const dispatch = useDispatch();
  const auth = useSelector((s) => s.auth);
  const nav = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    setEmail("");
    setPassword("");
    const timer = setTimeout(() => {
      setEmail("");
      setPassword("");
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    dispatch(clearError());

    const res = await dispatch(login({ email, password }));
    if (res.meta.requestStatus === "fulfilled") {
      addToast(`Welcome back, ${res.payload.user.name}`, "success");
      const role = res.payload.user.role;
      if (role === "manager") nav("/manager");
      else nav("/employee");
    } else {
      addToast(res.payload || "Authentication failed", "error");
    }
  };

  const autofill = (demoEmail, demoPass) => {
    setIsEmailActive(true);
    setIsPasswordActive(true);
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  const clearToPlaceholders = () => {
    setEmail("");
    setPassword("");
    setIsEmailActive(false);
    setIsPasswordActive(false);
  };

  return (
    <div style={{ maxWidth: "460px", margin: "40px auto 60px", padding: "0 16px" }}>
      <div className="card" style={{ padding: "40px 36px", boxShadow: "var(--shadow-lg)" }}>
        {/* LOGO & HEADING */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "var(--radius-md)",
              background: "var(--primary-gradient)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              fontWeight: 800,
              margin: "0 auto 16px",
              boxShadow: "0 4px 12px rgba(79, 70, 229, 0.35)",
            }}
          >
            ST
          </div>
          <h2 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-main)", letterSpacing: "-0.02em" }}>
            Sign In to StaffTrack
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "13.5px", marginTop: "4px" }}>
            Enter your email and password to access your account.
          </p>
        </div>

        <form onSubmit={handleLogin} autoComplete="off">
          <div style={{ position: "absolute", opacity: 0, height: 0, width: 0, zIndex: -1, overflow: "hidden" }} aria-hidden="true">
            <input type="text" name="dummy_email_prevent_autofill" tabIndex="-1" autoComplete="off" />
            <input type="password" name="dummy_password_prevent_autofill" tabIndex="-1" autoComplete="new-password" />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="corporate_email">Email Address</label>
            <input
              id="corporate_email"
              name={emailInputName}
              className="form-input"
              type="email"
              autoComplete="off"
              readOnly={!isEmailActive}
              onFocus={() => setIsEmailActive(true)}
              onClick={() => setIsEmailActive(true)}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. alex@company.com"
              required
            />
          </div>

          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <label className="form-label" htmlFor="corporate_password" style={{ marginBottom: 0 }}>Password</label>
              <Link
                to="/forget-password"
                style={{ fontSize: "12px", color: "var(--primary)", fontWeight: 600 }}
              >
                Forgot Password?
              </Link>
            </div>
            <div style={{ position: "relative" }}>
              <input
                id="corporate_password"
                name={passInputName}
                className="form-input"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                readOnly={!isPasswordActive}
                onFocus={() => setIsPasswordActive(true)}
                onClick={() => setIsPasswordActive(true)}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{ paddingRight: "42px" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  padding: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "4px",
                }}
                aria-label={showPassword ? "Hide password" : "Show password"}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "10px", padding: "12px", fontSize: "14.5px" }}
            disabled={auth.loading}
          >
            {auth.loading ? "Signing in..." : "Sign In"}
          </button>

          {auth.error && (
            <div
              style={{
                marginTop: "14px",
                padding: "10px 14px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "var(--radius-md)",
                color: "#991b1b",
                fontSize: "13px",
                textAlign: "center",
              }}
            >
              {auth.error}
            </div>
          )}
        </form>

        {/* QUICK DEMO CREDENTIALS */}
        <div style={{ marginTop: "28px", paddingTop: "20px", borderTop: "1px solid var(--border-subtle)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600, margin: 0, textTransform: "uppercase" }}>
              Quick Demo Accounts:
            </p>
            {(email || password) && (
              <button
                type="button"
                onClick={clearToPlaceholders}
                style={{ background: "none", border: "none", color: "var(--primary)", fontSize: "12px", cursor: "pointer", fontWeight: 600, padding: 0 }}
              >
                Clear Inputs
              </button>
            )}
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ flex: 1, fontSize: "12px", background: "#f8fafc" }}
              onClick={() => autofill("alex@company.com", "password123")}
            >
              👨‍💼 Alex (Employee)
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ flex: 1, fontSize: "12px", background: "#f8fafc" }}
              onClick={() => autofill("manager@company.com", "manager123")}
            >
              👩‍💼 Eleanor (Manager)
            </button>
          </div>
        </div>

        <div style={{ marginTop: "24px", textAlign: "center", fontSize: "13px", color: "var(--text-muted)" }}>
          New team member?{" "}
          <Link to="/register" style={{ color: "var(--primary)", fontWeight: 700 }}>
            Register Account
          </Link>
        </div>
      </div>
    </div>
  );
}
