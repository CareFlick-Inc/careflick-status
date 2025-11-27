export interface ServiceStatus {
  name: string;
  status: "healthy" | "degraded" | "down";
  latency: number | null;
  lastChecked: Date;
  message?: string;
}

export interface HistoricalDataPoint {
  timestamp: Date;
  status: "healthy" | "degraded" | "down";
  latency: number | null;
}

export interface ServiceHistory {
  serviceName: string;
  data: HistoricalDataPoint[];
}

export interface HealthCheckResult {
  status: "healthy" | "degraded" | "down";
  latency: number | null;
  message?: string;
}

export type ServiceName =
  | "mongodb"
  | "orchestration"
  | "services"
  | "crons"
  | "frontend"
  | "careflick"
  | "hub"
  | "redis"
  | "gemini"
  | "openai"
  | "azure-openai"
  | "llm";

export interface AllServicesStatus {
  services: Record<ServiceName, ServiceStatus>;
  lastUpdate: Date;
  overallStatus: "healthy" | "degraded" | "down";
}
