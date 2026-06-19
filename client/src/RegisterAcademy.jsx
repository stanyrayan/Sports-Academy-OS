import React, { useState } from "react";
import api, { setAuthToken } from "./api";

export default function RegisterAcademy({ onRegister, onNavigate }) {
  const [form, setForm] = useState({
    academyName: "",
    location: "",
    adminName: "",
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/register-academy", form);
      const token = res.data.token;
      const user = res.data.user;
      
      // Fix: Use setAuthToken to ensure the API client attaches the token to future requests
      setAuthToken(token);
      onRegister(user);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-screen">
      <div className="login-panel" style={{ maxWidth: "500px", background: "rgba(248, 250, 246, 0.97)" }}>
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: "800", color: "#0f172a", margin: "0 0 10px 0" }}>Create Your Academy</h2>
          <p style={{ color: "#64748b", margin: 0 }}>Set up your free workspace in seconds.</p>
        </div>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "grid", gap: "20px", gridTemplateColumns: "1fr 1fr" }}>
            <label style={{ display: "flex", flexDirection: "column", gap: "8px", fontWeight: "600", color: "#334155" }}>
              Academy Name
              <input required value={form.academyName} onChange={e => setForm({...form, academyName: e.target.value})} style={{ padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "8px", fontWeight: "600", color: "#334155" }}>
              City / Location
              <input required value={form.location} onChange={e => setForm({...form, location: e.target.value})} style={{ padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
            </label>
          </div>

          <label style={{ display: "flex", flexDirection: "column", gap: "8px", fontWeight: "600", color: "#334155" }}>
            Your Name (Admin)
            <input required value={form.adminName} onChange={e => setForm({...form, adminName: e.target.value})} style={{ padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: "8px", fontWeight: "600", color: "#334155" }}>
            Email Address
            <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} style={{ padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: "8px", fontWeight: "600", color: "#334155" }}>
            Password
            <input required type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} style={{ padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
          </label>

          {error && <div style={{ padding: "12px", background: "#fef2f2", color: "#ef4444", borderRadius: "8px", fontSize: "0.9rem" }}>{error}</div>}

          <button disabled={loading} style={{
            background: "#0f172a",
            color: "white",
            padding: "14px",
            borderRadius: "8px",
            border: "none",
            fontWeight: "bold",
            fontSize: "1.1rem",
            cursor: "pointer",
            marginTop: "10px"
          }}>
            {loading ? "Creating..." : "Launch Academy Workspace"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "30px", color: "#64748b" }}>
          Already have an account? <button onClick={() => onNavigate("login")} style={{ background: "none", border: "none", color: "#3b82f6", fontWeight: "bold", cursor: "pointer" }}>Sign in</button>
        </div>
      </div>
    </div>
  );
}
