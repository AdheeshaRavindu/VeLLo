"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, Camera, Lock, Mic } from "lucide-react";

type PermissionState = "idle" | "requesting" | "denied";

type GatekeeperProps = {
  onComplete?: () => void;
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function Gatekeeper({ onComplete }: GatekeeperProps) {
  const [permissionState, setPermissionState] = useState<PermissionState>("idle");

  useEffect(() => {
    const mainEl = document.getElementById("gatekeeper-root");
    const styleSheets = Array.from(document.styleSheets || []);
    const styleSheetHrefs = styleSheets
      .map((sheet) => {
        try {
          return (sheet as CSSStyleSheet).href || "inline";
        } catch {
          return "inaccessible";
        }
      })
      .slice(0, 8);

    // #region agent log
    fetch("http://127.0.0.1:7613/ingest/52c74c4f-229c-4906-8eec-ed86f8bcaaad",{method:"POST",headers:{"Content-Type":"application/json","X-Debug-Session-Id":"57db8f"},body:JSON.stringify({sessionId:"57db8f",runId:"pre-fix",hypothesisId:"H1",location:"frontend/components/Gatekeeper.tsx:26",message:"Gatekeeper mounted and stylesheet snapshot",data:{pathname:window.location.pathname,styleSheetCount:styleSheets.length,styleSheetHrefs,hasMainElement:Boolean(mainEl)},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    if (mainEl) {
      const computed = window.getComputedStyle(mainEl);
      // #region agent log
      fetch("http://127.0.0.1:7613/ingest/52c74c4f-229c-4906-8eec-ed86f8bcaaad",{method:"POST",headers:{"Content-Type":"application/json","X-Debug-Session-Id":"57db8f"},body:JSON.stringify({sessionId:"57db8f",runId:"pre-fix",hypothesisId:"H2",location:"frontend/components/Gatekeeper.tsx:31",message:"Computed styles for gatekeeper root",data:{className:mainEl.className,backgroundColor:computed.backgroundColor,color:computed.color,fontFamily:computed.fontFamily},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
    }
  }, []);

  const requestPermission = useCallback(async () => {
    setPermissionState("requesting");
    await wait(1500);

    const shouldDeny = Math.random() < 0.5;
    if (shouldDeny) {
      setPermissionState("denied");
      return;
    }

    setPermissionState("idle");
    onComplete?.();
  }, [onComplete]);

  return (
    <main
      id="gatekeeper-root"
      className="min-h-screen bg-zinc-950 px-4 py-8 text-zinc-100 sm:px-6 lg:px-8"
    >
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-3xl items-center justify-center">
        <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-10">
          {permissionState === "denied" ? (
            <div className="space-y-7 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 text-red-400">
                <AlertCircle className="h-6 w-6" aria-hidden="true" />
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl font-bold tracking-tight text-red-400 sm:text-4xl">
                  We can&apos;t see you! 🙈
                </h1>
                <p className="mx-auto max-w-xl text-sm leading-relaxed text-zinc-300 sm:text-base">
                  It looks like your camera is blocked. Click the lock icon in
                  your browser&apos;s address bar to allow access, then refresh the
                  page.
                </p>
              </div>

              <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800/60 px-4 py-2 text-xs text-zinc-400">
                <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Enable camera and microphone permissions in browser settings.</span>
              </div>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex h-12 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800 px-6 text-sm font-semibold text-zinc-100 transition hover:border-zinc-500 hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
              >
                Refresh Page
              </button>
            </div>
          ) : (
            <div className="space-y-8 text-center">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
                  Let&apos;s give your hands a voice.
                </h1>
                <p className="text-lg font-semibold text-zinc-300 sm:text-xl">
                  Signs ටික real-time voice එකට හරවමු.
                </p>
                <p className="mx-auto max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
                  To translate your signs into spoken words, the system needs to
                  see your movements. We don&apos;t record or store your video -
                  everything processes live on your screen.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  disabled={permissionState === "requesting"}
                  onClick={requestPermission}
                  className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-6 text-base font-semibold text-zinc-100 shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_0_40px_rgba(255,255,255,0.06)] transition hover:border-zinc-500 hover:bg-zinc-700 disabled:cursor-not-allowed disabled:border-zinc-700 disabled:bg-zinc-800/50 disabled:text-zinc-400 sm:w-auto sm:min-w-[280px]"
                >
                  {permissionState === "requesting" ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-500 border-t-zinc-100" />
                      Waiting for permission...
                    </>
                  ) : (
                    <>
                      <Camera className="h-5 w-5" aria-hidden="true" />
                      <Mic className="h-5 w-5" aria-hidden="true" />
                      <span>📸 Enable Camera &amp; Mic</span>
                    </>
                  )}
                </button>

                <p className="text-xs text-zinc-500">
                  A browser popup will appear next. Please click &quot;Allow&quot; to
                  start.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
