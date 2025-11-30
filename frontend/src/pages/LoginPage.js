import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../features/authSlice';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const auth = useSelector((s) => s.auth);
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    const res = await dispatch(login({ email, password }));
    if (res.meta.requestStatus === 'fulfilled') {
      const role = res.payload.user.role;
      if (role === 'employee') nav('/employee');
      else nav('/manager');
    }
  };

  return (
    <div className="card" style={{ width: "350px", margin: "80px auto", padding: "20px" }}>
      <h2 style={{ textAlign: "center" }}>Login</h2>

      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />

        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
          required
        />

        <button className="btn" type="submit" style={{ width: "100%" }}>
          Login
        </button>

        {/* --- Forgot Password Link --- */}
        <p style={{ marginTop: "10px", textAlign: "center" }}>
          <a
            href="/forget-password"
            style={{ color: "blue", textDecoration: "underline", cursor: "pointer" }}
          >
            Forgot Password?
          </a>
        </p>

        {auth.error && (
          <p className="error" style={{ color: "red", textAlign: "center" }}>
            {auth.error}
          </p>
        )}
      </form>
    </div>
  );
}
