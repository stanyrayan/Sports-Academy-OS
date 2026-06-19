import React from "react";

export default function LandingPage({ onNavigate }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
      color: "white",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      padding: "20px",
      fontFamily: "system-ui, sans-serif"
    }}>
      <div style={{
        maxWidth: "800px",
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "24px",
        padding: "60px 40px",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
      }}>
        <h1 style={{
          fontSize: "4rem",
          fontWeight: "800",
          margin: "0 0 20px 0",
          background: "linear-gradient(to right, #a3e635, #22c55e)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}>
          SportsAcademy OS
        </h1>
        <p style={{
          fontSize: "1.5rem",
          color: "#cbd5e1",
          lineHeight: "1.6",
          marginBottom: "40px"
        }}>
          The ultimate open-source operating system for sports academies.
          <br/>Manage rosters, track skills, verify documents, and collect fees—<strong style={{ color: "white" }}>completely free forever.</strong>
        </p>
        
        <div style={{ display: "flex", gap: "20px", justifyContent: "center" }}>
          <button 
            onClick={() => onNavigate("register")}
            style={{
              padding: "16px 32px",
              fontSize: "1.25rem",
              fontWeight: "bold",
              color: "#0f172a",
              background: "#a3e635",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              transition: "transform 0.2s, background 0.2s",
              boxShadow: "0 10px 15px -3px rgba(163, 230, 53, 0.3)"
            }}
            onMouseOver={e => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseOut={e => e.currentTarget.style.transform = "translateY(0)"}
          >
            Register Your Academy
          </button>
          
          <button 
            onClick={() => onNavigate("login")}
            style={{
              padding: "16px 32px",
              fontSize: "1.25rem",
              fontWeight: "bold",
              color: "white",
              background: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "12px",
              cursor: "pointer",
              transition: "background 0.2s"
            }}
            onMouseOver={e => e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)"}
            onMouseOut={e => e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"}
          >
            Sign In
          </button>
        </div>
      </div>
      
      <div style={{ marginTop: "60px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "30px", maxWidth: "1000px", width: "100%" }}>
        {[
          { title: "Roster Intelligence", desc: "Mathematical age fraud detection and automated eligibility pipelines." },
          { title: "Skill Tracking", desc: "Log monthly metrics for your players and visualize progress over time." },
          { title: "Document Vault", desc: "Securely collect and verify Aadhaar and Birth Certificates online." },
          { title: "Financial Engine", desc: "Automate monthly fee generation, track revenue, and instantly identify pending dues." },
          { title: "Role-Based Access", desc: "Dedicated, secure dashboards for Admins, Coaches, and Players with restricted visibility." },
          { title: "Custom Metrics", desc: "Fully isolated workspaces allowing each academy to define their own evaluation parameters." }
        ].map((feature, i) => (
          <div key={i} style={{ padding: "20px", background: "rgba(255,255,255,0.03)", borderRadius: "16px" }}>
            <h3 style={{ color: "#a3e635", marginBottom: "10px" }}>{feature.title}</h3>
            <p style={{ color: "#94a3b8", fontSize: "0.95rem", lineHeight: "1.5" }}>{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
