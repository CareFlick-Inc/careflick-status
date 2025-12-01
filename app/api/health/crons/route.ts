import { NextResponse } from "next/server";

export async function GET() {
  const startTime = Date.now();
  const url = "https://cronsocket-eggfc4h5cxaac8g8.z03.azurefd.net/health";

  try {
    const response = await fetch(url, {
      method: "GET",
      signal: AbortSignal.timeout(10000),
    });

    const latency = Date.now() - startTime;

    if (response.ok) {
      return NextResponse.json({
        status: "healthy",
        latency,
        message: "Cron jobs service is healthy",
      });
    } else {
      return NextResponse.json(
        {
          status: "degraded",
          latency,
          message: `Cron jobs service returned status ${response.status}`,
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
        message: error instanceof Error ? error.message : "Cron jobs service unreachable",
      },
      { status: 503 }
    );
  }
}
