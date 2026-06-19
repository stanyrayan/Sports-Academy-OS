import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BadgeCheck,
  BarChart3,
  CalendarCheck,
  CreditCard,
  FileCheck2,
  LogOut,
  ShieldCheck,
  UploadCloud,
  Users
} from "lucide-react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip
} from "recharts";
import api, { setAuthToken } from "./api";
import LandingPage from "./LandingPage";
import RegisterAcademy from "./RegisterAcademy";

const demoAccounts = [
  { role: "Admin", email: "admin@cric.test", password: "admin123" },
  { role: "Coach", email: "coach@cric.test", password: "coach123" },
  { role: "Player", email: "player@cric.test", password: "player123" }
];

const defaultMetrics = {
  agility: "Speed & Agility",
  strength: "Power & Strength",
  fitness: "Stamina",
  gameAwareness: "Game IQ",
  pressureIndex: "Mental Toughness"
};

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);
}

function toRadarData(assessment, customMetrics = defaultMetrics) {
  if (!assessment) return [];
  return Object.entries(customMetrics).map(([key, label]) => ({
    metric: label,
    value: assessment.ratings?.[key] ?? assessment[key] ?? 0
  }));
}

function StatusPill({ children, tone = "neutral" }) {
  return <span className={`pill pill-${tone}`}>{children}</span>;
}

function StatCard({ icon: Icon, label, value, hint }) {
  return (
    <section className="stat-card">
      <div className="stat-icon">
        <Icon size={20} />
      </div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        {hint ? <span>{hint}</span> : null}
      </div>
    </section>
  );
}

function Login({ onLogin, onNavigate }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data } = await api.post("/auth/login", form);
      setAuthToken(data.token);
      onLogin(data.user);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-screen">
      <section className="login-panel">
        <div className="brand-mark">
          <ShieldCheck size={30} />
        </div>
        <h1>SportsAcademy-OS</h1>
        <p className="muted">Multi-tenant academy operations, verified selection documents, and Skill-DNA tracking.</p>

        <form onSubmit={submit} className="form-stack">
          <label>
            Email
            <input
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              type="email"
              required
            />
          </label>
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={{ marginBottom: 0 }}>Password</label>
              <button type="button" onClick={() => onNavigate("forgot-password")} style={{ background: "none", border: "none", color: "#3b82f6", fontSize: "0.85rem", cursor: "pointer", padding: 0 }}>Forgot?</button>
            </div>
            <input
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              type="password"
              required
            />
          </div>
          {error ? <div className="error-box">{error}</div> : null}
          <button className="primary-action" disabled={loading} type="submit">
            {loading ? "Signing in..." : "Open dashboard"}
          </button>
        </form>
        <div style={{ textAlign: "center", marginTop: "20px", color: "#64748b", fontSize: "0.95rem" }}>
          Don't have an academy? <button type="button" onClick={() => onNavigate("landing")} style={{ background: "none", border: "none", color: "#3b82f6", fontWeight: "bold", cursor: "pointer", fontSize: "0.95rem" }}>Go back home</button>
        </div>
      </section>
    </main>
  );
}

function ForgotPassword({ onNavigate }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      setMessage(data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-screen">
      <section className="login-panel">
        <div className="brand-mark"><ShieldCheck size={30} /></div>
        <h1>Reset Password</h1>
        <p className="muted">Enter your email to receive a password reset link.</p>
        
        <form onSubmit={submit} className="form-stack">
          <label>Email<input required value={email} onChange={e => setEmail(e.target.value)} type="email" /></label>
          {message && <div className="error-box" style={{ background: "#dcfce7", color: "#166534", borderColor: "#bbf7d0" }}>{message}</div>}
          <button className="primary-action" disabled={loading} type="submit">{loading ? "Sending..." : "Send Reset Link"}</button>
        </form>
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button type="button" onClick={() => onNavigate("login")} style={{ background: "none", border: "none", color: "#3b82f6", fontWeight: "bold", cursor: "pointer", fontSize: "0.95rem" }}>Back to Login</button>
        </div>
      </section>
    </main>
  );
}

function ResetPassword({ token, email, onNavigate }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (password !== confirm) return setMessage("Passwords do not match.");
    setLoading(true);
    setMessage("");
    try {
      const { data } = await api.post("/auth/reset-password", { token, email, newPassword: password });
      setMessage(data.message);
      setSuccess(true);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-screen">
      <section className="login-panel">
        <div className="brand-mark"><ShieldCheck size={30} /></div>
        <h1>Create New Password</h1>
        <p className="muted">Set a new password for {email}</p>
        
        {success ? (
          <div style={{ textAlign: "center" }}>
            <div className="error-box" style={{ background: "#dcfce7", color: "#166534", borderColor: "#bbf7d0", padding: "15px", borderRadius: "8px" }}>{message}</div>
            <button className="primary-action" onClick={() => { window.location.href = "/"; }} style={{ marginTop: "20px" }}>Go to Login</button>
          </div>
        ) : (
          <form onSubmit={submit} className="form-stack">
            <label>New Password<input required value={password} onChange={e => setPassword(e.target.value)} type="password" /></label>
            <label>Confirm Password<input required value={confirm} onChange={e => setConfirm(e.target.value)} type="password" /></label>
            {message && <div className="error-box">{message}</div>}
            <button className="primary-action" disabled={loading} type="submit">{loading ? "Resetting..." : "Reset Password"}</button>
          </form>
        )}
      </section>
    </main>
  );
}

function Shell({ user, onLogout, children }) {
  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <ShieldCheck />
          <div>
            <strong>SportsAcademy-OS</strong>
            <span>{user.role} workspace</span>
          </div>
        </div>
        <nav>
          <button className="active" onClick={() => scrollToSection("dashboard-section")} type="button">
            <BarChart3 size={18} />
            Dashboard
          </button>
          <button onClick={() => scrollToSection("players-section")} type="button">
            <Users size={18} />
            Players
          </button>
          <button onClick={() => scrollToSection("vault-section")} type="button">
            <FileCheck2 size={18} />
            Vault
          </button>
          <button onClick={() => scrollToSection("skill-section")} type="button">
            <Activity size={18} />
            Skill-DNA
          </button>
        </nav>
        <button className="logout-button" onClick={onLogout} type="button">
          <LogOut size={18} />
          Logout
        </button>
      </aside>
      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">{user.academyName || "SportsAcademy-OS Workspace"}</p>
            <h2>{user.role} Dashboard</h2>
          </div>
          <div className="user-chip">
            <span>{user.name}</span>
            <StatusPill tone="success">JWT secured</StatusPill>
            <button className="topbar-icon-button" onClick={onLogout} title="Logout" type="button">
              <LogOut size={18} />
            </button>
          </div>
        </header>
        {children}
      </section>
    </div>
  );
}

function PlayerTable({ players, onSelect, selectedId, onPayFee, onUnpayFee }) {
  return (
    <section className="panel table-panel" id="players-section">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Roster Intelligence</p>
          <h3>Player Selection Pipeline</h3>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Player</th>
              <th>Age Group</th>
              <th>Fees</th>
              <th>Documents</th>
              <th>Eligibility</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => (
              <tr
                className={selectedId === player.id ? "selected-row" : ""}
                key={player.id}
                onClick={() => onSelect(player)}
              >
                <td>
                  <strong>{player.name}</strong>
                  <span>{player.location}</span>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "4px" }}>
                    Login: {player.email}<br/>
                    Default Pass: player123
                  </div>
                </td>
                <td>{player.ageGroup}</td>
                <td>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      {(!player.fees || player.fees.length === 0) ? (
                        <StatusPill tone="neutral">No Invoices</StatusPill>
                      ) : (
                        <StatusPill tone={(player.pendingFeesCount || 0) === 0 ? "success" : ((player.pendingFeesCount || 0) > 1 ? "danger" : "warning")}>
                          {(player.pendingFeesCount || 0) === 0 ? "Paid" : ((player.pendingFeesCount || 0) > 1 ? `Arrears (${player.pendingFeesCount} mos)` : "Pending")}
                        </StatusPill>
                      )}
                      {player.fees && player.fees.length > 0 && (player.pendingFeesCount || 0) > 0 && onPayFee ? (
                        <button
                          className="secondary-action"
                          style={{ padding: "2px 8px", fontSize: "0.7rem", minHeight: "24px" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            // Pay oldest pending fee first
                            const pendingFees = player.fees?.filter(f => f.status === "Pending").sort((a, b) => a.month.localeCompare(b.month));
                            if (pendingFees?.length) onPayFee(pendingFees[0].id);
                          }}
                        >
                          Mark Paid
                        </button>
                      ) : player.fees && player.fees.length > 0 && (player.pendingFeesCount || 0) === 0 && onUnpayFee ? (
                        <button
                          className="secondary-action"
                          style={{ padding: "2px 8px", fontSize: "0.7rem", minHeight: "24px", color: "#64748b" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            const paidFee = player.fees?.filter(f => f.status === "Paid").sort((a, b) => b.month.localeCompare(a.month))[0];
                            if (paidFee) onUnpayFee(paidFee.id);
                          }}
                        >
                          Undo
                        </button>
                      ) : null}
                    </div>
                    {(player.pendingFeesCount || 0) > 1 && (
                      <span style={{ fontSize: "0.75rem", color: "#ef4444", fontWeight: "600" }}>
                        Owes ₹{player.totalArrears}
                      </span>
                    )}
                  </div>
                </td>
                <td>
                  <StatusPill tone={player.documentSummary.complete ? "success" : "warning"}>
                    {player.documentSummary.complete ? "Complete" : `${player.documentSummary.missing.length} missing`}
                  </StatusPill>
                </td>
                <td>
                  <StatusPill tone={player.eligibility.eligible ? "success" : "danger"}>
                    {player.eligibility.eligible ? "Eligible" : "Blocked"}
                  </StatusPill>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function SkillRadar({ player, selectedMonth, onMonthChange, previewAssessment, customMetrics = defaultMetrics }) {
  const [localMonth, setLocalMonth] = useState(player?.skills?.at(-1)?.month || "");

  useEffect(() => {
    const nextMonth = player?.skills?.at(-1)?.month || "";
    setLocalMonth(nextMonth);
    if (!selectedMonth && onMonthChange) {
      onMonthChange(nextMonth);
    }
  }, [onMonthChange, player?.id, player?.skills?.length, selectedMonth]);

  const month = selectedMonth ?? localMonth;
  const baseAssessment = player?.skills?.find((item) => item.month === month) || player?.skills?.at(-1);
  const assessment = previewAssessment ? { ...baseAssessment, ...previewAssessment } : baseAssessment;
  const chartData = toRadarData(assessment, customMetrics);
  const changeMonth = (nextMonth) => {
    setLocalMonth(nextMonth);
    if (onMonthChange) {
      onMonthChange(nextMonth);
    }
  };

  return (
    <section className="panel radar-panel" id="skill-section">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Skill-DNA</p>
          <h3>{player?.name || "Select a player"}</h3>
        </div>
        <select value={month} onChange={(event) => changeMonth(event.target.value)}>
          {(player?.skills || []).map((skill) => (
            <option key={skill.month} value={skill.month}>
              {skill.month}
            </option>
          ))}
        </select>
      </div>

      <div className="radar-canvas">
        {chartData.length ? (
          <ResponsiveContainer width="100%" height={340}>
            <RadarChart data={chartData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" tick={{ fill: "#30382d", fontSize: 12 }} />
              <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fill: "#5b6656", fontSize: 11 }} />
              <Radar
                dataKey="value"
                fill="#b7ff2a"
                fillOpacity={0.38}
                stroke="#101510"
                strokeWidth={3}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        ) : (
          <div className="empty-state">No skill assessments yet.</div>
        )}
      </div>

      {assessment?.notes || assessment?.coachNotes ? <p className="coach-note">{assessment.notes || assessment.coachNotes}</p> : null}
    </section>
  );
}

function DocumentVault({ player, refresh, userRole }) {
  const [type, setType] = useState("Academic Mark Sheet");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [verifyingId, setVerifyingId] = useState(null);

  async function verifyDocument(docId) {
    setVerifyingId(docId);
    try {
      await api.patch(`/documents/${docId}/verify`);
      refresh();
    } catch (err) {
      setMessage("Failed to verify document.");
    } finally {
      setVerifyingId(null);
    }
  }

  async function uploadDocument() {
    setMessage("");
    setUploading(true);
    try {
      const payload = new FormData();
      payload.append("type", type);
      if (file) {
        payload.append("document", file);
      }

      await api.post(`/documents/${player.id}`, payload);
      setMessage(file ? `${file.name} sent to admin verification queue.` : "Mock document sent to admin verification queue.");
      setFile(null);
      refresh();
    } catch (err) {
      setMessage(err.response?.data?.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="panel" id="vault-section">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Verification Vault</p>
          <h3>Selection Credentials</h3>
        </div>
        <StatusPill tone={player.eligibility.eligible ? "success" : "danger"}>
          {player.eligibility.eligible ? `${player.ageGroup} Eligible` : `${player.ageGroup} Blocked`}
        </StatusPill>
      </div>

      <div className="document-list">
        {["Birth Certificate", "Aadhaar", "Academic Mark Sheet"].map((docType) => {
          const doc = player.documents?.find((item) => item.type === docType);
          return (
            <div className="document-row" key={docType}>
              <FileCheck2 size={18} />
              <span>{docType}</span>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <StatusPill tone={doc?.status === "Verified" ? "success" : doc ? "warning" : "neutral"}>
                  {doc?.status || "Missing"}
                </StatusPill>
                {doc?.fileUrl ? (
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="secondary-action"
                    style={{ minHeight: "28px", padding: "0 10px", fontSize: "0.75rem", textDecoration: "none", background: "#e7ebe1" }}
                  >
                    View File
                  </a>
                ) : null}
                {userRole === "Admin" && doc?.status === "Pending" ? (
                  <button
                    className="secondary-action"
                    style={{ minHeight: "28px", padding: "0 10px", fontSize: "0.75rem" }}
                    disabled={verifyingId === doc.id}
                    onClick={() => verifyDocument(doc.id)}
                    type="button"
                  >
                    {verifyingId === doc.id ? "..." : "Verify"}
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {userRole === "Player" ? (
        <div className="upload-strip">
          <select value={type} onChange={(event) => setType(event.target.value)}>
            <option>Birth Certificate</option>
            <option>Aadhaar</option>
            <option>Academic Mark Sheet</option>
          </select>
          <label className="file-picker">
            <UploadCloud size={17} />
            <span>{file ? file.name : "Choose file"}</span>
            <input
              accept=".pdf,.png,.jpg,.jpeg,.webp"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
              type="file"
            />
          </label>
          <button 
            className="secondary-action" 
            disabled={uploading || !player.eligibility.eligible} 
            onClick={uploadDocument} 
            type="button"
          >
            <UploadCloud size={17} />
            {uploading ? "Uploading..." : file ? "Upload" : "Mock upload"}
          </button>
        </div>
      ) : null}

      {userRole === "Player" && !player.eligibility.eligible ? (
        <p className="inline-message" style={{ background: "#f4dfdf", color: "#7e1f25", borderColor: "#e4a1a5" }}>
          Upload blocked: Mathematically ineligible for {player.ageGroup}.
        </p>
      ) : null}
      
      {message ? <p className="inline-message">{message}</p> : null}
    </section>
  );
}

function AddPlayerForm({ onSuccess, onCancel, coaches = [] }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    ageGroup: "Under-14",
    dateOfBirth: "",
    coachId: coaches.length > 0 ? coaches[0].id : ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/players", form);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add player");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel" style={{ marginBottom: "20px" }}>
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Roster Management</p>
          <h3>Register New Player</h3>
        </div>
      </div>
      <div className="panel-body">
        <form onSubmit={submit} className="form-stack">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
            <label>
              Full Name
              <input required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} type="text" />
            </label>
            <label>
              Email Address
              <input required value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} type="email" />
            </label>
            <label>
              Date of Birth
              <input required value={form.dateOfBirth} onChange={(e) => setForm({...form, dateOfBirth: e.target.value})} type="date" />
            </label>
            <label>
              Pipeline (Age Group)
              <select value={form.ageGroup} onChange={(e) => setForm({...form, ageGroup: e.target.value})}>
                <option>Under-14</option>
                <option>Under-16</option>
                <option>Under-19</option>
              </select>
            </label>
            <label>
              Assign to Coach
              <select value={form.coachId} onChange={(e) => setForm({...form, coachId: e.target.value})}>
                <option value="">No Coach Assigned</option>
                {coaches.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
          </div>
          {error ? <div className="error-box">{error}</div> : null}
          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <button className="primary-action" disabled={loading} type="submit">
              {loading ? "Registering..." : "Add Player"}
            </button>
            <button className="secondary-action" type="button" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

function EditPlayerForm({ player, onSuccess, onCancel }) {
  const [form, setForm] = useState({
    ageGroup: player.ageGroup,
    dateOfBirth: player.dateOfBirth
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.patch(`/players/${player.id}`, form);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update player");
    } finally {
      setLoading(false);
    }
  }

  async function removePlayer() {
    if (!window.confirm("Are you sure you want to permanently delete this player? All documents, skill logs, and fee records will be erased.")) return;
    setLoading(true);
    setError("");
    try {
      await api.delete(`/players/${player.id}`);
      onSuccess(); // Close form and refresh on dashboard
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete player");
      setLoading(false);
    }
  }

  return (
    <section className="panel" style={{ marginBottom: "20px" }}>
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Roster Management</p>
          <h3>Edit {player.name}'s Pipeline</h3>
        </div>
      </div>
      <div className="panel-body">
        <form onSubmit={submit} className="form-stack">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
            <label>
              Date of Birth
              <input required value={form.dateOfBirth} onChange={(e) => setForm({...form, dateOfBirth: e.target.value})} type="date" />
            </label>
            <label>
              Pipeline (Age Group)
              <select value={form.ageGroup} onChange={(e) => setForm({...form, ageGroup: e.target.value})}>
                <option>Under-14</option>
                <option>Under-16</option>
                <option>Under-19</option>
              </select>
            </label>
          </div>
          {error ? <div className="error-box">{error}</div> : null}
          <div style={{ display: "flex", gap: "10px", marginTop: "10px", alignItems: "center" }}>
            <button className="primary-action" disabled={loading} type="submit">
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button className="secondary-action" type="button" onClick={onCancel}>
              Cancel
            </button>
            <div style={{ flex: 1 }}></div>
            <button className="secondary-action" style={{ color: "#ef4444", borderColor: "#f87171", background: "#fef2f2" }} type="button" onClick={removePlayer} disabled={loading}>
              Remove Player
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

function EditCoachForm({ coach, onSuccess, onCancel }) {
  const [form, setForm] = useState({ name: coach.name, email: coach.email });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.put(`/users/coaches/${coach.id}`, form);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update coach");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel-body">
      <form onSubmit={submit} className="form-stack" style={{ padding: "15px", background: "rgba(0,0,0,0.02)", borderRadius: "8px", margin: "10px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <label>Name<input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} type="text" /></label>
          <label>Email<input required value={form.email} onChange={e => setForm({...form, email: e.target.value})} type="email" /></label>
        </div>
        {error && <div className="error-box">{error}</div>}
        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          <button className="primary-action" disabled={loading} type="submit">Save</button>
          <button className="secondary-action" type="button" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

function StaffSection({ coaches, onRefresh }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingCoachId, setEditingCoachId] = useState(null);
  const [form, setForm] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/users/coaches", form);
      setForm({ name: "", email: "" });
      setShowAdd(false);
      onRefresh();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add coach");
    } finally {
      setLoading(false);
    }
  }

  async function removeCoach(id) {
    if (!window.confirm("Are you sure you want to remove this coach? Any players assigned to them will be unassigned.")) return;
    try {
      await api.delete(`/users/coaches/${id}`);
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove coach");
    }
  }

  return (
    <section className="panel" style={{ marginBottom: "30px" }}>
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Staff Management</p>
          <h3>Academy Coaches</h3>
        </div>
        <button className="primary-action compact" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? "Close" : "+ Add Coach"}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={submit} className="form-stack" style={{ marginBottom: "20px", padding: "15px", background: "rgba(0,0,0,0.02)", borderRadius: "8px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
            <label>
              Coach Name
              <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} type="text" />
            </label>
            <label>
              Email Address (Login ID)
              <input required value={form.email} onChange={e => setForm({...form, email: e.target.value})} type="email" />
            </label>
          </div>
          <p className="muted" style={{ fontSize: "0.85rem", marginTop: "5px" }}>They will log in using password: <strong>coach123</strong></p>
          {error && <div className="error-box">{error}</div>}
          <div style={{ marginTop: "10px" }}>
            <button className="primary-action" disabled={loading} type="submit">
              {loading ? "Adding..." : "Invite Coach"}
            </button>
          </div>
        </form>
      )}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Coach Name</th>
              <th>Email</th>
              <th>Role</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {coaches.length === 0 ? (
              <tr><td colSpan="4" style={{ textAlign: "center", color: "#64748b" }}>No coaches added yet.</td></tr>
            ) : coaches.map(c => (
              <tr key={c.id}>
                <td>
                  <strong>{c.name}</strong>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "4px" }}>
                    Login: {c.email}<br/>
                    Default Pass: coach123
                  </div>
                </td>
                <td>{c.email}</td>
                <td><StatusPill tone="success">Coach</StatusPill></td>
                <td style={{ textAlign: "right" }}>
                  <button className="secondary-action compact" style={{ color: "#ef4444", borderColor: "#fca5a5" }} onClick={() => removeCoach(c.id)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function AcademySettings({ academy, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [monthlyFee, setMonthlyFee] = useState(academy?.monthlyFee || 2500);
  const [customMetrics, setCustomMetrics] = useState(academy?.customMetrics || defaultMetrics);
  const [loading, setLoading] = useState(false);

  // Sync state if academy changes
  useEffect(() => {
    if (academy?.monthlyFee) setMonthlyFee(academy.monthlyFee);
    if (academy?.customMetrics) {
      const mergedMetrics = { ...defaultMetrics, ...academy.customMetrics };
      setCustomMetrics(mergedMetrics);
    }
  }, [academy]);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put("/admin/academy", { monthlyFee, customMetrics });
      setShowForm(false);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel" style={{ marginBottom: "30px" }}>
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Financial Engine & Settings</p>
          <h3>Academy Settings</h3>
        </div>
        <button className="secondary-action compact" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Close" : "Edit Settings"}
        </button>
      </div>

      <div className="panel-body">
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <div style={{ background: "rgba(0,0,0,0.03)", padding: "10px 15px", borderRadius: "8px" }}>
            <p className="muted" style={{ margin: 0, fontSize: "0.85rem" }}>Base Monthly Fee</p>
            <strong style={{ fontSize: "1.2rem" }}>₹{academy?.monthlyFee || 2500}</strong>
          </div>
        </div>

        {showForm && (
          <form onSubmit={submit} className="form-stack" style={{ marginTop: "15px", padding: "15px", background: "rgba(0,0,0,0.02)", borderRadius: "8px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
              <label>
                Monthly Fee Amount (₹)
                <input required value={monthlyFee} onChange={e => setMonthlyFee(e.target.value)} type="number" />
              </label>
              <div style={{ gridColumn: "1 / -1", marginTop: "10px" }}>
                <p className="eyebrow" style={{ marginBottom: "10px", textTransform: "uppercase" }}>Custom Skill Metrics</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  {Object.keys(defaultMetrics).map(key => (
                    <input 
                      key={key}
                      required 
                      value={customMetrics[key] || defaultMetrics[key]} 
                      onChange={e => setCustomMetrics({...customMetrics, [key]: e.target.value})} 
                      type="text" 
                    />
                  ))}
                </div>
              </div>
            </div>
            <button className="primary-action" disabled={loading} type="submit" style={{ marginTop: "15px" }}>
              {loading ? "Saving..." : "Save Settings"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

function AdminDashboard({ user, onLogout }) {
  const [overview, setOverview] = useState(null);
  const [coaches, setCoaches] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [showEditPlayer, setShowEditPlayer] = useState(false);
  const [generatingFees, setGeneratingFees] = useState(false);

  async function loadOverview() {
    try {
      const { data } = await api.get("/admin/overview");
      setOverview(data);
      setSelectedPlayer((current) => current || data.players[0]);
      
      const coachRes = await api.get("/users/coaches");
      setCoaches(coachRes.data.coaches);
    } catch (err) {
      console.error("Failed to load admin overview:", err);
      alert("Error loading overview: " + (err.response?.data?.message || err.message));
    }
  }

  async function payFee(feeId) {
    try {
      await api.patch(`/fees/${feeId}/pay`);
      loadOverview();
    } catch (err) {
      console.error(err);
    }
  }

  async function unpayFee(feeId) {
    try {
      await api.patch(`/fees/${feeId}/unpay`);
      loadOverview();
    } catch (err) {
      console.error(err);
    }
  }

  async function generateFees() {
    setGeneratingFees(true);
    try {
      const res = await api.post("/fees/generate");
      alert(res.data.message);
      await loadOverview();
    } catch (err) {
      console.error(err);
      alert("Failed to generate invoices.");
    } finally {
      setGeneratingFees(false);
    }
  }

  useEffect(() => {
    loadOverview();
  }, []);

  if (!overview) return <div className="loading">Loading admin operations...</div>;

  return (
    <Shell user={user} onLogout={onLogout}>
      <div className="stats-grid" id="dashboard-section">
        <StatCard icon={Users} label="Active Players" value={overview.metrics.totalPlayers} hint="Across all batches" />
        <StatCard
          icon={CreditCard}
          label="Collected Revenue"
          value={formatCurrency(overview.metrics.monthlyRevenue)}
          hint="Current cycle"
        />
        <StatCard
          icon={BadgeCheck}
          label="Pending Revenue"
          value={formatCurrency(overview.metrics.pendingRevenue)}
          hint={`${overview.metrics.pendingFees} unpaid records`}
        />
        <StatCard
          icon={FileCheck2}
          label="Verified Docs"
          value={overview.metrics.verifiedDocuments}
          hint="Selection vault"
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <AcademySettings academy={overview.academy} onRefresh={loadOverview} />
        <StaffSection coaches={coaches} onRefresh={loadOverview} />
      </div>

      <div style={{ marginBottom: "15px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
        <button 
          className="secondary-action" 
          onClick={generateFees} 
          disabled={generatingFees}
          style={{ background: "#e2e8f0", color: "#0f172a" }}
        >
          {generatingFees ? "Generating..." : "Generate Monthly Invoices"}
        </button>
        <button className="primary-action" onClick={() => setShowAddPlayer(!showAddPlayer)}>
          {showAddPlayer ? "Close Form" : "+ Add New Player"}
        </button>
      </div>

      {showAddPlayer && (
        <AddPlayerForm 
          coaches={coaches}
          onSuccess={() => {
            setShowAddPlayer(false);
            loadOverview();
          }} 
          onCancel={() => setShowAddPlayer(false)} 
        />
      )}

      <div className="content-grid">
        <PlayerTable players={overview.players} onSelect={(p) => { setSelectedPlayer(p); setShowEditPlayer(false); }} selectedId={selectedPlayer?.id} onPayFee={payFee} onUnpayFee={unpayFee} />
        <div className="stacked-panels">
          {selectedPlayer && !showEditPlayer ? (
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
              <button className="secondary-action" onClick={() => setShowEditPlayer(true)}>
                Edit Player Pipeline
              </button>
            </div>
          ) : null}
          {showEditPlayer && selectedPlayer ? (
            <EditPlayerForm
              key={selectedPlayer.id}
              player={selectedPlayer}
              onSuccess={() => {
                setShowEditPlayer(false);
                loadOverview();
              }}
              onCancel={() => setShowEditPlayer(false)}
            />
          ) : null}
          {selectedPlayer ? <SkillRadar player={selectedPlayer} customMetrics={overview.academy?.customMetrics || user.customMetrics || defaultMetrics} /> : null}
          {selectedPlayer ? <DocumentVault player={selectedPlayer} refresh={loadOverview} userRole={user.role} /> : null}
        </div>
      </div>
    </Shell>
  );
}

function CoachDashboard({ user, onLogout }) {
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [assessmentMonth, setAssessmentMonth] = useState("2026-06");
  const [ratingValues, setRatingValues] = useState({});
  const [coachNotes, setCoachNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadPlayers() {
    const { data } = await api.get("/players");
    setPlayers(data.players);
    setSelectedPlayer((current) => {
      const next = current ? data.players.find((player) => player.id === current.id) : data.players[0];
      return next || data.players[0];
    });
  }

  useEffect(() => {
    loadPlayers();
  }, []);

  useEffect(() => {
    const latestMonth = selectedPlayer?.skills?.at(-1)?.month || "2026-06";
    setAssessmentMonth(latestMonth);
  }, [selectedPlayer?.id, selectedPlayer?.skills?.length]);

  const activeAssessment = useMemo(
    () => selectedPlayer?.skills?.find((skill) => skill.month === assessmentMonth),
    [assessmentMonth, selectedPlayer]
  );

  const customMetrics = user.customMetrics || defaultMetrics;

  useEffect(() => {
    const nextValues = {};
    Object.keys(customMetrics).forEach((key) => {
      nextValues[key] = activeAssessment?.ratings?.[key] ?? activeAssessment?.[key] ?? 7;
    });
    setRatingValues(nextValues);
    setCoachNotes(activeAssessment?.notes ?? activeAssessment?.coachNotes ?? "");
  }, [activeAssessment, assessmentMonth, selectedPlayer?.id, customMetrics]);

  async function saveAssessment(event) {
    event.preventDefault();
    setSaving(true);
    const payload = {
      month: assessmentMonth,
      coachNotes,
      ...ratingValues
    };
    await api.post(`/skills/${selectedPlayer.id}`, payload);
    await loadPlayers();
    setSaving(false);
  }

  return (
    <Shell user={user} onLogout={onLogout}>
      <div className="content-grid coach-grid" id="dashboard-section">
        <PlayerTable players={players} onSelect={setSelectedPlayer} selectedId={selectedPlayer?.id} />
        <div className="stacked-panels">
          {selectedPlayer ? (
            <SkillRadar 
              player={selectedPlayer} 
              selectedMonth={assessmentMonth} 
              onMonthChange={setAssessmentMonth} 
              previewAssessment={ratingValues} 
              customMetrics={customMetrics}
            />
          ) : null}
          {selectedPlayer ? (
            <section className="panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Coach Console</p>
                  <h3>Log Monthly Assessment</h3>
                </div>
                <CalendarCheck size={22} />
              </div>
              <form className="rating-form" onSubmit={saveAssessment}>
                <input
                  name="month"
                  onChange={(event) => setAssessmentMonth(event.target.value)}
                  type="month"
                  value={assessmentMonth}
                />
                {Object.entries(customMetrics).map(([key, label]) => (
                  <label key={key}>
                    <span className="range-label">
                      {label}
                      <strong>{ratingValues[key] || 7}/10</strong>
                    </span>
                    <input
                      max="10"
                      min="1"
                      name={key}
                      onChange={(event) =>
                        setRatingValues((current) => ({ ...current, [key]: Number(event.target.value) }))
                      }
                      type="range"
                      value={ratingValues[key] || 7}
                    />
                  </label>
                ))}
                <textarea
                  name="coachNotes"
                  onChange={(event) => setCoachNotes(event.target.value)}
                  placeholder="Coach notes"
                  rows="3"
                  value={coachNotes}
                />
                <button className="primary-action compact" type="submit">
                  {saving ? "Saving..." : "Save assessment"}
                </button>
              </form>
            </section>
          ) : null}
        </div>
      </div>
    </Shell>
  );
}

function PlayerDashboard({ user, onLogout }) {
  const [player, setPlayer] = useState(null);

  async function loadPlayer() {
    const { data } = await api.get("/players");
    setPlayer(data.players[0]);
  }

  useEffect(() => {
    loadPlayer();
  }, []);

  const pendingFee = useMemo(() => player?.fees?.find((fee) => fee.status === "Pending"), [player]);

  if (!player) return <div className="loading">Loading player passport...</div>;

  return (
    <Shell user={user} onLogout={onLogout}>
      <div className="stats-grid" id="dashboard-section">
        <StatCard icon={ShieldCheck} label="Age Group" value={player.ageGroup} hint={player.eligibility.reason} />
        <StatCard
          icon={CreditCard}
          label="Fee Status"
          value={pendingFee ? "Pending" : (player.fees?.length ? "Paid" : "Unbilled")}
          hint={pendingFee ? formatCurrency(pendingFee.amount) : "No unpaid dues"}
        />
        <StatCard
          icon={FileCheck2}
          label="Document Vault"
          value={player.documentSummary.complete ? "Complete" : "Incomplete"}
          hint={`${player.documentSummary.verifiedCount} verified documents`}
        />
      </div>
      <div className="content-grid player-grid">
        <SkillRadar player={player} customMetrics={user.customMetrics || defaultMetrics} />
        <DocumentVault player={player} refresh={loadPlayer} userRole={user.role} />
      </div>
    </Shell>
  );
}

function ForcePasswordChange({ onSuccess, onLogout }) {
  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      return setError("Passwords do not match.");
    }
    if (form.newPassword.length < 6) {
      return setError("Password must be at least 6 characters.");
    }
    setLoading(true);
    setError("");
    try {
      const { data } = await api.put("/auth/update-password", { newPassword: form.newPassword });
      setAuthToken(data.token);
      onSuccess(data.user);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-screen">
      <section className="login-panel">
        <div className="brand-mark"><ShieldCheck size={30} /></div>
        <h1>Security Update</h1>
        <p className="muted">Please change your default password to continue.</p>

        <form onSubmit={submit} className="form-stack">
          <label>
            New Password
            <input required value={form.newPassword} onChange={e => setForm({...form, newPassword: e.target.value})} type="password" />
          </label>
          <label>
            Confirm Password
            <input required value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword: e.target.value})} type="password" />
          </label>
          
          {error && <div className="error-box">{error}</div>}

          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <button className="primary-action" disabled={loading} type="submit" style={{ flex: 1 }}>
              {loading ? "Updating..." : "Update Password"}
            </button>
            <button className="secondary-action" type="button" onClick={onLogout} disabled={loading}>
              Logout
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState(() => {
    if (window.location.pathname === "/reset-password") return "reset-password";
    return "landing";
  });
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    api
      .get("/auth/me")
      .then(({ data }) => setUser(data.user))
      .catch(() => setAuthToken(null))
      .finally(() => setBooting(false));
  }, []);

  function logout() {
    setAuthToken(null);
    setUser(null);
    setView("landing");
  }

  if (booting) return <div className="loading">Starting SportsAcademy-OS...</div>;
  if (!user) {
    if (view === "reset-password") {
      const searchParams = new URLSearchParams(window.location.search);
      return <ResetPassword token={searchParams.get("token")} email={searchParams.get("email")} onNavigate={setView} />;
    }
    if (view === "forgot-password") return <ForgotPassword onNavigate={setView} />;
    if (view === "landing") return <LandingPage onNavigate={setView} />;
    if (view === "register") return <RegisterAcademy onRegister={setUser} onNavigate={setView} />;
    return <Login onLogin={setUser} onNavigate={setView} />;
  }

  if (user.forcePasswordChange) {
    return <ForcePasswordChange onSuccess={setUser} onLogout={logout} />;
  }
  
  if (user.role === "Admin") return <AdminDashboard user={user} onLogout={logout} />;
  if (user.role === "Coach") return <CoachDashboard user={user} onLogout={logout} />;
  return <PlayerDashboard user={user} onLogout={logout} />;
}

export default App;
