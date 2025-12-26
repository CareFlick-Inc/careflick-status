import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";

interface LLMHealthResult {
  gemini: { status: string; latency: number | null; message: string };
  openai: { status: string; latency: number | null; message: string };
  azureOpenai: { status: string; latency: number | null; message: string };
}

async function checkGemini() {
  let startTime = Date.now();
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        status: "down",
        latency: null,
        message: "Gemini API key not configured",
      };
    }

    const genAI = new GoogleGenAI({ apiKey });

    startTime = Date.now();
    // Simple test prompt using the new API
    await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Hello",
    });

    const latency = Date.now() - startTime;
    return {
      status: "healthy",
      latency,
      message: "Gemini API is responsive",
    };
  } catch (error) {
    const latency = Date.now() - startTime;
    return {
      status: "down",
      latency,
      message: error instanceof Error ? error.message : "Gemini API failed",
    };
  }
}

async function checkOpenAI() {
  let startTime = Date.now();
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return {
        status: "down",
        latency: null,
        message: "OpenAI API key not configured",
      };
    }

    const openai = new OpenAI({ apiKey });

    startTime = Date.now();
    // List models as a lightweight check
    await openai.models.list();

    const latency = Date.now() - startTime;
    return {
      status: "healthy",
      latency,
      message: "OpenAI API is responsive",
    };
  } catch (error) {
    const latency = Date.now() - startTime;
    return {
      status: "down",
      latency,
      message: error instanceof Error ? error.message : "OpenAI API failed",
    };
  }
}

async function checkAzureOpenAI() {
  let startTime = Date.now();
  try {
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const apiKey = process.env.AZURE_OPENAI_API_KEY;

    if (!endpoint || !apiKey) {
      return {
        status: "down",
        latency: null,
        message: "Azure OpenAI credentials not configured",
      };
    }

    startTime = Date.now();

    // Simple ping by listing models
    const response = await fetch(`${endpoint}/openai/models?api-version=${process.env.AZURE_OPENAI_API_VERSION || '2023-05-15'}`, {
      headers: {
        'api-key': apiKey,
      },
    });

    const latency = Date.now() - startTime;

    if (response.ok) {
      return {
        status: "healthy",
        latency,
        message: "Azure OpenAI API is responsive",
      };
    } else {
      return {
        status: "down",
        latency,
        message: `Azure OpenAI returned status ${response.status}`,
      };
    }
  } catch (error) {
    const latency = Date.now() - startTime;
    return {
      status: "down",
      latency,
      message: error instanceof Error ? error.message : "Azure OpenAI API failed",
    };
  }
}

export async function GET() {
  try {
    // Check all LLM services in parallel
    const [gemini, openai, azureOpenai] = await Promise.all([
      checkGemini(),
      checkOpenAI(),
      checkAzureOpenAI(),
    ]);

    // Determine overall status - all must be healthy
    const allHealthy = [gemini, openai, azureOpenai].every((r) => r.status === "healthy");
    
    // Combine into single result with Gemini latency
    const combinedResult = {
      status: allHealthy ? "healthy" : "down",
      latency: gemini.latency,
      message: allHealthy 
        ? "All LLM services are healthy" 
        : `Some LLM services are down: ${[
            gemini.status !== "healthy" ? "Gemini" : null,
            openai.status !== "healthy" ? "OpenAI" : null,
            azureOpenai.status !== "healthy" ? "Azure OpenAI" : null,
          ].filter(Boolean).join(", ")}`,
    };

    return NextResponse.json(combinedResult, {
      status: allHealthy ? 200 : 503,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "LLM health check failed",
      },
      { status: 500 }
    );
  }
}
