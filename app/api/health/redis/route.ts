import { NextResponse } from "next/server";
import { createClient } from "redis";

const REDIS_URL = process.env.REDIS_URL;
const REDIS_USERNAME = process.env.REDIS_USERNAME;
const REDIS_KEY = process.env.REDIS_KEY;
const REDIS_PORT = process.env.REDIS_PORT;

export async function GET() {
  let startTime = Date.now();

  try {
    if (!REDIS_URL || !REDIS_KEY || !REDIS_PORT) {
      return NextResponse.json(
        {
          status: "down",
          latency: null,
          message: "Redis configuration incomplete",
        },
        { status: 500 }
      );
    }
    console.log('Connecting to Redis at', REDIS_URL, 'on port', REDIS_PORT);
    const credentials = REDIS_USERNAME ? `${REDIS_USERNAME}:${REDIS_KEY}` : `:${REDIS_KEY}`;
    const client = createClient({
      url: `rediss://${credentials}@${REDIS_URL}:${REDIS_PORT}`,
      socket: {
        connectTimeout: 20000,
        reconnectStrategy: retries => Math.min(retries * 50, 2000)
      },
    });

    startTime = Date.now();
    
    await client.connect();
    await client.ping();
    await client.quit();
    console.log('Redis ping successful');
    const latency = Date.now() - startTime;

    return NextResponse.json({
      status: "healthy",
      latency,
      message: "Cache is responsive",
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
