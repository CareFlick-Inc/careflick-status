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

    storage.updateServiceStatus(serviceName, status);

    return status;
  } catch (error) {
    console.error(`[HealthCheck] ${serviceName} error:`, error);
    const status: ServiceStatus = {
      name: serviceName,
      status: "down",
      latency: null,
      lastChecked: new Date(),
      message: "Service check failed. Please contact support.",
    };

    storage.updateServiceStatus(serviceName, status);
    return status;
  }
}

async function checkLLMServices(endpoint: string): Promise<ServiceStatus> {
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
    console.error("[HealthCheck] LLM error:", error);
    const llmStatus: ServiceStatus = {
      name: "llm",
      status: "down",
      latency: null,
      lastChecked: new Date(),
      message: "LLM check failed. Please contact support.",
    };

    storage.updateServiceStatus("llm", llmStatus);
    return llmStatus;
  }
}

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const [
      mongodb,
      orchestration,
      services,
      crons,
      careflick,
      hub,
      redis,
      llm,
    ] = await Promise.all([
      checkService("mongodb", `${baseUrl}/api/health/mongodb`),
      checkService("orchestration", `${baseUrl}/api/health/orchestration`),
      checkService("services", `${baseUrl}/api/health/services`),
      checkService("crons", `${baseUrl}/api/health/crons`),
      checkService("careflick", `${baseUrl}/api/health/frontend/careflick`),
      checkService("hub", `${baseUrl}/api/health/frontend/hub`),
      checkService("redis", `${baseUrl}/api/health/redis`),
      checkLLMServices(`${baseUrl}/api/health/llm`),
    ]);

    const allServices = [
      mongodb,
      orchestration,
      services,
      crons,
      careflick,
      hub,
      redis,
      llm,
    ];

    return NextResponse.json({
      services: {
        mongodb,
        orchestration,
        services,
        crons,
        careflick,
        hub,
        redis,
        llm,
      },
      lastUpdate: new Date(),
      overallStatus: allServices.every((s) => s.status === "healthy")
        ? "healthy"
        : allServices.some((s) => s.status === "down")
        ? "down"
        : "degraded",
    });
  } catch (error) {
    console.error("[HealthCheck] GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch health status. Please contact support." },
      { status: 500 }
    );
  }
}

