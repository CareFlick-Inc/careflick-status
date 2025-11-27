import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { ServiceName, ServiceStatus, HealthCheckResult } from "@/lib/types";

async function checkService(
  serviceName: ServiceName,
  endpoint: string
): Promise<ServiceStatus> {
  try {
    const response = await fetch(endpoint, {
      cache: "no-store",
      next: { revalidate: 0 },
    });

    const data: HealthCheckResult = await response.json();

    const status: ServiceStatus = {
      name: serviceName,
      status: data.status,
      latency: data.latency,
      lastChecked: new Date(),
      message: data.message,
    };

    // Update storage
    storage.updateServiceStatus(serviceName, status);

    return status;
  } catch (error) {
    const status: ServiceStatus = {
      name: serviceName,
      status: "down",
      latency: null,
      lastChecked: new Date(),
      message: error instanceof Error ? error.message : "Service check failed",
    };

    storage.updateServiceStatus(serviceName, status);
    return status;
  }
}

async function checkLLMServices(
  endpoint: string
): Promise<ServiceStatus> {
  try {
    const response = await fetch(endpoint, {
      cache: "no-store",
      next: { revalidate: 0 },
    });

    const data = await response.json();

    const llmStatus: ServiceStatus = {
      name: "llm",
      status: data.status,
      latency: data.latency,
      lastChecked: new Date(),
      message: data.message,
    };

    storage.updateServiceStatus("llm", llmStatus);

    return llmStatus;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "LLM check failed";

    const llmStatus: ServiceStatus = {
      name: "llm",
      status: "down",
      latency: null,
      lastChecked: new Date(),
      message: errorMessage,
    };

    storage.updateServiceStatus("llm", llmStatus);

    return llmStatus;
  }
}

export async function GET() {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    // Check all services in parallel
    const [
      mongodb,
      orchestration,
      services,
      crons,
      frontend,
      redis,
      llm,
    ] = await Promise.all([
      checkService("mongodb", `${baseUrl}/api/health/mongodb`),
      checkService("orchestration", `${baseUrl}/api/health/orchestration`),
      checkService("services", `${baseUrl}/api/health/services`),
      checkService("crons", `${baseUrl}/api/health/crons`),
      checkService("frontend", `${baseUrl}/api/health/frontend`),
      checkService("redis", `${baseUrl}/api/health/redis`),
      checkLLMServices(`${baseUrl}/api/health/llm`),
    ]);

    const allServices = {
      mongodb,
      orchestration,
      services,
      crons,
      frontend,
      redis,
      llm,
    };

    // Calculate overall status
    const serviceArray = Object.values(allServices);
    const allHealthy = serviceArray.every((s) => s.status === "healthy");
    const anyDown = serviceArray.some((s) => s.status === "down");

    const overallStatus = allHealthy
      ? "healthy"
      : anyDown
        ? "down"
        : "degraded";

    return NextResponse.json({
      services: allServices,
      lastUpdate: new Date(),
      overallStatus,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Health check failed",
      },
      { status: 500 }
    );
  }
}
