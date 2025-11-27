import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { ServiceName } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const serviceName = searchParams.get("service") as ServiceName | null;
    const hoursParam = searchParams.get("hours");
    const hours = hoursParam ? parseInt(hoursParam, 10) : 24;

    if (serviceName) {
      // Get history for a specific service
      const history = storage.getHistoricalData(serviceName, hours);
      const uptime = storage.calculateUptime(serviceName, hours);
      const avgLatency = storage.getAverageLatency(serviceName, hours);

      return NextResponse.json({
        serviceName,
        history,
        uptime,
        averageLatency: avgLatency,
      });
    } else {
      // Get history for all services
      const allHistory = storage.getAllHistoricalData();
      const historyObject: Record<string, any> = {};

      allHistory.forEach((history, service) => {
        const filteredHistory = storage.getHistoricalData(service, hours);
        historyObject[service] = {
          history: filteredHistory,
          uptime: storage.calculateUptime(service, hours),
          averageLatency: storage.getAverageLatency(service, hours),
        };
      });

      return NextResponse.json(historyObject);
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch history",
      },
      { status: 500 }
    );
  }
}
