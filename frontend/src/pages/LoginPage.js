import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, clearError } from "../features/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "../components/Toast";
import "../styles/LoginPage.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isEmailActive, setIsEmailActive] = useState(false);
  const [isPasswordActive, setIsPasswordActive] = useState(false);
  const [demoSigningIn, setDemoSigningIn] = useState(null);

  const emailInputName = useMemo(() => `workforce_email_${Math.random().toString(36).substring(7)}`, []);
  const passInputName = useMemo(() => `workforce_pass_${Math.random().toString(36).substring(7)}`, []);

  const dispatch = useDispatch();
  const auth = useSelector((s) => s.auth);
  const nav = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    // Check for remembered email
    try {
      const savedEmail = localStorage.getItem("stafftrack_remember_email");
      if (savedEmail) {
        setEmail(savedEmail);
        setIsEmailActive(true);
      }
    } catch (_) {}
  }, []);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    dispatch(clearError());

    if (rememberMe && email) {
      try {
        localStorage.setItem("stafftrack_remember_email", email);
      } catch (_) {}
    } else {
      try {
        localStorage.removeItem("stafftrack_remember_email");
      } catch (_) {}
    }

    const res = await dispatch(login({ email, password }));
    if (res.meta.requestStatus === "fulfilled") {
      addToast(`Welcome back, ${res.payload.user.name}!`, "success");
      const role = res.payload.user.role;
      if (role === "manager") nav("/manager");
      else nav("/employee");
    } else {
      addToast(res.payload || "Authentication failed. Please verify credentials.", "error");
    }
  };

  // Instant 1-Click Demo Login
  const handleQuickDemoLogin = async (demoEmail, demoPass, roleLabel) => {
    setDemoSigningIn(roleLabel);
    setEmail(demoEmail);
    setPassword(demoPass);
    setIsEmailActive(true);
    setIsPasswordActive(true);
    dispatch(clearError());

    const res = await dispatch(login({ email: demoEmail, password: demoPass }));
    setDemoSigningIn(null);

    if (res.meta.requestStatus === "fulfilled") {
      addToast(`Signed in as ${res.payload.user.name} (${res.payload.user.role === "manager" ? "Manager" : "Employee"})`, "success");
      const role = res.payload.user.role;
      if (role === "manager") nav("/manager");
      else nav("/employee");
    } else {
      addToast(res.payload || "Demo authentication failed.", "error");
    }
  };

  const fillDemoInputs = (demoEmail, demoPass) => {
    setIsEmailActive(true);
    setIsPasswordActive(true);
    setEmail(demoEmail);
    setPassword(demoPass);
    addToast("Demo credentials filled into form.", "info");
  };

  const clearToPlaceholders = () => {
    setEmail("");
    setPassword("");
    setIsEmailActive(false);
    setIsPasswordActive(false);
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-grid">
        {/* ================================================================ */}
        {/* LEFT PANEL: PRODUCT SHOWCASE & REAL-TIME WORKFORCE TELEMETRY     */}
        {/* ================================================================ */}
        <div className="login-showcase-panel">
          <div className="showcase-header">
            <div className="showcase-badge-row">
              <div className="showcase-brand-pill">
                <span>🏢</span> StaffTrack HRMS
              </div>
              <div className="showcase-status-pill">
                <span className="showcase-pulse-dot"></span> System Live & Operational
              </div>
            </div>

            <h1 className="showcase-title">
              Workforce attendance, built for clarity & speed.
            </h1>
            <p className="showcase-desc">
              Instant punch-ins, live workstation telemetry, and automated shift compliance designed for modern on-site & remote teams.
            </p>
          </div>

          {/* 3 Core Platform Capabilities */}
          <div className="showcase-features">
            <div className="feature-item">
              <div className="feature-icon-box icon-blue">
                ⚡
              </div>
              <div>
                <h4>1-Click Workstation Punch</h4>
                <p>Check in and out with live elapsed shift timers &amp; instant In-Office / Remote (WFH) mode switching.</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon-box icon-indigo">
                📊
              </div>
              <div>
                <h4>Real-Time Manager Roster</h4>
                <p>Live visibility into active shifts, daily punctuality tracking, and distinct historical archives.</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon-box icon-emerald">
                🛡️
              </div>
              <div>
                <h4>Role-Based Access &amp; Compliance</h4>
                <p>Strict role isolation for employees &amp; managers, automated audit trails, and instant CSV exports.</p>
              </div>
            </div>
          </div>

          {/* Live Attendance Simulation Widget */}
          <div className="showcase-live-widget">
            <div className="widget-header-row">
              <div className="widget-user-info">
                <div className="widget-avatar">AJ</div>
                <div>
                  <div className="widget-user-name">
                    Alex Johnson <span style={{ fontSize: "11px", opacity: 0.8 }}>(EMP1001)</span>
                  </div>
                  <div className="widget-user-role">Engineering • Office Workstation</div>
                </div>
              </div>
              <span className="widget-badge-active">
                <span className="showcase-pulse-dot" style={{ width: "6px", height: "6px" }}></span>
                Active Shift
              </span>
            </div>

            <div className="widget-metrics-grid">
              <div className="widget-metric-card">
                <span className="widget-metric-label">Punch Time</span>
                <span className="widget-metric-val">08:58 AM</span>
              </div>
              <div className="widget-metric-card">
                <span className="widget-metric-label">Live Duration</span>
                <span className="widget-metric-val" style={{ color: "#34d399" }}>02h 45m</span>
              </div>
              <div className="widget-metric-card">
                <span className="widget-metric-label">On-Time Rate</span>
                <span className="widget-metric-val">98.4%</span>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* RIGHT PANEL: HIGH-CONVERSION AUTHENTICATION CARD                 */}
        {/* ================================================================ */}
        <div className="login-auth-card">
          <div>
            <div className="auth-header">
              <div className="auth-brand-icon">
                ST
              </div>
              <h2 className="auth-title">Welcome Back</h2>
              <p className="auth-subtitle">
                Select a 1-click demo account below or sign in with your credentials.
              </p>
            </div>

            {/* 1-CLICK INSTANT DEMO PROFILES */}
            <div className="quick-demo-section">
              <div className="demo-section-header">
                <span className="demo-title-text">
                  <span>⚡</span> Instant 1-Click Demo Profiles
                </span>
                {(email || password) && (
                  <button
                    type="button"
                    onClick={clearToPlaceholders}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--primary)",
                      fontSize: "12px",
                      cursor: "pointer",
                      fontWeight: 600,
                      padding: 0,
                    }}
                  >
                    Clear Form
                  </button>
                )}
              </div>

              <div className="demo-cards-container">
                {/* Employee Demo Card */}
                <div className="demo-profile-card">
                  <div>
                    <div className="demo-profile-top">
                      <span className="demo-profile-avatar">👨‍💼</span>
                      <div>
                        <div className="demo-profile-name">Alex Johnson</div>
                        <div className="demo-profile-role">Employee • Engineering</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
                    <button
                      type="button"
                      className="btn-demo-instant"
                      disabled={auth.loading}
                      onClick={() => handleQuickDemoLogin("alex@company.com", "password123", "Employee")}
                    >
                      {demoSigningIn === "Employee" ? (
                        <>
                          <span className="spinner-icon" style={{ borderColor: "#1d4ed8 transparent transparent transparent" }}></span>
                          Signing in...
                        </>
                      ) : (
                        <>
                          <span>⚡</span> Sign In as Employee
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => fillDemoInputs("alex@company.com", "password123")}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--text-muted)",
                        fontSize: "11px",
                        cursor: "pointer",
                        textDecoration: "underline",
                        padding: "2px",
                      }}
                    >
                      Fill credentials only
                    </button>
                  </div>
                </div>

                {/* Manager Demo Card */}
                <div className="demo-profile-card">
                  <div>
                    <div className="demo-profile-top">
                      <span className="demo-profile-avatar">👩‍💼</span>
                      <div>
                        <div className="demo-profile-name">Eleanor Vance</div>
                        <div className="demo-profile-role">Manager • Operations</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
                    <button
                      type="button"
                      className="btn-demo-instant btn-demo-manager"
                      disabled={auth.loading}
                      onClick={() => handleQuickDemoLogin("manager@company.com", "manager123", "Manager")}
                    >
                      {demoSigningIn === "Manager" ? (
                        <>
                          <span className="spinner-icon" style={{ borderColor: "#7e22ce transparent transparent transparent" }}></span>
                          Signing in...
                        </>
                      ) : (
                        <>
                          <span>⚡</span> Sign In as Manager
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => fillDemoInputs("manager@company.com", "manager123")}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--text-muted)",
                        fontSize: "11px",
                        cursor: "pointer",
                        textDecoration: "underline",
                        padding: "2px",
                      }}
                    >
                      Fill credentials only
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="auth-divider-line">
              <span>or sign in manually</span>
            </div>

            {/* MANUAL LOGIN FORM */}
            <form onSubmit={handleLogin} autoComplete="off">
              <div style={{ position: "absolute", opacity: 0, height: 0, width: 0, zIndex: -1, overflow: "hidden" }} aria-hidden="true">
                <input type="text" name="dummy_email_prevent_autofill" tabIndex="-1" autoComplete="off" />
                <input type="password" name="dummy_password_prevent_autofill" tabIndex="-1" autoComplete="new-password" />
              </div>

              {/* Email Address */}
              <div className="form-group">
                <label className="form-label" htmlFor="corporate_email">
                  Email Address
                </label>
                <div className="field-wrapper">
                  <span className="field-icon-lead">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                    </svg>
                  </span>
                  <input
                    id="corporate_email"
                    name={emailInputName}
                    className="form-input input-with-icon"
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
              </div>

              {/* Password */}
              <div className="form-group">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <label className="form-label" htmlFor="corporate_password" style={{ marginBottom: 0 }}>
                    Password
                  </label>
                  <Link
                    to="/forget-password"
                    style={{ fontSize: "12px", color: "var(--primary)", fontWeight: 600 }}
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="field-wrapper">
                  <span className="field-icon-lead">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </span>
                  <input
                    id="corporate_password"
                    name={passInputName}
                    className="form-input input-with-icon"
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
                    className="field-btn-trail"
                    onClick={() => setShowPassword(!showPassword)}
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

              {/* Remember Me Checkbox */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "14px 0 18px" }}>
                <input
                  type="checkbox"
                  id="remember_device"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ width: "16px", height: "16px", accentColor: "var(--primary)", cursor: "pointer" }}
                />
                <label htmlFor="remember_device" style={{ fontSize: "13px", color: "var(--text-body)", cursor: "pointer", userSelect: "none" }}>
                  Remember my email on this device
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary btn-submit-login"
                disabled={auth.loading}
              >
                {auth.loading ? (
                  <>
                    <span className="spinner-icon"></span> Signing in...
                  </>
                ) : (
                  <>
                    Sign In to Dashboard <span>→</span>
                  </>
                )}
              </button>

              {/* Error Banner */}
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
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  <span>⚠️</span> {auth.error}
                </div>
              )}
            </form>
          </div>

          <div>
            <div className="auth-footer">
              New team member?{" "}
              <Link to="/register" style={{ color: "var(--primary)", fontWeight: 700 }}>
                Register Account →
              </Link>
            </div>

            <div className="security-assurance-bar">
              <span>🔒</span> 256-Bit Encrypted Session • Role-Based Access Control
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
