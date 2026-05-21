export type Intent =
  | "yes"
  | "no"
  | "pain"
  | "water"
  | "help"
  | "stop";

export type CameraPermission = "idle" | "requesting" | "granted" | "denied" | "error";

export interface DetectRequest {
  image_base64: string;
  demo_intent?: Intent | null;
}

export interface DetectionResponse {
  hand_detected: boolean;
  confidence: number;
  intent: Intent | null;
  phrase: string | null;
  source: "vision" | "demo";
  raw_intent?: string | null;
  raw_confidence?: number | null;
  accepted_intent?: string | null;
  acceptance_threshold?: number | null;
  accepted_phrase_available?: boolean | null;
  suppression_reason?: string | null;
  asl_yes_debug?: Record<string, number | boolean> | null;
  error?: string | null;
}

export interface VoiceRequest {
  text: string;
}

export interface VoiceResponse {
  ok: boolean;
  audio_base64: string | null;
  content_type: string;
  provider: "elevenlabs" | "fallback";
  message: string;
}

