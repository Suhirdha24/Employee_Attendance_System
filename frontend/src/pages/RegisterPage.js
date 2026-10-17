import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { register, clearError } from "../features/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "../components/Toast";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("Engineering");
  const [role, setRole] = useState("employee");

  const dispatch = useDispatch();
  const auth = useSelector((s) => s.auth);
  const nav = useNavigate();
  const { addToast } = useToast();

  const handleRegister = async (e) => {
    e.preventDefault();
    dispatch(clearError());

    const res = await dispatch(register({ name, email, password, role, department }));
    if (res.meta.requestStatus === "fulfilled") {
      addToast("Account registered successfully! Welcome aboard.", "success");
      if (role === "manager") nav("/manager");
      else nav("/employee");
    } else {
      addToast(res.payload || "Registration failed", "error");
    }
  };

  return (
    <div style={{ maxWidth: "480px", margin: "50px auto", padding: "0 16px" }}>
      <div className="card glass-card">
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              background: "var(--accent-gradient)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
              margin: "0 auto 12px",
            }}
          >
            🚀
          </div>
          <h2 style={{ fontSize: "24px" }}>Create an Account</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>
            Join the team and start logging your attendance
          </p>
        </div>

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Johnson"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Work Email</label>
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
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select
                className="form-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Department</label>
              <select
                className="form-select"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option value="Engineering">Engineering</option>
                <option value="UI/UX Design">UI/UX Design</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Marketing">Marketing</option>
                <option value="Finance">Finance</option>
                <option value="Management">Management</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "12px", padding: "12px" }}
            disabled={auth.loading}
          >
            {auth.loading ? "Creating Account..." : "Create Account"}
          </button>

          {auth.error && (
            <p style={{ color: "#f87171", fontSize: "13px", marginTop: "12px", textAlign: "center" }}>
              {auth.error}
            </p>
          )}
        </form>

        <div style={{ marginTop: "24px", textAlign: "center", fontSize: "13px", color: "var(--text-muted)" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ fontWeight: 600 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
