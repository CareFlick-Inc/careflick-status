import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

let cachedClient: MongoClient | null = null;
let cachedPromise: Promise<MongoClient> | null = null;

async function getMongoClient(mongoUri: string): Promise<MongoClient> {
  if (cachedClient) return cachedClient;
  if (!cachedPromise) {
    cachedPromise = (async () => {
      const client = new MongoClient(mongoUri, { serverSelectionTimeoutMS: 5000 });
      await client.connect();
      cachedClient = client;
      return client;
    })();
  }
  return cachedPromise;
}

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

    startTime = Date.now();
    const client = await getMongoClient(mongoUri);
    await client.db("admin").command({ ping: 1 });

    const latency = Date.now() - startTime;

    return NextResponse.json({
      status: "healthy",
      latency,
      message: "Database is responsive",
    });
  } catch (error) {
    const latency = Date.now() - startTime;
    return NextResponse.json(
      {
        status: "down",
        latency,
        message: error instanceof Error ? error.message : "Database connection failed",
      },
      { status: 503 }
    );
  }
}
