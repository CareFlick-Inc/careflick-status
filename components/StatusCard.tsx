import React from "react";
import { ServiceStatus } from "@/lib/types";

interface StatusCardProps {
  service: ServiceStatus;
}

const StatusCard: React.FC<StatusCardProps> = ({ service }) => {
  const getStatusColor = () => {
    switch (service.status) {
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

  const getStatusIcon = () => {
    switch (service.status) {
      case "healthy":
        return "check_circle";
      case "degraded":
        return "warning";
      case "down":
        return "cancel";
      default:
        return "help";
    }
  };

  const getServiceIcon = (name: string) => {
    const iconMap: Record<string, string> = {
      mongodb: "storage",
      redis: "dns",
      orchestration: "hub",
      services: "cloud",
      crons: "schedule",
      frontend: "web",
      gemini: "psychology",
      openai: "smart_toy",
      "azure-openai": "cloud_circle",
    };
    return iconMap[name] || "settings";
  };

  const formatServiceName = (name: string) => {
    const nameMap: Record<string, string> = {
      mongodb: "MongoDB",
      redis: "Redis",
      orchestration: "Orchestration",
      services: "Services",
      crons: "Cron Jobs",
      frontend: "Frontend",
      gemini: "Gemini AI",
      openai: "OpenAI",
      "azure-openai": "Azure OpenAI",
    };
    return nameMap[name] || name;
  };

  return (
    <div
      className="glass status-card fade-in"
      style={{
        borderRadius: "12px",
        padding: "20px",
        paddingLeft: "16px",
        borderLeft: `4px solid ${getStatusColor()}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: `linear-gradient(135deg, ${getStatusColor()}22, ${getStatusColor()}44)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span className="material-icons" style={{ fontSize: "24px", color: getStatusColor() }}>
              {getServiceIcon(service.name)}
            </span>
          </div>
          <h3 style={{ fontSize: "18px", fontWeight: "600", margin: 0 }}>
            {formatServiceName(service.name)}
          </h3>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span
            className="material-icons"
            style={{
              fontSize: "16px",
              color: getStatusColor(),
            }}
          >
            {getStatusIcon()}
          </span>
          <span style={{ fontSize: "14px", color: getStatusColor(), textTransform: "capitalize" }}>
            {service.status}
          </span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px", paddingLeft: "4px" }}>
        {service.latency !== null && (
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
            <span style={{ color: "var(--text-secondary)" }}>Latency:</span>
            <span style={{ color: "var(--text-primary)", fontWeight: "500" }}>
              {service.latency}ms
            </span>
          </div>
        )}
        {service.message && (
          <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            {service.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusCard;
