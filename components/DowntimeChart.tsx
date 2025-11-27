import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { HistoricalDataPoint } from "@/lib/types";

interface DowntimeChartProps {
  data: HistoricalDataPoint[];
  serviceName: string;
}

const DowntimeChart: React.FC<DowntimeChartProps> = ({ data, serviceName }) => {
  // Transform data for area chart - convert status to uptime percentage
  const chartData = data.map((point) => ({
    time: new Date(point.timestamp).getTime(),
    uptime: point.status === "healthy" ? 100 : point.status === "degraded" ? 50 : 0,
    status: point.status,
  }));

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: "#1e293b",
            border: "1px solid #334155",
            borderRadius: "8px",
            padding: "12px",
            color: "#f1f5f9",
          }}
        >
          <p style={{ marginBottom: "4px", fontSize: "13px" }}>
            {new Date(label).toLocaleString()}
          </p>
          <p
            style={{
              fontWeight: "600",
              color:
                payload[0].payload.status === "healthy"
                  ? "#10b981"
                  : payload[0].payload.status === "degraded"
                    ? "#f59e0b"
                    : "#ef4444",
            }}
          >
            Status: {payload[0].payload.status}
          </p>
        </div>
      );
    }
    return null;
  };

  // Calculate uptime percentage
  const totalPoints = chartData.length;
  const healthyPoints = chartData.filter((point) => point.status === "healthy").length;
  const uptimePercentage = totalPoints > 0 ? ((healthyPoints / totalPoints) * 100).toFixed(2) : "0.00";

  return (
    <div className="glass fade-in" style={{ borderRadius: "12px", padding: "24px" }}>
      <div style={{ marginBottom: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "600" }}>
            Uptime - {serviceName}
          </h2>
          <div
            style={{
              padding: "6px 12px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #10b98122, #10b98144)",
              color: "#10b981",
              fontWeight: "600",
              fontSize: "14px",
            }}
          >
            {uptimePercentage}% Uptime
          </div>
        </div>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
          Service availability over the last 24 hours
        </p>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorUptime" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="time"
            tickFormatter={formatTime}
            stroke="#94a3b8"
            style={{ fontSize: "12px" }}
          />
          <YAxis
            stroke="#94a3b8"
            style={{ fontSize: "12px" }}
            domain={[0, 100]}
            ticks={[0, 50, 100]}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="stepAfter"
            dataKey="uptime"
            stroke="#10b981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorUptime)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DowntimeChart;
