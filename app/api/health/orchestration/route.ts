import { NextResponse } from "next/server";

export async function GET() {
  const startTime = Date.now();
  const url = "https://backend.careflick.ai/health";

  try {
    const response = await fetch(url, {
      method: "GET",
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    const latency = Date.now() - startTime;

    if (response.ok) {
      return NextResponse.json({
        status: "healthy",
        latency,
        message: "Orchestration service is healthy",
      });
    } else {
      return NextResponse.json(
        {
          status: "degraded",
          latency,
          message: `Orchestration service returned status ${response.status}`,
        },
        { status: 503 }
      );
    }
  } catch (error) {
    const latency = Date.now() - startTime;
    return NextResponse.json(
      {
        status: "down",
        latency,
        message: error instanceof Error ? error.message : "Orchestration service unreachable",
      },
      { status: 503 }
    );
  }
}
