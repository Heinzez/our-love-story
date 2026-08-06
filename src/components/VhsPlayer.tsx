import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Power, Play, Pause } from "lucide-react";

export interface VhsClip {
  id: string;
  url: string;
  caption?: string | null;
}

const two = (n: number) => String(n).padStart(2, "0");

const VhsPlayer = ({ clips }: { clips: VhsClip[] }) => {
  const [on, setOn] = useState(false);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [clock, setClock] = useState("00:00:00");
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const current = clips[idx];

  useEffect(() => {
    if (idx > clips.length - 1) setIdx(0);
  }, [clips.length, idx]);

  // when a new clip is added, jump to it
  const lastCount = useRef(clips.length);
  useEffect(() => {
    if (clips.length > lastCount.current) setIdx(clips.length - 1);
    lastCount.current = clips.length;
  }, [clips.length]);

  useEffect(() => {
    if (!on) {
      videoRef.current?.pause();
      setPlaying(false);
    }
  }, [on]);

  const step = (d: number) => {
    if (!clips.length) return;
    setIdx((i) => (i + d + clips.length) % clips.length);
    setPlaying(false);
  };

  const toggledPlay = () => {
    const v = videoRef.current;
    if (!v || !on) return;
    if (v.paused) { v.play(); setPlaying(true); } else { v.pause(); setPlaying(false); }
  };

  const onTime = () => {
    const t = Math.floor(videoRef.current?.currentTime ?? 0);
    setClock(`${two(Math.floor(t / 3600))}:${two(Math.floor((t % 3600) / 60))}:${two(t % 60)}`);
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Camcorder body */}
      <div
        className="liquid-glass rounded-[2rem] p-4 md:p-6 border border-primary/25 shadow-2xl"
        style={{
          background:
            "linear-gradient(155deg, hsl(var(--card)) 0%, hsl(var(--background)) 60%, hsl(var(--card)) 100%)",
        }}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full transition-all ${on ? "bg-destructive animate-pulse shadow-[0_0_10px_hsl(var(--destructive))]" : "bg-muted"}`}
            />
            <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-muted-foreground">
              {on ? "REC · PLAY" : "STANDBY"}
            </span>
          </div>
          <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-primary/70">
            VHS-C · HI-FI
          </span>
        </div>

        {/* Screen */}
        <div className="relative rounded-2xl overflow-hidden border-4 border-foreground/15 bg-black aspect-video">
          {on && current ? (
            <video
              key={current.id}
              ref={videoRef}
              src={current.url}
              controls={false}
              playsInline
              preload="metadata"
              onTimeUpdate={onTime}
              onEnded={() => setPlaying(false)}
              onClick={toggledPlay}
              className="w-full h-full object-contain cursor-pointer"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              {/* static noise */}
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(0deg, rgba(255,255,255,.16) 0px, rgba(255,255,255,.16) 1px, transparent 1px, transparent 3px)",
                }}
              />
              <span className="relative text-[11px] font-mono tracking-[0.35em] uppercase text-white/60">
                {on ? "NO TAPE" : "POWER OFF"}
              </span>
            </div>
          )}

          {/* CRT scanlines + vignette overlay */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, rgba(0,0,0,.22) 0px, rgba(0,0,0,.22) 1px, transparent 1px, transparent 3px)",
              boxShadow: "inset 0 0 90px rgba(0,0,0,.65)",
            }}
          />

          {/* On-screen display */}
          {on && (
            <div className="pointer-events-none absolute inset-0 p-3 flex flex-col justify-between font-mono text-[11px] tracking-widest text-[#e8ffd8] drop-shadow-[0_0_6px_rgba(160,255,120,.55)]">
              <div className="flex justify-between">
                <span>{playing ? "▶ PLAY" : "❚❚ PAUSE"}</span>
                <span>{clock}</span>
              </div>
              <div className="flex justify-between items-end">
                <span>
                  TAPE {two(clips.length ? idx + 1 : 0)}/{two(clips.length)}
                </span>
                <span className="max-w-[60%] truncate text-right normal-case tracking-normal">
                  {current?.caption ?? ""}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="mt-5 flex items-center justify-center gap-3 md:gap-4">
          <button
            type="button"
            onClick={() => step(-1)}
            disabled={!on || clips.length < 2}
            aria-label="Previous video"
            className="btn-liquid w-14 h-14 rounded-full flex items-center justify-center border border-primary/30 text-foreground disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            type="button"
            onClick={toggledPlay}
            disabled={!on || !current}
            aria-label={playing ? "Pause" : "Play"}
            className="btn-liquid w-16 h-16 rounded-full flex items-center justify-center border border-primary/40 text-primary disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-primary"
          >
            {playing ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </button>

          <button
            type="button"
            onClick={() => step(1)}
            disabled={!on || clips.length < 2}
            aria-label="Next video"
            className="btn-liquid w-14 h-14 rounded-full flex items-center justify-center border border-primary/30 text-foreground disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <button
            type="button"
            onClick={() => setOn((v) => !v)}
            aria-pressed={on}
            aria-label={on ? "Power off" : "Power on"}
            className={`ml-2 md:ml-4 w-14 h-14 rounded-full flex items-center justify-center border transition-all focus-visible:ring-2 focus-visible:ring-primary ${
              on
                ? "bg-destructive/15 border-destructive/50 text-destructive shadow-[0_0_18px_hsl(var(--destructive)/0.35)]"
                : "border-border/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            <Power className="w-6 h-6" />
          </button>
        </div>

        <p className="mt-3 text-center text-[10px] font-mono tracking-[0.3em] uppercase text-muted-foreground">
          {on ? "tap screen to play / pause" : "press power to start the tape"}
        </p>
      </div>
    </div>
  );
};

export default VhsPlayer;
