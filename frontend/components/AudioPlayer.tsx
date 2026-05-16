"use client";

import { useEffect, useRef, useState } from "react";

import { synthesizeVoice } from "@/services/api";
import { base64ToObjectUrl, speakFallback } from "@/services/elevenlabs";

interface AudioPlayerProps {
  phrase: string | null;
}

const COOLDOWN_MS = 3000;

export default function AudioPlayer({ phrase }: AudioPlayerProps) {
  const [status, setStatus] = useState("Idle");
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const lastSpokenPhraseRef = useRef<string>("");
  const lastSpokenAtRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!phrase) {
      return;
    }

    const now = Date.now();
    if (
      phrase === lastSpokenPhraseRef.current &&
      now - lastSpokenAtRef.current < COOLDOWN_MS
    ) {
      return;
    }

    const playVoice = async () => {
      setStatus("Generating voice...");
      try {
        const result = await synthesizeVoice({ text: phrase });
        lastSpokenPhraseRef.current = phrase;
        lastSpokenAtRef.current = Date.now();

        if (result.audio_base64) {
          const objectUrl = base64ToObjectUrl(result.audio_base64, result.content_type);
          setAudioSrc(objectUrl);
          setStatus("Playing");
          window.setTimeout(() => {
            void audioRef.current?.play();
          }, 50);
          return;
        }

        speakFallback(phrase);
        setStatus("Playing fallback voice");
      } catch {
        speakFallback(phrase);
        setStatus("Voice unavailable, fallback speaking");
      }
    };

    void playVoice();
  }, [phrase]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Voice Output</p>
      <p className="mt-3 text-lg font-semibold text-slate-900">{status}</p>
      {phrase ? <p className="mt-2 text-sm text-slate-600">Last phrase: {phrase}</p> : null}
      {audioSrc ? <audio ref={audioRef} src={audioSrc} controls className="mt-4 w-full" /> : null}
    </div>
  );
}

