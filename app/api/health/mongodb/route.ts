import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

export async function GET() {
  const startTime = Date.now();

  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      return NextResponse.json(
        {
          status: "down",
          latency: null,
          message: "MongoDB URI not configured",
        },
        { status: 500 }
      );
    }

    const client = new MongoClient(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    await client.connect();
    await client.db("admin").command({ ping: 1 });
    await client.close();

    const latency = Date.now() - startTime;

    return NextResponse.json({
      status: "healthy",
      latency,
      message: "MongoDB is responsive",
    });
  } catch (error) {
    const latency = Date.now() - startTime;
    return NextResponse.json(
      {
        status: "down",
        latency,
        message: error instanceof Error ? error.message : "MongoDB connection failed",
      },
      { status: 503 }
    );
  }
}
