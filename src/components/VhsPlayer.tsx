import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Power, Play, Pause, BatteryFull } from "lucide-react";

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

  const lastCount = useRef(clips.length);
  useEffect(() => {
    if (clips.length > lastCount.current) setIdx(clips.length - 1);
    lastCount.current = clips.length;
  }, [clips.length]);

  useEffect(() => {
    if (!on) {
      videoRef.current?.pause();
      setPlaying(false);
      setClock("00:00:00");
    }
  }, [on]);

  const step = (d: number) => {
    if (!clips.length) return;
    setIdx((i) => (i + d + clips.length) % clips.length);
    setPlaying(false);
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v || !on) return;
    if (v.paused) { v.play(); setPlaying(true); } else { v.pause(); setPlaying(false); }
  };

  const onTime = () => {
    const t = Math.floor(videoRef.current?.currentTime ?? 0);
    setClock(`${two(Math.floor(t / 3600))}:${two(Math.floor((t % 3600) / 60))}:${two(t % 60)}`);
  };

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* ── Camcorder shell ── */}
      <div
        className="relative rounded-[2.2rem] p-4 md:p-6 border border-foreground/15 shadow-2xl"
        style={{
          background:
            "linear-gradient(150deg,#3b3b3f 0%,#232326 28%,#17171a 55%,#2c2c30 100%)",
          boxShadow:
            "0 30px 60px -20px rgba(0,0,0,.75), inset 0 1px 0 rgba(255,255,255,.12), inset 0 -2px 12px rgba(0,0,0,.6)",
        }}
      >
        {/* brand strip */}
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-[10px] font-mono tracking-[0.35em] uppercase text-white/45">
            Handycam · VHS-C
          </span>
          <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/30">
            AF 40× ZOOM
          </span>
        </div>

        <div className="flex items-stretch gap-4">
          {/* ── Lens barrel (left) ── */}
          <div className="hidden sm:flex flex-col items-center justify-center shrink-0">
            <div
              className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center"
              style={{
                background: "radial-gradient(circle at 35% 30%,#4a4a50,#101012 70%)",
                boxShadow: "inset 0 0 0 4px #0c0c0e, 0 6px 18px rgba(0,0,0,.7)",
              }}
            >
              <div
                className="w-11 h-11 md:w-14 md:h-14 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle at 35% 30%, rgba(120,200,255,.55), rgba(20,30,60,.9) 55%, #05060a 85%)",
                  boxShadow: "inset 0 0 12px rgba(0,0,0,.9), 0 0 14px rgba(80,160,255,.25)",
                }}
              />
            </div>
            <span className="mt-2 text-[8px] font-mono tracking-[0.2em] text-white/30">f1.8</span>
            {/* mic grille */}
            <div className="mt-3 grid grid-cols-3 gap-[3px]">
              {Array.from({ length: 9 }).map((_, i) => (
                <span key={i} className="w-1 h-1 rounded-full bg-black/70 shadow-[inset_0_1px_0_rgba(255,255,255,.1)]" />
              ))}
            </div>
          </div>

          {/* ── Flip-out LCD ── */}
          <div className="flex-1 min-w-0">
            <div
              className="rounded-[1.2rem] p-2 md:p-3"
              style={{
                background: "linear-gradient(160deg,#2a2a2e,#141416)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,.08), 0 8px 22px rgba(0,0,0,.5)",
              }}
            >
              <div className="relative rounded-xl overflow-hidden bg-black aspect-video border border-black/60">
                {on && current ? (
                  <video
                    key={current.id}
                    ref={videoRef}
                    src={current.url}
                    playsInline
                    preload="metadata"
                    onTimeUpdate={onTime}
                    onEnded={() => setPlaying(false)}
                    onClick={togglePlay}
                    className="w-full h-full object-contain cursor-pointer"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className="absolute inset-0 opacity-25"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(0deg, rgba(255,255,255,.2) 0px, rgba(255,255,255,.2) 1px, transparent 1px, transparent 3px)",
                      }}
                    />
                    <span className="relative text-[11px] font-mono tracking-[0.35em] uppercase text-white/55">
                      {on ? "NO TAPE" : "POWER OFF"}
                    </span>
                  </div>
                )}

                {/* scanlines + vignette */}
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(0deg, rgba(0,0,0,.25) 0px, rgba(0,0,0,.25) 1px, transparent 1px, transparent 3px)",
                    boxShadow: "inset 0 0 90px rgba(0,0,0,.7)",
                  }}
                />

                {/* viewfinder HUD */}
                {on && (
                  <div className="pointer-events-none absolute inset-0 p-2.5 md:p-3 font-mono text-[10px] md:text-[11px] tracking-widest text-white drop-shadow-[0_0_6px_rgba(0,0,0,.9)]">
                    <div className="flex justify-between items-start">
                      <span className="flex items-center gap-1.5 text-[#ff5b5b]">
                        <span className="w-2 h-2 rounded-full bg-[#ff2d2d] animate-pulse" /> REC
                      </span>
                      <span className="flex items-center gap-1 text-white/85">
                        <BatteryFull className="w-3.5 h-3.5" /> 100%
                      </span>
                    </div>

                    {/* corner brackets */}
                    <span className="absolute left-3 top-8 w-5 h-5 border-l-2 border-t-2 border-white/60" />
                    <span className="absolute right-3 top-8 w-5 h-5 border-r-2 border-t-2 border-white/60" />
                    <span className="absolute left-3 bottom-8 w-5 h-5 border-l-2 border-b-2 border-white/60" />
                    <span className="absolute right-3 bottom-8 w-5 h-5 border-r-2 border-b-2 border-white/60" />

                    <div className="absolute left-0 right-0 bottom-2.5 px-3 flex justify-between items-end">
                      <span>{clock}</span>
                      <span className="text-white/80">SP 480i</span>
                    </div>
                    <div className="absolute left-0 right-0 bottom-7 px-3 flex justify-between items-end">
                      <span className="text-[#9dff8c]">
                        {playing ? "▶ PLAY" : "❚❚ PAUSE"} · TAPE {two(clips.length ? idx + 1 : 0)}/{two(clips.length)}
                      </span>
                      <span className="max-w-[55%] truncate text-right tracking-normal normal-case text-white/70">
                        {current?.caption ?? ""}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Control deck ── */}
            <div className="mt-4 flex items-center justify-center gap-3 md:gap-4">
              <button
                type="button"
                onClick={() => step(-1)}
                disabled={!on || clips.length < 2}
                aria-label="Previous video"
                className="w-14 h-14 rounded-full flex items-center justify-center text-white/85 bg-[#2b2b30] border border-black/60 shadow-[inset_0_1px_0_rgba(255,255,255,.14),0_4px_10px_rgba(0,0,0,.6)] active:translate-y-[1px] hover:text-white disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                type="button"
                onClick={togglePlay}
                disabled={!on || !current}
                aria-label={playing ? "Pause" : "Play"}
                className="w-16 h-16 rounded-full flex items-center justify-center text-[#9dff8c] bg-[#232327] border border-black/70 shadow-[inset_0_1px_0_rgba(255,255,255,.16),0_6px_14px_rgba(0,0,0,.65)] active:translate-y-[1px] disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition"
              >
                {playing ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </button>

              <button
                type="button"
                onClick={() => step(1)}
                disabled={!on || clips.length < 2}
                aria-label="Next video"
                className="w-14 h-14 rounded-full flex items-center justify-center text-white/85 bg-[#2b2b30] border border-black/60 shadow-[inset_0_1px_0_rgba(255,255,255,.14),0_4px_10px_rgba(0,0,0,.6)] active:translate-y-[1px] hover:text-white disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              <button
                type="button"
                onClick={() => setOn((v) => !v)}
                aria-pressed={on}
                aria-label={on ? "Power off" : "Power on"}
                className={`ml-2 md:ml-4 w-14 h-14 rounded-full flex items-center justify-center border transition active:translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  on
                    ? "text-[#ff5b5b] bg-[#341a1c] border-[#ff2d2d]/50 shadow-[0_0_20px_rgba(255,45,45,.35),inset_0_1px_0_rgba(255,255,255,.12)]"
                    : "text-white/55 bg-[#2b2b30] border-black/60 shadow-[inset_0_1px_0_rgba(255,255,255,.14),0_4px_10px_rgba(0,0,0,.6)]"
                }`}
              >
                <Power className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* ── Hand grip strap (right) ── */}
          <div className="hidden md:flex flex-col justify-between shrink-0 w-8">
            <div
              className="flex-1 rounded-xl"
              style={{
                background: "repeating-linear-gradient(135deg,#1b1b1e 0 6px,#26262a 6px 12px)",
                boxShadow: "inset 0 0 0 1px rgba(0,0,0,.7), 0 4px 12px rgba(0,0,0,.5)",
              }}
            />
          </div>
        </div>

        <p className="mt-4 text-center text-[10px] font-mono tracking-[0.3em] uppercase text-white/40">
          {on ? "tap the screen to play / pause" : "press power to load the tape"}
        </p>
      </div>
    </div>
  );
};

export default VhsPlayer;
