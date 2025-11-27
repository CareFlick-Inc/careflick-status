import { NextResponse } from "next/server";
import { createClient } from "redis";

export async function GET() {
  const startTime = Date.now();

  try {
    const redisUrl = process.env.REDIS_URL;

    if (!redisUrl) {
      return NextResponse.json(
        {
          status: "down",
          latency: null,
          message: "Redis URL not configured",
        },
        { status: 500 }
      );
    }

    const client = createClient({
      url: redisUrl,
      socket: {
        connectTimeout: 5000,
      },
    });

    await client.connect();
    await client.ping();
    await client.quit();

    const latency = Date.now() - startTime;

    return NextResponse.json({
      status: "healthy",
      latency,
      message: "Redis is responsive",
    });
  } catch (error) {
    const latency = Date.now() - startTime;
    return NextResponse.json(
      {
        status: "down",
        latency,
        message: error instanceof Error ? error.message : "Redis connection failed",
      },
      { status: 503 }
    );
  }
}
