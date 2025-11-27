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
): Promise<{
  gemini: ServiceStatus;
  openai: ServiceStatus;
  azureOpenai: ServiceStatus;
}> {
  try {
    const response = await fetch(endpoint, {
      cache: "no-store",
      next: { revalidate: 0 },
    });

    const data = await response.json();

    const geminiStatus: ServiceStatus = {
      name: "gemini",
      status: data.gemini.status,
      latency: data.gemini.latency,
      lastChecked: new Date(),
      message: data.gemini.message,
    };

    const openaiStatus: ServiceStatus = {
      name: "openai",
      status: data.openai.status,
      latency: data.openai.latency,
      lastChecked: new Date(),
      message: data.openai.message,
    };

    const azureOpenaiStatus: ServiceStatus = {
      name: "azure-openai",
      status: data.azureOpenai.status,
      latency: data.azureOpenai.latency,
      lastChecked: new Date(),
      message: data.azureOpenai.message,
    };

    storage.updateServiceStatus("gemini", geminiStatus);
    storage.updateServiceStatus("openai", openaiStatus);
    storage.updateServiceStatus("azure-openai", azureOpenaiStatus);

    return {
      gemini: geminiStatus,
      openai: openaiStatus,
      azureOpenai: azureOpenaiStatus,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "LLM check failed";

    const defaultStatus = (name: ServiceName): ServiceStatus => ({
      name,
      status: "down",
      latency: null,
      lastChecked: new Date(),
      message: errorMessage,
    });

    const gemini = defaultStatus("gemini");
    const openai = defaultStatus("openai");
    const azureOpenai = defaultStatus("azure-openai");

    storage.updateServiceStatus("gemini", gemini);
    storage.updateServiceStatus("openai", openai);
    storage.updateServiceStatus("azure-openai", azureOpenai);

    return { gemini, openai, azureOpenai: azureOpenai };
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
      llmServices,
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
      gemini: llmServices.gemini,
      openai: llmServices.openai,
      "azure-openai": llmServices.azureOpenai,
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
