import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, clearError } from "../features/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "../components/Toast";
import "../styles/LoginPage.css";

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState("employee"); // "employee" or "manager"
  const [email, setEmail] = useState("alex@company.com");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isEmailActive, setIsEmailActive] = useState(false);
  const [isPasswordActive, setIsPasswordActive] = useState(false);

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

  const handleRoleSwitch = (role) => {
    setSelectedRole(role);
    dispatch(clearError());
    setIsEmailActive(true);
    setIsPasswordActive(true);

    if (role === "employee") {
      setEmail("alex@company.com");
      setPassword("password123");
    } else {
      setEmail("manager@company.com");
      setPassword("manager123");
    }
  };

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
      addToast(`Authenticated as ${res.payload.user.name}`, "success");
      const role = res.payload.user.role;
      if (role === "manager") nav("/manager");
      else nav("/employee");
    } else {
      addToast(res.payload || "Authentication failed. Please verify credentials.", "error");
    }
  };

  // Enterprise SSO 1-Click Authentication
  const handleSSOLogin = async () => {
    dispatch(clearError());
    const ssoEmail = selectedRole === "manager" ? "manager@company.com" : "alex@company.com";
    const ssoPass = selectedRole === "manager" ? "manager123" : "password123";

    setEmail(ssoEmail);
    setPassword(ssoPass);

    const res = await dispatch(login({ email: ssoEmail, password: ssoPass }));
    if (res.meta.requestStatus === "fulfilled") {
      addToast(`SAML SSO verified. Welcome, ${res.payload.user.name}`, "success");
      const role = res.payload.user.role;
      if (role === "manager") nav("/manager");
      else nav("/employee");
    } else {
      addToast(res.payload || "SSO validation failed.", "error");
    }
  };

  return (
    <div className="corp-login-page">
      <div className="corp-login-container">
        {/* UNIFIED AUTHENTICATION CARD */}
        <div className="corp-auth-card">
          {/* CORPORATE BRAND HEADER */}
          <div className="corp-brand-header">
            <div className="corp-emblem-badge">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5"></path>
                <path d="M2 12l10 5 10-5"></path>
              </svg>
            </div>

            <div className="corp-company-row">
              <span className="corp-company-name">StaffTrack</span>
              <span className="corp-tier-pill">Enterprise</span>
            </div>

            <h1 className="corp-login-title">Sign in to your organization</h1>
            <p className="corp-login-desc">Enter your corporate credentials to access your attendance workspace.</p>
          </div>

          {/* SEGMENTED ROLE SWITCHER */}
          <div className="corp-role-segment">
            <button
              type="button"
              className={`corp-role-tab ${selectedRole === "employee" ? "active" : ""}`}
              onClick={() => handleRoleSwitch("employee")}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              Employee Portal
            </button>
            <button
              type="button"
              className={`corp-role-tab ${selectedRole === "manager" ? "active" : ""}`}
              onClick={() => handleRoleSwitch("manager")}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              Manager Console
            </button>
          </div>

          {/* ACTIVE ROLE CONTEXT BANNER */}
          <div className="corp-demo-banner">
            <div className="corp-demo-info">
              <span className="corp-demo-dot"></span>
              <div className="corp-demo-text">
                {selectedRole === "employee" ? (
                  <>
                    Workspace: <strong>Alex Johnson</strong> • Engineering (EMP1001)
                  </>
                ) : (
                  <>
                    Workspace: <strong>Eleanor Vance</strong> • Operations (MGR2001)
                  </>
                )}
              </div>
            </div>
            <button
              type="button"
              className="corp-btn-quickfill"
              onClick={handleSSOLogin}
              title="Authenticate directly with this role"
            >
              1-Click Sign In →
            </button>
          </div>

          {/* FORM */}
          <form onSubmit={handleLogin} autoComplete="off">
            <div style={{ position: "absolute", opacity: 0, height: 0, width: 0, zIndex: -1, overflow: "hidden" }} aria-hidden="true">
              <input type="text" name="dummy_email_prevent_autofill" tabIndex="-1" autoComplete="off" />
              <input type="password" name="dummy_password_prevent_autofill" tabIndex="-1" autoComplete="new-password" />
            </div>

            {/* Corporate Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="corporate_email" style={{ fontSize: "13px", fontWeight: 600, color: "#334155" }}>
                Corporate Email
              </label>
              <div className="corp-field-wrapper">
                <span className="corp-field-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                  </svg>
                </span>
                <input
                  id="corporate_email"
                  name={emailInputName}
                  className="corp-input"
                  type="email"
                  autoComplete="off"
                  readOnly={!isEmailActive}
                  onFocus={() => setIsEmailActive(true)}
                  onClick={() => setIsEmailActive(true)}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label className="form-label" htmlFor="corporate_password" style={{ marginBottom: 0, fontSize: "13px", fontWeight: 600, color: "#334155" }}>
                  Password
                </label>
                <Link
                  to="/forget-password"
                  style={{ fontSize: "12px", color: "#4338ca", fontWeight: 600 }}
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="corp-field-wrapper">
                <span className="corp-field-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </span>
                <input
                  id="corporate_password"
                  name={passInputName}
                  className="corp-input"
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
                  className="corp-btn-eye"
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

            {/* Remember Device */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "14px 0 18px" }}>
              <input
                type="checkbox"
                id="remember_corp_device"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ width: "15px", height: "15px", accentColor: "#4338ca", cursor: "pointer" }}
              />
              <label htmlFor="remember_corp_device" style={{ fontSize: "13px", color: "#475569", cursor: "pointer", userSelect: "none" }}>
                Remember device for 30 days
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="corp-btn-submit"
              disabled={auth.loading}
            >
              {auth.loading ? (
                <>
                  <span className="corp-spinner"></span> Authenticating...
                </>
              ) : (
                <>
                  Sign In to Workspace <span>→</span>
                </>
              )}
            </button>

            {/* Error Message */}
            {auth.error && (
              <div className="corp-error-banner">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span>{auth.error}</span>
              </div>
            )}
          </form>

          {/* SINGLE SIGN-ON (SSO) OPTION */}
          <div className="corp-divider">
            <span>or corporate identity</span>
          </div>

          <button
            type="button"
            className="corp-btn-sso"
            onClick={handleSSOLogin}
            disabled={auth.loading}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4338ca" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            Single Sign-On (SAML / Okta)
          </button>
        </div>

        {/* CORPORATE TRUST & COMPLIANCE FOOTER */}
        <div className="corp-trust-footer">
          <div className="corp-compliance-row">
            <span className="corp-compliance-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              TLS 1.3 Encrypted
            </span>
            <span className="corp-compliance-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              SOC 2 Type II
            </span>
            <span className="corp-compliance-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
              GDPR Compliant
            </span>
          </div>

          <div className="corp-footer-links">
            <Link to="/register">Register Organization</Link>
            <span>•</span>
            <a href="#privacy">Privacy</a>
            <span>•</span>
            <a href="#terms">Terms</a>
            <span>•</span>
            <span style={{ color: "#059669", display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", display: "inline-block" }}></span>
              Systems Operational
            </span>
          </div>

          <div className="corp-copyright">
            © 2026 StaffTrack Technologies Inc. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}
