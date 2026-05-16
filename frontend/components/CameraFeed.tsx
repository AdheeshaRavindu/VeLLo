import type { RefObject } from "react";

interface CameraFeedProps {
  videoRef: RefObject<HTMLVideoElement>;
  isActive: boolean;
}

export default function CameraFeed({ videoRef, isActive }: CameraFeedProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-sm">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="aspect-video w-full -scale-x-100 bg-slate-900 object-cover"
      />
      {!isActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 p-4 text-center text-base font-medium text-white">
          Camera is not active
        </div>
      )}
    </div>
  );
}

