export type Intent =
  | "help"
  | "water"
  | "doctor"
  | "medicine"
  | "emergency"
  | "pain"
  | "chest_pain"
  | "breathing_problem"
  | "dizzy"
  | "hungry"
  | "toilet"
  | "yes"
  | "no"
  | "stop"
  | "thank_you";

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

