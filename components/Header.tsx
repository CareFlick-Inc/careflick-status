import React from "react";

interface HeaderProps {
  lastUpdate: Date | null;
  overallStatus: "healthy" | "degraded" | "down";
}

const Header: React.FC<HeaderProps> = ({ lastUpdate, overallStatus }) => {
  const getStatusColor = () => {
    switch (overallStatus) {
      case "healthy":
        return "var(--status-healthy)";
      case "degraded":
        return "var(--status-degraded)";
      case "down":
        return "var(--status-down)";
      default:
        return "var(--text-secondary)";
    }
  };

  const getStatusText = () => {
    switch (overallStatus) {
      case "healthy":
        return "All Systems Operational";
      case "degraded":
        return "Some Systems Degraded";
      case "down":
        return "System Issues Detected";
      default:
        return "Checking...";
    }
  };

  return (
    <header className="glass" style={{ borderRadius: "16px", padding: "24px", marginBottom: "32px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: "32px", fontWeight: "700", marginBottom: "8px" }}>
            Careflick Status Monitor
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span
              className="material-icons"
              style={{
                fontSize: "20px",
                color: getStatusColor(),
              }}
            >
              {overallStatus === "healthy" ? "check_circle" : overallStatus === "degraded" ? "warning" : "error"}
            </span>
            <span style={{ fontSize: "18px", fontWeight: "500", color: getStatusColor() }}>
              {getStatusText()}
            </span>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-secondary)" }}>
            <span className="material-icons pulse-glow" style={{ fontSize: "16px" }}>
              fiber_manual_record
            </span>
            <span style={{ fontSize: "14px" }}>Live Monitoring</span>
          </div>
          {lastUpdate && (
            <div style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
              Last updated: {new Date(lastUpdate).toLocaleTimeString()} {Intl.DateTimeFormat().resolvedOptions().timeZone}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
