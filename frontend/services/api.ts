import type {
  DetectRequest,
  DetectionResponse,
  VoiceRequest,
  VoiceResponse,
} from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

async function postJson<TResponse, TBody>(path: string, body: TBody): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }

  return (await response.json()) as TResponse;
}

export function detectSign(body: DetectRequest): Promise<DetectionResponse> {
  return postJson<DetectionResponse, DetectRequest>("/api/detect", body);
}

export function synthesizeVoice(body: VoiceRequest): Promise<VoiceResponse> {
  return postJson<VoiceResponse, VoiceRequest>("/api/voice", body);
}

