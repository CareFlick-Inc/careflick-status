import { NextResponse } from "next/server";

export async function GET() {
  let startTime = Date.now();
  const url = "https://novacronsocket-djapfqhabdexc9er.z03.azurefd.net/health";

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
        message: "Nova Crons is accessible",
      });
    } else {
      return NextResponse.json(
        {
          status: "degraded",
          latency,
          message: `Nova Crons returned status ${response.status}`,
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
        message: error instanceof Error ? error.message : "Nova Crons unreachable",
      },
      { status: 503 }
    );
  }
}
