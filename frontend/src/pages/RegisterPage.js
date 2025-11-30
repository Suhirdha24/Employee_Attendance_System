import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { register } from "../features/authSlice";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("employee");

  const dispatch = useDispatch();
  const auth = useSelector((s) => s.auth);
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    const res = await dispatch(register({ name, email, password, role }));

    if (res.meta.requestStatus === "fulfilled") {
      alert("Registration Successful!");
      nav("/login");
    }
  };

  return (
    <div className="card">
      <h2>Register</h2>

      <form onSubmit={submit}>
        <input 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="Name" 
          required 
        />

        <input 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          placeholder="Email" 
          type="email" 
          required 
        />

        <input 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="Password" 
          type="password" 
          required 
        />

        {/* ROLE SELECTION */}
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="employee">Employee</option>
          <option value="manager">Manager</option>
        </select>

        <button type="submit" className="btn">Register</button>

        {auth.error && <p className="error">{auth.error}</p>}
      </form>
    </div>
  );
}
