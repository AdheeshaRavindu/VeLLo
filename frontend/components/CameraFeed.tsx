import type { RefObject } from "react";
import type { TrackingSnapshot } from "@/hooks/useCamera";

interface CameraFeedProps {
  videoRef: RefObject<HTMLVideoElement>;
  isActive: boolean;
  trackingSnapshot: TrackingSnapshot;
}

export default function CameraFeed({ videoRef, isActive, trackingSnapshot }: CameraFeedProps) {
  const points = trackingSnapshot.landmarks ?? [];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-sm">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="aspect-video w-full -scale-x-100 bg-slate-900 object-cover"
      />
      {points.length > 0 && (
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full -scale-x-100"
          viewBox="0 0 1 1"
          preserveAspectRatio="none"
        >
          {points.map((point, index) => (
            <circle
              key={index}
              cx={point[0]}
              cy={point[1]}
              r={0.008}
              fill="#22d3ee"
              opacity={0.9}
            />
          ))}
        </svg>
      )}
      {!isActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 p-4 text-center text-base font-medium text-white">
          Camera is not active
        </div>
      )}
    </div>
  );
}

