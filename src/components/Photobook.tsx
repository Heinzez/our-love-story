import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, BookOpen, X } from "lucide-react";

type Page = { src: string; caption: string };

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

const Photobook = ({ photos, captions }: { photos: string[]; captions: string[] }) => {
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

  // Preload neighbor pages for snappy flips
  useEffect(() => {
    const toPreload: string[] = [];
    for (let d = -2; d <= 2; d++) {
      const s = spread + d;
      if (s < 0 || s > total) continue;
      if (s > 0 && leaves[s - 1]?.back?.src) toPreload.push(leaves[s - 1].back.src);
      if (s < total && leaves[s]?.front?.src) toPreload.push(leaves[s].front.src);
    }
    toPreload.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [spread, total, leaves]);

  const go = (dir: "next" | "prev") => {
    if (flipping) return;
    if (dir === "next" && !canNext) return;
    if (dir === "prev" && !canPrev) return;
    setFlipping(dir);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setSpread((s) => s + (dir === "next" ? 1 : -1));
      setFlipping(null);
    }, 780);
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
      <div className="relative mx-auto" style={{ maxWidth: 920, perspective: "2200px" }}>
        {/* Book base with spine + shadow */}
        <div
          className="relative mx-auto rounded-[10px]"
          style={{
            aspectRatio: "16 / 10",
            background: "linear-gradient(180deg,#2a1508,#160902)",
            boxShadow: "0 40px 80px -30px rgba(0,0,0,0.7), 0 0 0 1px rgba(200,150,80,0.15) inset",
            padding: "14px",
          }}
        >
          <div className="relative w-full h-full" style={{ transformStyle: "preserve-3d" }}>
            {/* Spine */}
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[3px] z-30 pointer-events-none"
              style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.6), rgba(200,150,80,0.2), rgba(0,0,0,0.6))" }} />

            {/* Left static page */}
            <div className="absolute top-0 bottom-0 left-0 w-1/2 overflow-hidden rounded-l-[6px]"
              style={{ background: "#efe1c8" }}>
              {leftPage ? (
                <PageFace page={leftPage} side="left" pageNum={spread * 2} eager={spread <= 1} />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#3a1c08] to-[#1a0a03] text-[#e7c88a]">
                  <BookOpen className="w-10 h-10 opacity-80" />
                  <div className="font-display text-2xl md:text-3xl">Our Photobook</div>
                  <div className="font-script italic text-lg opacity-80">turn the page →</div>
                </div>
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
                className="absolute top-0 bottom-0 w-1/2 z-20"
                style={{
                  left: flipping === "next" ? "50%" : "0%",
                  transformStyle: "preserve-3d",
                  transformOrigin: flipping === "next" ? "left center" : "right center",
                  transform: flipping === "next" ? "rotateY(-180deg)" : "rotateY(180deg)",
                  transition: "transform 0.78s cubic-bezier(0.55, 0.05, 0.35, 1)",
                  animation: flipping === "next" ? "flipNext 0.78s forwards" : "flipPrev 0.78s forwards",
                }}
              >
                {/* Front face (the currently visible side before flipping) */}
                <div className="absolute inset-0 overflow-hidden" style={{ backfaceVisibility: "hidden" }}>
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
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <button
          onClick={() => go("prev")}
          disabled={!canPrev || !!flipping}
          aria-label="Previous page"
          className="absolute left-2 md:-left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 backdrop-blur-md border border-primary/50 text-primary shadow-[0_8px_24px_rgba(0,0,0,0.5)] hover:bg-primary/30 hover:scale-110 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center z-40"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={() => go("next")}
          disabled={!canNext || !!flipping}
          aria-label="Next page"
          className="absolute right-2 md:-right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 backdrop-blur-md border border-primary/50 text-primary shadow-[0_8px_24px_rgba(0,0,0,0.5)] hover:bg-primary/30 hover:scale-110 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center z-40"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Page counter */}
      <div className="text-center mt-6 text-xs font-body tracking-[0.2em] uppercase text-primary/60">
        {spread === 0 ? "cover" : spread === total ? "end" : `page ${spread * 2} · ${spread * 2 + 1}`} <span className="opacity-40">/ {total * 2}</span>
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
      `}</style>
    </div>
  );
};

export default Photobook;