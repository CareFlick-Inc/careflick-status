import { ServiceStatus, HistoricalDataPoint, ServiceName } from "./types";

// In-memory storage for service statuses and historical data
class DataStorage {
  private serviceStatuses: Map<ServiceName, ServiceStatus> = new Map();
  private historicalData: Map<ServiceName, HistoricalDataPoint[]> = new Map();
  private readonly MAX_HISTORY_HOURS = 24;
  private readonly MAX_DATA_POINTS = 288; // 24 hours * 12 (5-min intervals)

  // Initialize with all services
  constructor() {
    const services: ServiceName[] = [
      "mongodb",
      "orchestration",
      "services",
      "crons",
      "frontend",
      "redis",
      "gemini",
      "openai",
      "azure-openai",
    ];

    services.forEach((service) => {
      this.serviceStatuses.set(service, {
        name: service,
        status: "down",
        latency: null,
        lastChecked: new Date(),
        message: "Not yet checked",
      });
      this.historicalData.set(service, []);
    });
  }

  // Update service status and add to history
  updateServiceStatus(serviceName: ServiceName, status: ServiceStatus): void {
    this.serviceStatuses.set(serviceName, status);

    // Add to historical data
    const history = this.historicalData.get(serviceName) || [];
    history.push({
      timestamp: status.lastChecked,
      status: status.status,
      latency: status.latency,
    });

    // Keep only last 24 hours of data
    this.cleanOldData(history);
    this.historicalData.set(serviceName, history);
  }

  // Get current status for a service
  getServiceStatus(serviceName: ServiceName): ServiceStatus | undefined {
    return this.serviceStatuses.get(serviceName);
  }

  // Get all service statuses
  getAllStatuses(): Map<ServiceName, ServiceStatus> {
    return this.serviceStatuses;
  }

  // Get historical data for a service
  getHistoricalData(
    serviceName: ServiceName,
    hours: number = 24
  ): HistoricalDataPoint[] {
    const history = this.historicalData.get(serviceName) || [];
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);

    return history.filter((point) => point.timestamp >= cutoffTime);
  }

  // Get all historical data
  getAllHistoricalData(): Map<ServiceName, HistoricalDataPoint[]> {
    return this.historicalData;
  }

  // Clean data older than MAX_HISTORY_HOURS
  private cleanOldData(history: HistoricalDataPoint[]): void {
    const cutoffTime = new Date(
      Date.now() - this.MAX_HISTORY_HOURS * 60 * 60 * 1000
    );

    // Remove old data points
    while (history.length > 0 && history[0].timestamp < cutoffTime) {
      history.shift();
    }

    // Also limit by max data points
    while (history.length > this.MAX_DATA_POINTS) {
      history.shift();
    }
  }

  // Calculate uptime percentage for last N hours
  calculateUptime(serviceName: ServiceName, hours: number = 24): number {
    const history = this.getHistoricalData(serviceName, hours);

    if (history.length === 0) return 0;

    const healthyPoints = history.filter(
      (point) => point.status === "healthy"
    ).length;
    return (healthyPoints / history.length) * 100;
  }

  // Get average latency for last N hours
  getAverageLatency(serviceName: ServiceName, hours: number = 24): number | null {
    const history = this.getHistoricalData(serviceName, hours);

    const latencies = history
      .filter((point) => point.latency !== null)
      .map((point) => point.latency!);

    if (latencies.length === 0) return null;

    return latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length;
  }
}

// Export singleton instance
export const storage = new DataStorage();
