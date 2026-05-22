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
  intent: Intent | "unknown" | null;
  phrase: string | null;
  source: "vision" | "demo";
  handedness?: string | null;
  handedness_score?: number | null;
  detector_confidence?: number | null;
  debug_landmarks?: number[][] | null;
  raw_intent?: string | null;
  raw_confidence?: number | null;
  accepted_intent?: string | null;
  acceptance_threshold?: number | null;
  accepted_phrase_available?: boolean | null;
  suppression_reason?: string | null;
  asl_yes_debug?: Record<string, number | boolean> | null;
  capture_saved?: boolean;
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

