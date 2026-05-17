"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { detectSign, synthesizeVoice } from "@/services/api";
import { base64ToObjectUrl, speakFallback } from "@/services/elevenlabs";
import type { Intent } from "@/types";

type IconProps = {
  className?: string;
  "aria-hidden"?: boolean;
};

const Captions = ({ className, ...props }: IconProps) => (
  <span className={className} {...props}>
    {"CC"}
  </span>
);

const ChevronLeft = ({ className, ...props }: IconProps) => (
  <span className={className} {...props}>
    {"<"}
  </span>
);

const ChevronRight = ({ className, ...props }: IconProps) => (
  <span className={className} {...props}>
    {">"}
  </span>
);

const Languages = ({ className, ...props }: IconProps) => (
  <span className={className} {...props}>
    {"A"}
  </span>
);

const Sparkles = ({ className, ...props }: IconProps) => (
  <span className={className} {...props}>
    {"*"}
  </span>
);

const Video = ({ className, ...props }: IconProps) => (
  <span className={className} {...props}>
    {"V"}
  </span>
);

const Volume2 = ({ className, ...props }: IconProps) => (
  <span className={className} {...props}>
    {"O"}
  </span>
);

export default function StudioPage() {
  const NO_HAND_RESET_MS = 700;
  const FEED_DUPLICATE_WINDOW_MS = 2000;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastSpokenTextRef = useRef<string>("");
  const lastSpokenAtRef = useRef<number>(0);
  const inFlightRef = useRef(false);
  const noHandSinceRef = useRef<number | null>(null);
  const lastRecognitionKeyRef = useRef<string>("");
  const lastRecognitionAtRef = useRef<number>(0);

  const [cameraStatus, setCameraStatus] = useState<"loading" | "ready" | "denied">(
    "loading",
  );
  const [subtitleVisible, setSubtitleVisible] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [phrasePulse, setPhrasePulse] = useState(false);
  const [audioState, setAudioState] = useState<"idle" | "generating" | "playing" | "error">(
    "idle",
  );
  const [isDetecting, setIsDetecting] = useState(false);
  const [handDetected, setHandDetected] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [recognizedIntent, setRecognizedIntent] = useState<Intent | null>(null);
  const [recognizedGloss, setRecognizedGloss] = useState("[WAITING FOR HAND]");
  const [recognizedTranslation, setRecognizedTranslation] = useState("Show a hand gesture to begin");
  const [detectionError, setDetectionError] = useState<string | null>(null);
  const [translationFeed, setTranslationFeed] = useState<
    Array<{ id: number; gloss: string; translation: string; timestamp: number; confidence: number }>
  >([]);
  const [panelOpen, setPanelOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const touchStartY = useRef<number | null>(null);

  const subtitleFrames = [{ gloss: recognizedGloss, translation: recognizedTranslation }];
  const subtitleIndex = 0;

  const intentToGloss = useCallback((intent: Intent | null) => {
    if (intent === "yes") return "[YES]";
    if (intent === "no") return "[NO]";
    if (intent === "water") return "[WATER]";
    if (intent === "pain") return "[PAIN]";
    if (intent === "stop") return "[STOP]";
    return "[UNRECOGNIZED]";
  }, []);

  const updateRecognition = useCallback(
    (intent: Intent, phrase: string, score: number) => {
      const now = Date.now();
      const recognitionKey = `${intent}|${phrase}`;
      const isDuplicateRecognition =
        recognitionKey === lastRecognitionKeyRef.current &&
        now - lastRecognitionAtRef.current < FEED_DUPLICATE_WINDOW_MS;

      lastRecognitionKeyRef.current = recognitionKey;
      lastRecognitionAtRef.current = now;

      const nextGloss = intentToGloss(intent);
      setRecognizedIntent(intent);
      setConfidence(score);
      if (!isDuplicateRecognition) {
        setPhrasePulse(true);
        setSubtitleVisible(false);
        window.setTimeout(() => {
          setRecognizedGloss(nextGloss);
          setRecognizedTranslation(phrase);
          setSubtitleVisible(true);
        }, 180);
        window.setTimeout(() => setPhrasePulse(false), 650);
        setTranslationFeed((prev) =>
          [
            {
              id: now,
              gloss: nextGloss,
              translation: phrase,
              timestamp: now,
              confidence: score,
            },
            ...prev,
          ].slice(0, 5),
        );
      }
    },
    [FEED_DUPLICATE_WINDOW_MS, intentToGloss],
  );

  const resetRecognitionToIdle = useCallback(() => {
    lastRecognitionKeyRef.current = "";
    lastRecognitionAtRef.current = 0;
    setRecognizedIntent(null);
    setConfidence(0);
    setRecognizedGloss("[WAITING FOR HAND]");
    setRecognizedTranslation("Show a hand gesture to begin");
    setSubtitleVisible(true);
    setPhrasePulse(false);
    setAudioState("idle");
    setIsSpeaking(false);
  }, []);

  const speakPhrase = useCallback(async (text: string) => {
    const now = Date.now();
    if (lastSpokenTextRef.current === text && now - lastSpokenAtRef.current < 2500) {
      return;
    }
    lastSpokenTextRef.current = text;
    lastSpokenAtRef.current = now;

    try {
      setAudioState("generating");
      const voiceResult = await synthesizeVoice({ text });
      if (voiceResult.audio_base64) {
        const src = base64ToObjectUrl(voiceResult.audio_base64, voiceResult.content_type);
        if (audioRef.current) {
          audioRef.current.src = src;
          await audioRef.current.play();
          setAudioState("playing");
          setIsSpeaking(true);
          return;
        }
      }
      speakFallback(text);
      setAudioState("playing");
      setIsSpeaking(true);
    } catch {
      speakFallback(text);
      setAudioState("error");
      setIsSpeaking(false);
    }
  }, []);

  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      return null;
    }
    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
    }
    const canvas = canvasRef.current;
    const width = Math.min(960, video.videoWidth);
    const scale = width / video.videoWidth;
    canvas.width = width;
    canvas.height = Math.round(video.videoHeight * scale);
    const context = canvas.getContext("2d");
    if (!context) return null;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.8);
  }, []);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            facingMode: "user",
          },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        setCameraStatus("ready");
      } catch {
        setCameraStatus("denied");
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  useEffect(() => {
    if (cameraStatus !== "ready") {
      return;
    }
    let cancelled = false;
    const timer = window.setInterval(async () => {
      if (cancelled || inFlightRef.current) {
        return;
      }
      const image = captureFrame();
      if (!image) {
        return;
      }
      inFlightRef.current = true;
      setIsDetecting(true);
      setDetectionError(null);
      try {
        const result = await detectSign({ image_base64: image });
        if (cancelled) return;
        setHandDetected(result.hand_detected);
        setConfidence(result.confidence ?? 0);
        if (result.intent && result.phrase) {
          noHandSinceRef.current = null;
          updateRecognition(result.intent, result.phrase, result.confidence);
          void speakPhrase(result.phrase);
        } else {
          setIsSpeaking(false);
          if (!result.hand_detected) {
            const now = Date.now();
            if (noHandSinceRef.current === null) {
              noHandSinceRef.current = now;
            }
            if (now - noHandSinceRef.current >= NO_HAND_RESET_MS) {
              resetRecognitionToIdle();
            }
          } else {
            noHandSinceRef.current = null;
          }
          if (result.error) {
            setDetectionError(result.error);
          }
        }
      } catch {
        if (!cancelled) {
          setDetectionError("Detection request failed");
          setHandDetected(false);
        }
      } finally {
        if (!cancelled) {
          setIsDetecting(false);
        }
        inFlightRef.current = false;
      }
    }, 320);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [cameraStatus, captureFrame, resetRecognitionToIdle, speakPhrase, updateRecognition]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleEnded = () => {
      setIsSpeaking(false);
      setAudioState("idle");
    };
    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, []);

  const cameraHealth =
    cameraStatus === "ready"
      ? "active"
      : cameraStatus === "loading"
        ? "processing"
        : "error";
  const aiProcessingHealth =
    cameraStatus === "denied"
      ? "error"
      : isDetecting
        ? "active"
        : detectionError
          ? "error"
          : "standby";
  const audioReadyHealth =
    cameraStatus === "denied"
      ? "error"
      : audioState === "playing" || isSpeaking
        ? "active"
        : audioState === "generating"
          ? "processing"
          : "standby";

  const detectionSignals = [
    {
      label: "Webcam Active",
      stateText:
        cameraStatus === "ready" ? "ACTIVE" : cameraStatus === "loading" ? "STANDBY" : "DISCONNECTED",
      tone: cameraStatus === "ready" ? "active" : cameraStatus === "loading" ? "standby" : "error",
    },
    {
      label: "Hand Detected",
      stateText:
        cameraStatus === "denied" ? "DISCONNECTED" : handDetected ? "DETECTED" : "STANDBY",
      tone: cameraStatus === "denied" ? "error" : handDetected ? "active" : "standby",
    },
    {
      label: "AI Processing",
      stateText:
        cameraStatus === "denied"
          ? "DISCONNECTED"
          : detectionError
            ? "ERROR"
            : isDetecting
              ? "PROCESSING"
              : "STANDBY",
      tone:
        cameraStatus === "denied"
          ? "error"
          : detectionError
            ? "error"
            : isDetecting
              ? "processing"
              : "standby",
    },
    {
      label: "Voice Output Ready",
      stateText:
        cameraStatus === "denied"
          ? "DISCONNECTED"
          : audioState === "generating"
            ? "GENERATING"
            : isSpeaking
              ? "SPEAKING"
              : "STANDBY",
      tone:
        cameraStatus === "denied"
          ? "error"
          : audioState === "generating"
            ? "processing"
            : isSpeaking
              ? "active"
              : "standby",
    },
  ] as const;
  const currentFrame = subtitleFrames[subtitleIndex];
  const recognizedPhrase = currentFrame.translation.replace(/[.?!]/g, "").toUpperCase();
  const confidenceText = `${Math.round(confidence * 100)}%`;
  const liveTranslationStream = translationFeed.slice(0, 5);
  const formatRelativeTime = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 1) return "just now";
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const statusTone = (state: "active" | "processing" | "error" | "standby") =>
    state === "active"
      ? "bg-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.9)]"
      : state === "processing"
        ? "bg-amber-300 shadow-[0_0_10px_rgba(252,211,77,0.9)]"
        : state === "standby"
          ? "bg-sky-300 shadow-[0_0_10px_rgba(125,211,252,0.85)]"
          : "bg-red-300 shadow-[0_0_10px_rgba(252,165,165,0.9)]";

  return (
    <main className="h-[100dvh] overflow-hidden bg-gradient-to-b from-emerald-50 via-lime-50 to-green-100 px-4 py-2 text-emerald-950 sm:px-6 lg:px-8 lg:py-3">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_40%_20%,rgba(16,185,129,0.14),transparent_40%),radial-gradient(circle_at_85%_15%,rgba(132,204,22,0.12),transparent_38%),radial-gradient(circle_at_30%_100%,rgba(20,184,166,0.08),transparent_45%)]" />

      <section
        className={`relative mx-auto grid h-full w-full max-w-[1500px] min-h-0 grid-cols-1 gap-3 transition-[grid-template-columns] duration-300 lg:gap-4 ${
          panelOpen
            ? "lg:grid-cols-[minmax(0,1fr)_320px]"
            : "lg:grid-cols-[minmax(0,1fr)_80px]"
        }`}
      >
        <div className="relative min-h-0 overflow-hidden rounded-3xl border border-emerald-300/55 bg-white/60 shadow-[0_20px_52px_rgba(6,95,70,0.22),0_0_40px_rgba(16,185,129,0.18)] backdrop-blur-2xl">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-100/70 via-lime-100/60 to-green-100/70" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(16,185,129,0.22),transparent_45%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_110%,rgba(236,253,245,0.82),transparent_58%)]" />

          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 h-full w-full object-cover [-webkit-transform:scaleX(-1)] [transform:scaleX(-1)] [filter:contrast(1.08)_brightness(1.04)_saturate(1.08)]"
          />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-emerald-950/20 via-transparent to-transparent" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(6,95,70,0.22)_100%)]" />

          {cameraStatus !== "ready" ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="rounded-full border border-emerald-300/60 bg-white/80 px-4 py-2 text-sm text-emerald-900 backdrop-blur-xl">
                {cameraStatus === "loading"
                  ? "Starting camera..."
                  : "Camera access denied. Please allow camera permissions."}
              </p>
            </div>
          ) : null}

          <div className="pointer-events-none absolute left-[10%] top-[13%] h-8 w-8 rounded-tl-xl border-l-2 border-t-2 border-emerald-500/90 shadow-[0_0_10px_rgba(16,185,129,0.72)]" />
          <div className="pointer-events-none absolute right-[10%] top-[13%] h-8 w-8 rounded-tr-xl border-r-2 border-t-2 border-lime-500/90 shadow-[0_0_10px_rgba(132,204,22,0.72)]" />
          <div className="pointer-events-none absolute bottom-[24%] left-[10%] h-8 w-8 rounded-bl-xl border-b-2 border-l-2 border-emerald-500/90 shadow-[0_0_10px_rgba(16,185,129,0.72)]" />
          <div className="pointer-events-none absolute bottom-[24%] right-[10%] h-8 w-8 rounded-br-xl border-b-2 border-r-2 border-lime-500/90 shadow-[0_0_10px_rgba(132,204,22,0.72)]" />

          <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-white/80 px-3 py-1.5 text-xs font-medium tracking-[0.1em] text-emerald-800 backdrop-blur-xl">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.85)]" />
            LIVE
          </div>
          {detectionError ? (
            <div className="absolute right-5 top-5 rounded-full border border-red-300/70 bg-white/85 px-3 py-1.5 text-[11px] font-medium tracking-[0.04em] text-red-600 backdrop-blur-xl">
              {detectionError}
            </div>
          ) : null}

          <div className="absolute bottom-0 left-1/2 w-[min(96%,980px)] -translate-x-1/2 overflow-hidden rounded-t-2xl border border-emerald-300/45 bg-white/70 px-4 pb-3 pt-2.5 backdrop-blur-2xl sm:px-6 sm:pb-4 sm:pt-3">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-emerald-100/95 via-emerald-100/80 to-transparent" />
            <div
              className={`relative transform-gpu transition-all duration-300 ${subtitleVisible ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"}`}
            >
              <div className="mb-1 flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.16em] text-emerald-800/85 sm:text-xs">
                <Captions className="h-3.5 w-3.5 text-emerald-600" aria-hidden={true} />
                {subtitleFrames[subtitleIndex].gloss}
              </div>
              <p className="text-center text-lg font-bold leading-tight text-emerald-950 antialiased sm:text-2xl lg:text-[1.65rem]">
                {subtitleFrames[subtitleIndex].translation}
              </p>

              <div className="mt-1.5 flex items-center justify-center gap-2 text-[10px] tracking-[0.14em] text-emerald-800/80 sm:text-xs">
                <span
                  className={`inline-flex h-2 w-2 rounded-full transition-all duration-300 ${isSpeaking ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.9)]" : "bg-emerald-800/35"}`}
                />
                <span>VOICE OUTPUT</span>
                <span className="inline-flex items-end gap-1 rounded-full border border-emerald-400/35 bg-emerald-500/10 px-2 py-1 backdrop-blur">
                  {[10, 15, 11, 16].map((h, idx) => (
                    <span
                      key={idx}
                      className={`w-1 rounded-full bg-emerald-500/90 shadow-[0_0_8px_rgba(16,185,129,0.7)] transition-all duration-300 ${isSpeaking ? "animate-pulse" : "opacity-40"}`}
                      style={{ height: `${isSpeaking ? h : 6}px`, animationDelay: `${idx * 110}ms` }}
                    />
                  ))}
                </span>
              </div>
            </div>
          </div>
        </div>

        <aside className="hidden h-full min-h-0 rounded-3xl border border-emerald-300/20 bg-[#071225]/70 p-2 shadow-[0_16px_40px_rgba(2,6,23,0.35),0_0_24px_rgba(16,185,129,0.12),0_0_20px_rgba(56,189,248,0.08)] backdrop-blur-2xl lg:flex lg:flex-col">
          <div className="mb-2 flex items-center justify-between">
            {panelOpen ? (
              <h2 className="text-sm font-semibold tracking-[0.14em] text-emerald-100">
                COMMAND CENTER
              </h2>
            ) : (
              <div className="text-xs tracking-[0.12em] text-emerald-100/70">TOOLS</div>
            )}
            <button
              type="button"
              onClick={() => setPanelOpen((prev) => !prev)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-300/30 bg-[#0b1a31]/70 text-emerald-100 transition hover:border-emerald-300/60 hover:text-white"
              aria-label="Toggle command center panel"
            >
              {panelOpen ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          </div>

          {panelOpen ? (
            <div className="min-h-0 flex-1 overflow-hidden">
              <div className="flex h-full flex-col space-y-2">
                <article className="rounded-2xl border border-emerald-400/25 bg-[#0b1a31]/68 p-2.5 shadow-[0_0_16px_rgba(16,185,129,0.14),0_0_14px_rgba(56,189,248,0.1)] backdrop-blur-xl">
                  <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-emerald-100">
                    <Video className="h-3.5 w-3.5 text-emerald-300" />
                    Detection Status
                  </div>
                  <div className="grid grid-cols-1 gap-1.5">
                    {detectionSignals.map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between rounded-xl border border-emerald-400/25 bg-emerald-900/55 px-2.5 py-1.5"
                      >
                        <span className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.08em] text-emerald-100">
                          <span
                            className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${statusTone(item.tone)} ${
                              item.tone === "active" || item.tone === "processing" ? "animate-pulse" : ""
                            }`}
                          />
                          {item.label}
                        </span>
                        <span className="text-[10px] font-medium tracking-[0.08em] text-emerald-200/85">
                          {item.stateText}
                        </span>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="rounded-2xl border border-emerald-400/25 bg-[#0b1a31]/68 p-2.5 shadow-[0_0_16px_rgba(16,185,129,0.14),0_0_14px_rgba(56,189,248,0.1)] backdrop-blur-xl">
                  <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-emerald-100">
                    <Languages className="h-3.5 w-3.5 text-emerald-300" />
                    Recognized Phrase
                  </div>
                  <div className="flex min-h-[140px] flex-col items-center justify-center rounded-xl border border-emerald-400/25 bg-emerald-900/50 px-3 py-3 text-center shadow-[inset_0_0_0_1px_rgba(16,185,129,0.08)]">
                    <p
                      className={`max-w-[15ch] text-balance text-2xl font-black uppercase leading-tight tracking-[0.08em] text-emerald-50 transition-all duration-300 sm:text-[1.7rem] ${
                        subtitleVisible
                          ? "opacity-100 shadow-[0_0_16px_rgba(16,185,129,0.22)]"
                          : "opacity-55"
                      } ${phrasePulse ? "animate-pulse" : ""}`}
                    >
                      {recognizedPhrase}
                    </p>
                    <p className="mt-3 text-[10px] text-emerald-100/65">
                      Confidence: <span className="font-semibold text-emerald-100">{confidenceText}</span>
                    </p>
                    <p className="mt-1 text-[10px] text-emerald-100/65">
                      Intent:{" "}
                      <span className="font-semibold text-emerald-100">
                        {recognizedIntent ? recognizedIntent.replaceAll("_", " ") : "none"}
                      </span>
                    </p>
                  </div>
                </article>

                <article className="min-h-0 flex flex-1 flex-col rounded-2xl border border-emerald-400/25 bg-[#0b1a31]/68 p-2.5 shadow-[0_0_16px_rgba(16,185,129,0.14),0_0_14px_rgba(56,189,248,0.1)] backdrop-blur-xl">
                  <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-emerald-100">
                    <Volume2 className="h-3.5 w-3.5 text-emerald-300" />
                    Live Translation Stream
                  </div>
                  <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-0.5">
                    {liveTranslationStream.map((item, index) => (
                      <div
                        key={item.id}
                        className={`rounded-xl border border-emerald-400/25 bg-emerald-900/55 px-2.5 py-1.5 transition-all duration-300 ${
                          index === 0
                            ? "translate-y-0 opacity-100"
                            : index === 1
                              ? "translate-y-0.5 opacity-90"
                              : index === 2
                                ? "translate-y-1 opacity-80"
                                : "translate-y-1 opacity-70"
                        }`}
                      >
                        <p className="text-[9px] uppercase tracking-[0.12em] text-emerald-100/65">
                          {item.gloss}
                        </p>
                        <p className="mt-0.5 text-[11px] font-semibold text-white">{item.translation}</p>
                        <p className="mt-0.5 text-[9px] text-emerald-200/55">
                          confidence {Math.round(item.confidence * 100)}%
                        </p>
                        <p className="mt-0.5 text-[9px] text-emerald-200/55">
                          {formatRelativeTime(item.timestamp)}
                        </p>
                      </div>
                    ))}
                  </div>
                </article>
              </div>
            </div>
          ) : (
            <div className="flex h-[calc(100%-44px)] flex-col items-center justify-start gap-2.5 pt-2">
              {[<Video key="v" className="h-4 w-4" />, <Languages key="l" className="h-4 w-4" />, <Volume2 key="a" className="h-4 w-4" />].map(
                (icon, index) => (
                  <span
                    key={index}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-300/30 bg-[#0b1a31]/70 text-emerald-100"
                  >
                    {icon}
                  </span>
                ),
              )}
            </div>
          )}
        </aside>
      </section>

      <button
        type="button"
        onClick={() => setMobileDrawerOpen(true)}
        className="fixed bottom-4 right-4 z-30 inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-[#0b1a31]/78 px-4 py-2 text-xs tracking-[0.1em] text-emerald-100 shadow-[0_0_18px_rgba(16,185,129,0.16),0_0_14px_rgba(56,189,248,0.1)] backdrop-blur-xl lg:hidden"
      >
        <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
        COMMAND CENTER
      </button>

      <div
        className={`fixed inset-0 z-40 transition ${mobileDrawerOpen ? "pointer-events-auto bg-emerald-900/20 opacity-100" : "pointer-events-none bg-transparent opacity-0"} lg:hidden`}
        onClick={() => setMobileDrawerOpen(false)}
      />

      <aside
        className={`fixed bottom-0 left-0 right-0 z-50 max-h-[72vh] rounded-t-3xl border border-emerald-300/25 bg-[#071225]/86 p-3.5 shadow-[0_-10px_36px_rgba(2,6,23,0.45),0_0_18px_rgba(16,185,129,0.14),0_0_12px_rgba(56,189,248,0.1)] backdrop-blur-2xl transition-transform duration-300 lg:hidden ${mobileDrawerOpen ? "translate-y-0" : "translate-y-full"}`}
        onTouchStart={(e) => {
          touchStartY.current = e.touches[0]?.clientY ?? null;
        }}
        onTouchEnd={(e) => {
          const endY = e.changedTouches[0]?.clientY ?? null;
          if (touchStartY.current !== null && endY !== null && endY - touchStartY.current > 60) {
            setMobileDrawerOpen(false);
          }
          touchStartY.current = null;
        }}
      >
        <div className="mx-auto mb-2.5 h-1.5 w-12 rounded-full bg-emerald-300/35" />
        <div className="mb-2.5 flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-[0.14em] text-emerald-100">COMMAND CENTER</h2>
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(false)}
            className="rounded-lg border border-emerald-300/30 bg-[#0b1a31]/75 px-2 py-1 text-xs text-emerald-100"
          >
            CLOSE
          </button>
        </div>
        <div className="overflow-y-auto pb-2">
          <div className="space-y-2">
            <article className="rounded-2xl border border-emerald-400/25 bg-[#0b1a31]/68 p-2.5 shadow-[0_0_16px_rgba(16,185,129,0.14),0_0_14px_rgba(56,189,248,0.1)] backdrop-blur-xl">
              <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-emerald-100">
                <Video className="h-3.5 w-3.5 text-emerald-300" />
                Detection Status
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {detectionSignals.map((item) => (
                  <div
                    key={`mobile-status-${item.label}`}
                    className="flex items-center justify-between rounded-xl border border-emerald-400/25 bg-emerald-900/55 px-2.5 py-1.5"
                  >
                    <span className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.08em] text-emerald-100">
                      <span
                        className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${statusTone(item.tone)} ${
                          item.tone === "active" || item.tone === "processing" ? "animate-pulse" : ""
                        }`}
                      />
                      {item.label}
                    </span>
                    <span className="text-[10px] font-medium tracking-[0.08em] text-emerald-200/85">
                      {item.stateText}
                    </span>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-emerald-400/25 bg-[#0b1a31]/68 p-2.5 shadow-[0_0_16px_rgba(16,185,129,0.14),0_0_14px_rgba(56,189,248,0.1)] backdrop-blur-xl">
              <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-emerald-100">
                <Languages className="h-3.5 w-3.5 text-emerald-300" />
                Recognized Phrase
              </div>
              <div className="flex min-h-[126px] flex-col items-center justify-center rounded-xl border border-emerald-400/25 bg-emerald-900/50 px-3 py-3 text-center shadow-[inset_0_0_0_1px_rgba(16,185,129,0.08)]">
                <p
                  className={`max-w-[15ch] text-balance text-xl font-black uppercase leading-tight tracking-[0.08em] text-emerald-50 transition-all duration-300 ${
                    subtitleVisible
                      ? "opacity-100 shadow-[0_0_14px_rgba(16,185,129,0.2)]"
                      : "opacity-55"
                  } ${phrasePulse ? "animate-pulse" : ""}`}
                >
                  {recognizedPhrase}
                </p>
                <p className="mt-2.5 text-[10px] text-emerald-100/65">
                  Confidence: <span className="font-semibold text-emerald-100">{confidenceText}</span>
                </p>
                <p className="mt-1 text-[10px] text-emerald-100/65">
                  Intent:{" "}
                  <span className="font-semibold text-emerald-100">
                    {recognizedIntent ? recognizedIntent.replaceAll("_", " ") : "none"}
                  </span>
                </p>
              </div>
            </article>

            <article className="rounded-2xl border border-emerald-400/25 bg-[#0b1a31]/68 p-2.5 shadow-[0_0_16px_rgba(16,185,129,0.14),0_0_14px_rgba(56,189,248,0.1)] backdrop-blur-xl">
              <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-emerald-100">
                <Volume2 className="h-3.5 w-3.5 text-emerald-300" />
                Live Translation Stream
              </div>
              <div className="max-h-[28vh] space-y-1.5 overflow-y-auto pr-0.5">
                {liveTranslationStream.map((item, index) => (
                  <div
                    key={`mobile-stream-${item.id}`}
                    className={`rounded-xl border border-emerald-400/25 bg-emerald-900/55 px-2.5 py-1.5 transition-all duration-300 ${
                      index === 0
                        ? "translate-y-0 opacity-100"
                        : index === 1
                          ? "translate-y-0.5 opacity-90"
                          : index === 2
                            ? "translate-y-1 opacity-80"
                            : "translate-y-1 opacity-70"
                    }`}
                  >
                    <p className="text-[9px] uppercase tracking-[0.12em] text-emerald-100/65">{item.gloss}</p>
                    <p className="mt-0.5 text-xs font-semibold text-white">{item.translation}</p>
                    <p className="mt-0.5 text-[9px] text-emerald-200/55">
                      confidence {Math.round(item.confidence * 100)}%
                    </p>
                    <p className="mt-0.5 text-[9px] text-emerald-200/55">
                      {formatRelativeTime(item.timestamp)}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </div>
      </aside>
      <audio ref={audioRef} className="hidden" />
    </main>
  );
}
