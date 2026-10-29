import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import API from "../api/api";
import { Link } from "react-router-dom";
import { useToast } from "../components/Toast";
import { getMe } from "../features/authSlice";

export default function EmployeeProfile() {
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'edit' | 'security'
  const [summary, setSummary] = useState(null);

  // Edit profile state
  const [name, setName] = useState(user?.name || "");
  const [department, setDepartment] = useState(user?.department || "Engineering");
  const [savingProfile, setSavingProfile] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setDepartment(user.department || "General");
    }
  }, [user]);

  useEffect(() => {
    API.get("/attendance/my-summary")
      .then((res) => setSummary(res.data))
      .catch((err) => console.log(err));
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await API.put("/auth/profile", { name, department });
      addToast(res.data?.message || "Profile updated successfully!", "success");
      dispatch(getMe());
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to update profile", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return addToast("New passwords do not match", "error");
    }
    if (newPassword.length < 6) {
      return addToast("Password must be at least 6 characters", "error");
    }

    setSavingPassword(true);
    try {
      const res = await API.put("/auth/profile", {
        currentPassword,
        newPassword,
      });
      addToast(res.data?.message || "Password changed successfully!", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to change password", "error");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "20px auto 48px" }}>
      <div className="card">
        {/* PROFILE HEADER WITH AVATAR */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "20px",
            paddingBottom: "24px",
            borderBottom: "1px solid var(--border-subtle)",
            marginBottom: "20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "8px",
                background: "var(--primary-light)",
                border: "1px solid var(--primary-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "26px",
                fontWeight: 800,
                color: "var(--primary)",
              }}
            >
              {user?.name?.charAt(0) || "U"}
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <h1 style={{ fontSize: "22px", color: "var(--text-main)" }}>{user?.name}</h1>
                <span className={`role-pill ${user?.role}`}>{user?.role}</span>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "3px" }}>
                {user?.department || "General"} Department • ID:{" "}
                <strong style={{ fontFamily: "monospace", color: "var(--text-main)" }}>
                  {user?.employeeId}
                </strong>
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              className={`filter-chip ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>
            <button
              className={`filter-chip ${activeTab === "edit" ? "active" : ""}`}
              onClick={() => setActiveTab("edit")}
            >
              Edit Details
            </button>
            <button
              className={`filter-chip ${activeTab === "security" ? "active" : ""}`}
              onClick={() => setActiveTab("security")}
            >
              Security
            </button>
          </div>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "16px",
                marginBottom: "28px",
              }}
            >
              <div style={{ background: "var(--bg-surface)", padding: "16px", borderRadius: "6px", border: "1px solid var(--border-subtle)" }}>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Employee ID</span>
                <p style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-main)", marginTop: "4px", fontFamily: "monospace" }}>
                  {user?.employeeId}
                </p>
              </div>

              <div style={{ background: "var(--bg-surface)", padding: "16px", borderRadius: "6px", border: "1px solid var(--border-subtle)" }}>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Work Email</span>
                <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-main)", marginTop: "4px" }}>
                  {user?.email}
                </p>
              </div>

              <div style={{ background: "var(--bg-surface)", padding: "16px", borderRadius: "6px", border: "1px solid var(--border-subtle)" }}>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Assigned Unit</span>
                <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-main)", marginTop: "4px" }}>
                  {user?.department || "General"}
                </p>
              </div>

              <div style={{ background: "var(--bg-surface)", padding: "16px", borderRadius: "6px", border: "1px solid var(--border-subtle)" }}>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Access Permission</span>
                <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-main)", marginTop: "4px", textTransform: "capitalize" }}>
                  Standard {user?.role}
                </p>
              </div>
            </div>

            {/* ATTENDANCE HIGHLIGHTS */}
            {summary && (
              <div style={{ background: "var(--bg-surface)", padding: "20px", borderRadius: "8px", border: "1px solid var(--border-subtle)", marginBottom: "28px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "16px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Career Attendance Compliance Record
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", textAlign: "center" }}>
                  <div style={{ background: "#ffffff", padding: "14px", borderRadius: "6px", border: "1px solid var(--border-subtle)" }}>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Compliance Rate</span>
                    <p style={{ fontSize: "22px", fontWeight: 800, color: "var(--status-present-text)", marginTop: "2px" }}>
                      {summary.attendancePercentage}%
                    </p>
                  </div>
                  <div style={{ background: "#ffffff", padding: "14px", borderRadius: "6px", border: "1px solid var(--border-subtle)" }}>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Shifts Logged</span>
                    <p style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-main)", marginTop: "2px" }}>
                      {summary.totalDaysRecorded}
                    </p>
                  </div>
                  <div style={{ background: "#ffffff", padding: "14px", borderRadius: "6px", border: "1px solid var(--border-subtle)" }}>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Total Hours</span>
                    <p style={{ fontSize: "22px", fontWeight: 800, color: "var(--primary)", marginTop: "2px" }}>
                      {summary.totalHours}h
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: EDIT PROFILE */}
        {activeTab === "edit" && (
          <form onSubmit={handleUpdateProfile} style={{ marginBottom: "28px" }}>
            <h3 style={{ fontSize: "16px", marginBottom: "16px", color: "#0f172a" }}>Edit Profile Information</h3>
            <div className="form-group">
              <label className="form-label">Full Legal Name</label>
              <input
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Department / Unit</label>
              <select
                className="form-select"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option value="Engineering">Engineering</option>
                <option value="Marketing">Marketing</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
                <option value="UI/UX Design">UI/UX Design</option>
                <option value="Management">Management</option>
                <option value="General">General</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Corporate Email (Read-Only)</label>
              <input
                className="form-input"
                value={user?.email || ""}
                disabled
                style={{ background: "#f1f5f9", cursor: "not-allowed" }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={savingProfile}
              style={{ padding: "10px 24px" }}
            >
              {savingProfile ? "Saving Changes..." : "Save Profile Details"}
            </button>
          </form>
        )}

        {/* TAB 3: PASSWORD & SECURITY */}
        {activeTab === "security" && (
          <form onSubmit={handleChangePassword} style={{ marginBottom: "28px" }}>
            <h3 style={{ fontSize: "16px", marginBottom: "16px", color: "#0f172a" }}>Update Password</h3>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                className="form-input"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type new password"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={savingPassword}
              style={{ padding: "10px 24px" }}
            >
              {savingPassword ? "Updating Password..." : "Update Password"}
            </button>
          </form>
        )}

        <div style={{ display: "flex", gap: "12px", borderTop: "1px solid var(--border-subtle)", paddingTop: "20px" }}>
          <Link to="/employee" className="btn btn-outline" style={{ flex: 1, textDecoration: "none" }}>
            ← Return to Dashboard
          </Link>
          <Link to="/employee/history" className="btn btn-primary" style={{ flex: 1, textDecoration: "none" }}>
            View Detailed Shift History →
          </Link>
        </div>
      </div>
    </div>
  );
}
