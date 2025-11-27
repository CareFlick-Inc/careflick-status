import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { HistoricalDataPoint } from "@/lib/types";

interface LatencyChartProps {
  data: Record<string, HistoricalDataPoint[]>;
  selectedServices: string[];
}

const LatencyChart: React.FC<LatencyChartProps> = ({ data, selectedServices }) => {
  // Transform data for Recharts
  const chartData: any[] = [];
  const timeMap = new Map<number, any>();

  // Collect all timestamps
  selectedServices.forEach((serviceName) => {
    const serviceData = data[serviceName] || [];
    serviceData.forEach((point) => {
      const timestamp = new Date(point.timestamp).getTime();
      if (!timeMap.has(timestamp)) {
        timeMap.set(timestamp, { time: timestamp });
      }
      if (point.latency !== null) {
        timeMap.get(timestamp)![serviceName] = point.latency;
      }
    });
  });

  // Convert to array and sort by time
  timeMap.forEach((value) => chartData.push(value));
  chartData.sort((a, b) => a.time - b.time);

  const colors = [
    "#6366f1",
    "#ec4899",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#14b8a6",
    "#f97316",
    "#3b82f6",
  ];

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="glass fade-in" style={{ borderRadius: "12px", padding: "24px" }}>
      <div style={{ marginBottom: "16px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "4px" }}>
          Latency Trends
        </h2>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
          Response time in milliseconds over the last 24 hours
        </p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
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
            label={{ value: "Latency (ms)", angle: -90, position: "insideLeft", fill: "#94a3b8" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "8px",
              color: "#f1f5f9",
            }}
            labelFormatter={(value) => new Date(value).toLocaleString()}
          />
          <Legend wrapperStyle={{ color: "#f1f5f9" }} />
          {selectedServices.map((service, index) => (
            <Line
              key={service}
              type="monotone"
              dataKey={service}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              dot={false}
              name={service}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LatencyChart;
