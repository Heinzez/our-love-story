import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

type Page = { src: string; caption: string };

// Module-level cache: dedupes Image() prefetches within a session
const photoCache = new Set<string>();
const FLIP_MS = 900;

// Leather panel used for the closed cover and the inner cover pages.
// `variant="closed"` shows the full title on the front of the shut book.
// `variant="inner"` is the softer leather lining you see once the book opens.
type CoverText = { label?: string; line1?: string; line2?: string };

const LeatherCover = ({ variant = "inner", text }: { variant?: "closed" | "inner"; text?: CoverText }) => (
  <div
    className="absolute inset-0 overflow-hidden"
    style={{
      background:
        "radial-gradient(120% 120% at 30% 20%, #4a2410 0%, #2e1608 55%, #1a0a03 100%)",
    }}
  >
    {/* leather grain */}
    <div
      className="absolute inset-0 opacity-[0.35] mix-blend-overlay pointer-events-none"
      style={{
        backgroundImage:
          "radial-gradient(rgba(255,220,170,0.12) 1px, transparent 1px), radial-gradient(rgba(0,0,0,0.35) 1px, transparent 1px)",
        backgroundSize: "3px 3px, 5px 5px",
        backgroundPosition: "0 0, 1px 2px",
      }}
    />
    {/* soft sheen */}
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background:
          "linear-gradient(135deg, rgba(255,220,170,0.10), transparent 40%, transparent 70%, rgba(0,0,0,0.35))",
      }}
    />
    {/* gilded inner border */}
    <div className="absolute inset-3 rounded-[4px] border border-[#c9964a]/60 pointer-events-none" />
    <div className="absolute inset-4 rounded-[3px] border border-[#c9964a]/25 pointer-events-none" />

    {variant === "closed" && (
      <div className="absolute inset-0 grid place-items-center px-[8%] py-[10%] text-center">
        <div className="flex flex-col items-center justify-center gap-[2%] w-full max-w-full">
          <div
            className="font-display uppercase text-[#e7c88a]/70 tracking-[0.5em]"
            style={{ fontSize: "clamp(8px, 1.6cqw + 6px, 13px)" }}
          >
            {text?.label || "— for you —"}
          </div>
          <div
            className="mt-[3%] font-script italic leading-[1.15] text-[#f1d9a6] drop-shadow-[0_2px_0_rgba(0,0,0,0.4)] text-balance"
            style={{ fontSize: "clamp(20px, 8cqw, 52px)" }}
          >
            {text?.line1 || "Memories meant to last,"}
          </div>
          <div
            className="font-script italic leading-[1.15] text-[#e7c88a] drop-shadow-[0_2px_0_rgba(0,0,0,0.4)] text-balance"
            style={{ fontSize: "clamp(17px, 6.4cqw, 42px)" }}
          >
            {text?.line2 || "Beauty & Magnificence."}
          </div>
          <div
            className="mt-[6%] font-display uppercase text-[#c9964a]/70 tracking-[0.4em]"
            style={{ fontSize: "clamp(8px, 1.4cqw + 6px, 12px)" }}
          >
            open →
          </div>
        </div>
      </div>
    )}
  </div>
);

// Chunk photos into "leaves". Each leaf has a front (right-side) and back (left-side of next spread).
// Spread N shows: left = leaves[N-1].back, right = leaves[N].front
function useLeaves(photos: Page[]) {
  // Ensure even count so every leaf has both sides
  const padded = photos.length % 2 === 0 ? photos : [...photos, { src: "", caption: "" }];
  const leaves: { front: Page; back: Page }[] = [];
  for (let i = 0; i < padded.length; i += 2) {
    leaves.push({ front: padded[i], back: padded[i + 1] });
  }
  return leaves;
}

const PageFace = ({ page, side, pageNum, eager }: { page: Page; side: "left" | "right"; pageNum: number; eager?: boolean }) => {
  const [loaded, setLoaded] = useState(false);
  if (!page || !page.src) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#f8f1e6] to-[#efe3d0] text-[#8a6a4a]/40 font-script text-2xl">
        fin.
      </div>
    );
  }
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-[#fbf5ea] to-[#efe1c8] p-4 md:p-6 flex flex-col">
      <div className="flex-1 relative overflow-hidden rounded-md shadow-inner">
        {!loaded && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-[#e8d7b8] via-[#f0e2c8] to-[#e8d7b8]" />
        )}
        <img
          src={page.src}
          alt={page.caption}
          className={`w-full h-full object-cover transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
          draggable={false}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={eager ? "high" : "auto" as any}
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
        />
        <div className="absolute inset-0 pointer-events-none" style={{
          boxShadow: side === "right"
            ? "inset 22px 0 30px -18px rgba(60,30,10,0.35)"
            : "inset -22px 0 30px -18px rgba(60,30,10,0.35)",
        }} />
      </div>
      <div className="mt-3 flex items-end justify-between text-[#5a3a1e]">
        <span className="font-script text-lg md:text-xl italic truncate max-w-[70%]">{page.caption}</span>
        <span className="font-body text-[10px] tracking-[0.2em] uppercase opacity-60">— {pageNum} —</span>
      </div>
    </div>
  );
};

const Photobook = ({ photos, captions, cover }: { photos: string[]; captions: string[]; cover?: CoverText }) => {
  const pages: Page[] = photos.map((src, i) => ({ src, caption: captions[i % captions.length] ?? "" }));
  const leaves = useLeaves(pages);
  // spread index: 0 = cover (right only), 1..leaves.length-1 = middle, leaves.length = back
  const [spread, setSpread] = useState(0);
  const [flipping, setFlipping] = useState<"next" | "prev" | null>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const timer = useRef<number | null>(null);

  const total = leaves.length;
  const canPrev = spread > 0;
  const canNext = spread < total;
  const isClosed = spread === 0;

  // Preload neighbor pages for snappy flips
  useEffect(() => {
    const toPreload: string[] = [];
    for (let d = -3; d <= 3; d++) {
      const s = spread + d;
      if (s < 0 || s > total) continue;
      if (s > 0 && leaves[s - 1]?.back?.src) toPreload.push(leaves[s - 1].back.src);
      if (s < total && leaves[s]?.front?.src) toPreload.push(leaves[s].front.src);
    }
    toPreload.forEach((src) => {
      if (!photoCache.has(src)) {
        const img = new Image();
        img.decoding = "async";
        img.src = src;
        photoCache.add(src);
      }
    });
  }, [spread, total, leaves]);

  // Idle-time full prefetch + <link rel="prefetch"> for browser cache reuse across visits
  useEffect(() => {
    const all = photos.filter(Boolean);
    const run = () => {
      all.forEach((src) => {
        if (photoCache.has(src)) return;
        const img = new Image();
        img.decoding = "async";
        img.src = src;
        photoCache.add(src);
        // Hint the browser cache so future navigations reuse the entry
        try {
          if (!document.head.querySelector(`link[data-pb="${CSS.escape(src)}"]`)) {
            const link = document.createElement("link");
            link.rel = "prefetch";
            link.as = "image";
            link.href = src;
            link.setAttribute("data-pb", src);
            document.head.appendChild(link);
          }
        } catch {}
      });
    };
    const ric: any = (window as any).requestIdleCallback;
    const id = ric ? ric(run, { timeout: 2500 }) : window.setTimeout(run, 900);
    return () => {
      if (ric && (window as any).cancelIdleCallback) (window as any).cancelIdleCallback(id);
      else window.clearTimeout(id as number);
    };
  }, [photos]);

  const go = (dir: "next" | "prev") => {
    if (flipping) return;
    if (dir === "next" && !canNext) return;
    if (dir === "prev" && !canPrev) return;
    setFlipping(dir);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setSpread((s) => s + (dir === "next" ? 1 : -1));
      setFlipping(null);
    }, FLIP_MS);
  };

  // Touch swipe for mobile — smooth, jank-free
  const touch = useRef<{ x: number; y: number; t: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY, t: Date.now() };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touch.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touch.current.x;
    const dy = t.clientY - touch.current.y;
    const dt = Date.now() - touch.current.t;
    touch.current = null;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) || dt > 700) return;
    go(dx < 0 ? "next" : "prev");
  };

  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (lightbox !== null) return;
      if (e.key === "ArrowRight") go("next");
      if (e.key === "ArrowLeft") go("prev");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flipping, spread, lightbox]);

  // Current visible faces
  const leftPage = spread > 0 ? leaves[spread - 1].back : null;
  const rightPage = spread < total ? leaves[spread].front : null;

  // The leaf that visually flips
  const flipLeaf =
    flipping === "next" && spread < total
      ? leaves[spread]
      : flipping === "prev" && spread > 0
      ? leaves[spread - 1]
      : null;

  const openLightbox = () => {
    // Map current right page back to photos index
    const idx = spread * 2; // front of current leaf
    if (idx < photos.length) setLightbox(idx);
  };

  return (
    <div className="w-full">
      <div
        className="relative mx-auto select-none"
        style={{ maxWidth: 920, perspective: "2400px" }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Book base with spine + shadow. Narrows to a single panel when closed. */}
        <div
          className="relative mx-auto rounded-[10px] transition-[max-width] duration-500"
          style={{
            aspectRatio: isClosed ? "8 / 10" : "16 / 10",
            maxWidth: isClosed ? 460 : 920,
            background: "linear-gradient(180deg,#2a1508,#160902)",
            boxShadow:
              "0 40px 80px -30px rgba(0,0,0,0.7), 0 0 0 1px rgba(200,150,80,0.15) inset",
            padding: "14px",
          }}
        >
          <div className="relative w-full h-full" style={{ transformStyle: "preserve-3d" }}>
            {isClosed ? (
              /* Single closed cover panel */
              <div
                className="absolute inset-0 overflow-hidden rounded-[6px] will-change-transform"
                style={{
                  containerType: "inline-size",
                  transformOrigin: "left center",
                  backfaceVisibility: "hidden",
                  animation: flipping === "next" ? `coverOpen ${FLIP_MS}ms cubic-bezier(0.4,0.02,0.2,1) forwards` : undefined,
                }}
              >
                <LeatherCover variant="closed" text={cover} />
              </div>
            ) : (
              <>
            {/* Spine */}
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[3px] z-30 pointer-events-none"
              style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.6), rgba(200,150,80,0.2), rgba(0,0,0,0.6))" }} />

            {/* Left static page */}
            <div className="absolute top-0 bottom-0 left-0 w-1/2 overflow-hidden rounded-l-[6px]"
              style={{ background: "#efe1c8" }}>
              {leftPage ? (
                <PageFace page={leftPage} side="left" pageNum={spread * 2} eager={spread <= 1} />
              ) : (
                <LeatherCover variant="inner" />
              )}
            </div>

            {/* Right static page (underneath the flipping leaf) */}
            <div className="absolute top-0 bottom-0 right-0 w-1/2 overflow-hidden rounded-r-[6px]"
              style={{ background: "#efe1c8" }}>
              {/* When next-flipping, show the NEXT leaf's front underneath */}
              {flipping === "next" && spread + 1 <= total && leaves[spread + 1] ? (
                <PageFace page={leaves[spread + 1].front} side="right" pageNum={(spread + 1) * 2 + 1} />
              ) : flipping === "prev" && spread - 1 >= 0 && leaves[spread - 1] ? (
                // Prev-flipping: the leaf being turned back exposes its own back underneath (same content briefly).
                <PageFace page={leaves[spread - 1].back} side="right" pageNum={(spread - 1) * 2 + 2} />
              ) : rightPage ? (
                <div onClick={openLightbox} className="w-full h-full cursor-zoom-in">
                  <PageFace page={rightPage} side="right" pageNum={spread * 2 + 1} eager={spread <= 1} />
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#3a1c08] to-[#1a0a03] text-[#e7c88a]">
                  <div className="font-display text-2xl">The End</div>
                  <div className="font-script italic opacity-70 mt-1">but never really.</div>
                </div>
              )}
            </div>

            {/* The flipping leaf */}
            {flipLeaf && (
              <div
                className="absolute top-0 bottom-0 w-1/2 z-20 will-change-transform"
                style={{
                  left: flipping === "next" ? "50%" : "0%",
                  transformStyle: "preserve-3d",
                  transformOrigin: flipping === "next" ? "left center" : "right center",
                  animation: flipping === "next"
                    ? `flipNext ${FLIP_MS}ms cubic-bezier(0.6,0.02,0.32,1) forwards`
                    : `flipPrev ${FLIP_MS}ms cubic-bezier(0.6,0.02,0.32,1) forwards`,
                  backfaceVisibility: "hidden",
                }}
              >
                {/* Front face (the currently visible side before flipping) */}
                <div className="absolute inset-0 overflow-hidden" style={{ backfaceVisibility: "hidden", transform: "translateZ(0.01px)" }}>
                  <PageFace
                    page={flipping === "next" ? flipLeaf.front : flipLeaf.back}
                    side={flipping === "next" ? "right" : "left"}
                    pageNum={flipping === "next" ? spread * 2 + 1 : spread * 2}
                  />
                </div>
                {/* Back face (the one revealed as leaf turns) */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                  <PageFace
                    page={flipping === "next" ? flipLeaf.back : flipLeaf.front}
                    side={flipping === "next" ? "left" : "right"}
                    pageNum={flipping === "next" ? spread * 2 + 2 : (spread - 1) * 2 + 1}
                  />
                </div>
                {/* soft moving shadow across the turning page */}
                <div className="absolute inset-0 pointer-events-none" style={{
                  background: flipping === "next"
                    ? "linear-gradient(90deg, rgba(0,0,0,0.35), rgba(0,0,0,0) 60%)"
                    : "linear-gradient(-90deg, rgba(0,0,0,0.35), rgba(0,0,0,0) 60%)",
                  mixBlendMode: "multiply",
                  opacity: 0.6,
                }} />
              </div>
            )}
              </>
            )}
          </div>
        </div>

        {/* Controls */}
        <button
          onClick={() => go("prev")}
          disabled={!canPrev || !!flipping || isClosed}
          aria-label="Previous page"
          className="absolute left-1 md:-left-8 top-1/2 -translate-y-1/2 w-14 h-14 md:w-16 md:h-16 rounded-full bg-black/70 backdrop-blur-md border-2 border-primary/60 text-primary shadow-[0_8px_24px_rgba(0,0,0,0.5)] hover:bg-primary/30 hover:border-primary hover:scale-110 active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-0 disabled:cursor-not-allowed transition-all flex items-center justify-center z-40"
        >
          <ChevronLeft className="w-7 h-7" />
        </button>
        <button
          onClick={() => go("next")}
          disabled={!canNext || !!flipping}
          aria-label={isClosed ? "Open book" : "Next page"}
          className="absolute right-1 md:-right-8 top-1/2 -translate-y-1/2 w-14 h-14 md:w-16 md:h-16 rounded-full bg-black/70 backdrop-blur-md border-2 border-primary/60 text-primary shadow-[0_8px_24px_rgba(0,0,0,0.5)] hover:bg-primary/30 hover:border-primary hover:scale-110 active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center z-40"
        >
          <ChevronRight className="w-7 h-7" />
        </button>
      </div>

      {/* Page counter */}
      <div className="text-center mt-6 text-xs font-body tracking-[0.2em] uppercase text-primary/60">
        {isClosed ? "cover · for you" : spread === total ? "end" : `page ${spread * 2} · ${spread * 2 + 1}`} <span className="opacity-40">/ {total * 2}</span>
      </div>

      {/* Lightbox */}
      {lightbox !== null && photos[lightbox] && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ background: "rgba(5,2,10,0.92)", backdropFilter: "blur(18px)" }}
          onClick={() => setLightbox(null)}
        >
          <button className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white" onClick={() => setLightbox(null)}>
            <X className="w-5 h-5" />
          </button>
          <img src={photos[lightbox]} alt="" className="max-w-[88vw] max-h-[88vh] object-contain rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      <style>{`
        @keyframes flipNext {
          from { transform: rotateY(0deg); }
          to   { transform: rotateY(-180deg); }
        }
        @keyframes flipPrev {
          from { transform: rotateY(0deg); }
          to   { transform: rotateY(180deg); }
        }
        @keyframes coverOpen {
          from { transform: rotateY(0deg); opacity: 1; }
          70%  { transform: rotateY(-118deg); opacity: 1; }
          to   { transform: rotateY(-160deg); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="flipNext"], [style*="flipPrev"], [style*="coverOpen"] { animation-duration: 1ms !important; }
        }
      `}</style>
    </div>
  );
};

export default Photobook;