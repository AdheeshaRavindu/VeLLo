import type {
  DetectRequest,
  DetectionResponse,
  VoiceRequest,
  VoiceResponse,
} from "@/types";

/**
 * If set, the browser calls this origin directly.
 * If unset/empty, requests use same-origin `/api/proxy/*` (see app/api/proxy/[...path]/route.ts).
 */
const RAW_API_BASE =
  typeof process.env.NEXT_PUBLIC_API_BASE_URL === "string"
    ? process.env.NEXT_PUBLIC_API_BASE_URL.trim()
    : "";

const DEFAULT_BACKEND = "http://127.0.0.1:8000";

function resolveRequestUrl(apiPath: string): string {
  if (RAW_API_BASE.length > 0) {
    return `${RAW_API_BASE.replace(/\/$/, "")}${apiPath}`;
  }
  return apiPath.replace(/^\/api\//, "/api/proxy/");
}

function apiHint(): string {
  return RAW_API_BASE.length > 0 ? RAW_API_BASE : `${DEFAULT_BACKEND} (via Next.js proxy)`;
}

async function postJson<TResponse, TBody>(path: string, body: TBody): Promise<TResponse> {
  const url = resolveRequestUrl(path);
  let response: Response;

  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    const isFetchFailure =
      err instanceof TypeError &&
      (reason === "Failed to fetch" || reason.toLowerCase().includes("fetch"));
    const suffix = `. Cannot reach ${apiHint()}. From repo root / frontend: run "npm install" then "npm run dev" (starts API + Next), or "docker compose up backend".`;
    throw new Error(
      isFetchFailure ? `Failed to fetch${suffix}` : `Failed to fetch (${reason})${suffix}`,
    );
  }

  if (!response.ok) {
    let detail = `HTTP ${response.status}`;
    try {
      const text = await response.text();
      const parsed = JSON.parse(text) as { detail?: unknown };
      if (typeof parsed.detail === "string") {
        detail = `${parsed.detail} (${response.status})`;
      } else if (text.trim()) {
        detail = `${text.trim().slice(0, 200)} (${response.status})`;
      }
    } catch {
      detail = `HTTP ${response.status} — ${apiHint()}`;
    }
    throw new Error(`Request failed — ${detail}`);
  }

  try {
    return (await response.json()) as TResponse;
  } catch {
    throw new Error(`Invalid response from API (not JSON) — ${apiHint()}`);
  }
}

export function detectSign(body: DetectRequest): Promise<DetectionResponse> {
  return postJson<DetectionResponse, DetectRequest>("/api/detect", body);
}

export function synthesizeVoice(body: VoiceRequest): Promise<VoiceResponse> {
  return postJson<VoiceResponse, VoiceRequest>("/api/voice", body);
}
