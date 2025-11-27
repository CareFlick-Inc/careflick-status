"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import StatusCard from "@/components/StatusCard";
import LatencyChart from "@/components/LatencyChart";
import DowntimeChart from "@/components/DowntimeChart";
import { ServiceStatus, ServiceName, HistoricalDataPoint } from "@/lib/types";

const POLL_INTERVAL = 5 * 60 * 1000; // 5 minutes

export default function Home() {
  const [services, setServices] = useState<Record<ServiceName, ServiceStatus> | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [overallStatus, setOverallStatus] = useState<"healthy" | "degraded" | "down">("down");
  const [loading, setLoading] = useState(true);
  const [historicalData, setHistoricalData] = useState<Record<string, HistoricalDataPoint[]>>({});
  const [selectedService, setSelectedService] = useState<ServiceName>("orchestration");

  // Fetch current status
  const fetchStatus = async () => {
    try {
      const response = await fetch("/api/health", { cache: "no-store" });
      const data = await response.json();

      setServices(data.services);
      setLastUpdate(new Date(data.lastUpdate));
      setOverallStatus(data.overallStatus);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch status:", error);
      setLoading(false);
    }
  };

  // Fetch historical data
  const fetchHistory = async () => {
    try {
      const response = await fetch("/api/history", { cache: "no-store" });
      const data = await response.json();

      const historyMap: Record<string, HistoricalDataPoint[]> = {};
      Object.keys(data).forEach((service) => {
        historyMap[service] = data[service].history;
      });

      setHistoricalData(historyMap);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchStatus();
    fetchHistory();

    // Set up polling
    const statusInterval = setInterval(fetchStatus, POLL_INTERVAL);
    const historyInterval = setInterval(fetchHistory, POLL_INTERVAL);

    return () => {
      clearInterval(statusInterval);
      clearInterval(historyInterval);
    };
  }, []);

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", padding: "32px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "80vh",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div
            className="spinner"
            style={{
              width: "48px",
              height: "48px",
              border: "4px solid var(--surface-light)",
              borderTop: "4px solid var(--primary)",
              borderRadius: "50%",
            }}
          />
          <p style={{ color: "var(--text-secondary)", fontSize: "16px" }}>
            Loading status...
          </p>
        </div>
      </main>
    );
  }

  const serviceArray = services ? Object.values(services) : [];

  // Group services by category
  const infrastructure = serviceArray.filter((s) =>
    ["mongodb", "redis"].includes(s.name)
  );
  const backend = serviceArray.filter((s) =>
    ["orchestration", "services", "crons"].includes(s.name)
  );
  const frontend = serviceArray.filter((s) => s.name === "frontend");
  const llmService = serviceArray.find((s) => s.name === "llm");

  return (
    <main style={{ minHeight: "100vh", padding: "32px" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <Header lastUpdate={lastUpdate} overallStatus={overallStatus} />

        {/* Services Grid */}
        <section style={{ marginBottom: "48px" }}>
          {/* Infrastructure */}
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "600",
              marginBottom: "16px",
              color: "var(--text-primary)",
            }}
          >
            <span className="material-icons" style={{ verticalAlign: "middle", marginRight: "8px" }}>
              dns
            </span>
            Infrastructure
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "20px",
              marginBottom: "32px",
            }}
          >
            {infrastructure.map((service) => (
              <StatusCard key={service.name} service={service} />
            ))}
          </div>

          {/* Backend Services */}
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "600",
              marginBottom: "16px",
              color: "var(--text-primary)",
            }}
          >
            <span className="material-icons" style={{ verticalAlign: "middle", marginRight: "8px" }}>
              cloud
            </span>
            Backend Services
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "20px",
              marginBottom: "32px",
            }}
          >
            {backend.map((service) => (
              <StatusCard key={service.name} service={service} />
            ))}
          </div>

          {/* Frontend */}
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "600",
              marginBottom: "16px",
              color: "var(--text-primary)",
            }}
          >
            <span className="material-icons" style={{ verticalAlign: "middle", marginRight: "8px" }}>
              web
            </span>
            Frontend
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "20px",
              marginBottom: "32px",
            }}
          >
            {frontend.map((service) => (
              <StatusCard key={service.name} service={service} />
            ))}
          </div>

          {/* LLM Services */}
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "600",
              marginBottom: "16px",
              color: "var(--text-primary)",
            }}
          >
            <span className="material-icons" style={{ verticalAlign: "middle", marginRight: "8px" }}>
              psychology
            </span>
            LLM Services
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "20px",
              marginBottom: "32px",
            }}
          >
            {llmService && <StatusCard key="llm" service={llmService} />}
          </div>
        </section>
      </div>
    </main>
  );
}
