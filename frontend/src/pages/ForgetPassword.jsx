import React, { useState } from "react";
import API from "../api/api";

export default function ForgetPassword() {
  const [email, setEmail] = useState("");

  const submit = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/password/request-reset", { email });
      alert("Email found! Redirecting to reset page...");
      localStorage.setItem("resetUserId", res.data.id);
      window.location.href = "/reset-password";
    } catch (err) {
      alert(err.response?.data?.message || "Email not found");
    }
  };

  return (
    <div className="card">
      <h2>Forgot Password</h2>
      <form onSubmit={submit}>
        <input
          type="email"
          placeholder="Enter your registered email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button className="btn">Submit</button>
      </form>
    </div>
  );
}
