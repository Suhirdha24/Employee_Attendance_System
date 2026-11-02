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

  // 1-Click Instant Demo Login
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
      addToast(res.payload || "Demo login failed.", "error");
    }
  };

  return (
    <div className="clean-login-wrapper">
      <div className="clean-login-card">
        {/* LOGO & HEADING */}
        <div style={{ textAlign: "center" }}>
          <div className="clean-brand-icon">
            ST
          </div>
          <h2 className="clean-login-title">
            Sign In to StaffTrack
          </h2>
          <p className="clean-login-subtitle">
            Choose a 1-click demo account or enter your credentials.
          </p>
        </div>

        {/* 1-CLICK DEMO ACCESS BUTTONS */}
        <div className="demo-role-grid">
          <button
            type="button"
            className="demo-role-btn employee"
            disabled={auth.loading}
            onClick={() => handleQuickDemoLogin("alex@company.com", "password123", "Employee")}
            title="Instant 1-Click Sign In as Employee"
          >
            <span className="demo-role-icon">👨‍💼</span>
            <div>
              <div className="demo-role-title">
                {demoSigningIn === "Employee" ? "Signing In..." : "Alex Johnson"}
              </div>
              <div className="demo-role-desc">Employee Demo</div>
            </div>
          </button>

          <button
            type="button"
            className="demo-role-btn manager"
            disabled={auth.loading}
            onClick={() => handleQuickDemoLogin("manager@company.com", "manager123", "Manager")}
            title="Instant 1-Click Sign In as Manager"
          >
            <span className="demo-role-icon">👩‍💼</span>
            <div>
              <div className="demo-role-title">
                {demoSigningIn === "Manager" ? "Signing In..." : "Eleanor Vance"}
              </div>
              <div className="demo-role-desc">Manager Demo</div>
            </div>
          </button>
        </div>

        {/* SUBTLE DIVIDER */}
        <div className="clean-divider">
          <span>or sign in with email</span>
        </div>

        {/* CREDENTIALS FORM */}
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
            className="btn btn-primary btn-clean-submit"
            disabled={auth.loading}
          >
            {auth.loading ? (
              <>
                <span className="spinner-icon"></span> Signing in...
              </>
            ) : (
              "Sign In"
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

        {/* FOOTER LINKS */}
        <div className="clean-footer-links">
          New team member?{" "}
          <Link to="/register" style={{ color: "var(--primary)", fontWeight: 700 }}>
            Register Account
          </Link>
        </div>

        <div className="clean-security-bar">
          <span>🔒</span> Secure 256-Bit Encrypted Session
        </div>
      </div>
    </div>
  );
}
