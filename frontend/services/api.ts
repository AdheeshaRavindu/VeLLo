import type { DetectRequest, DetectionResponse, VoiceRequest, VoiceResponse } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

async function postJson<TResponse, TBody>(path: string, body: TBody): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let detail = "";
    try {
      const payload = (await response.json()) as { detail?: string | { msg?: string }[] };
      if (typeof payload.detail === "string") {
        detail = payload.detail;
      } else if (Array.isArray(payload.detail) && payload.detail[0]?.msg) {
        detail = payload.detail[0].msg;
      }
    } catch {
      // Keep default message if response is not JSON.
    }
    throw new Error(detail ? `Request failed (${response.status}): ${detail}` : `Request failed (${response.status})`);
  }

  return (await response.json()) as TResponse;
}

export function detectSign(body: DetectRequest): Promise<DetectionResponse> {
  return postJson<DetectionResponse, DetectRequest>("/api/detect", body);
}

export function detectDebug(body: DetectRequest): Promise<DetectionResponse> {
  return postJson<DetectionResponse, DetectRequest>("/api/debug", body);
}

export function synthesizeVoice(body: VoiceRequest): Promise<VoiceResponse> {
  return postJson<VoiceResponse, VoiceRequest>("/api/voice", body);
}

