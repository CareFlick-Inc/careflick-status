import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

export async function GET() {
  let startTime = Date.now();
  try {
    const mongoUri = process.env.MONGODB_URL;

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
    
    startTime = Date.now();
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
