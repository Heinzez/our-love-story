import photo1 from "@/assets/photo1.jpg";
import photo2 from "@/assets/photo2.jpg";
import photo3 from "@/assets/photo3.jpg";
import photo4 from "@/assets/photo4.jpg";
import photo5 from "@/assets/photo5.jpg";
import photo6 from "@/assets/photo6.jpg";
import photo7 from "@/assets/photo7.jpg";
import photo8 from "@/assets/photo8.jpg";
import photo9 from "@/assets/photo9.jpg";
import photo10 from "@/assets/photo10.jpg";
import photo11 from "@/assets/photo11.jpg";
import photo12 from "@/assets/photo12.jpg";
import photo13 from "@/assets/photo13.jpg";
import photo14 from "@/assets/photo14.jpg";
import photo15 from "@/assets/photo15.jpg";
import photo16 from "@/assets/photo16.jpg";
import photo17 from "@/assets/photo17.jpg";
import photo18 from "@/assets/photo18.jpg";
import photoNew1 from "@/assets/photo19.jpg";
import photoNew2 from "@/assets/photo20.jpg";
import photoNew3 from "@/assets/photo21.jpg";
import photo22 from "@/assets/photo22.jpg";
import photo23 from "@/assets/photo23.jpg";
import photo24 from "@/assets/photo24.jpg";
import photo25 from "@/assets/photo25.jpg";
import photo26 from "@/assets/photo26.jpg";
import photo27 from "@/assets/photo27.jpg";
import photo28 from "@/assets/photo28.jpg";
import photo29 from "@/assets/photo29.jpg";
import photo30 from "@/assets/photo30.jpg";
import photo31 from "@/assets/photo31.jpg";
import photo32 from "@/assets/photo32.jpg";
import photo33 from "@/assets/photo33.jpg";
import photo34 from "@/assets/photo34.jpg";
import photo35 from "@/assets/photo35.jpg";
import photo36 from "@/assets/photo36.jpg";
import photo37 from "@/assets/photo37.jpg";
import FloatingElements from "@/components/FloatingElements";
import { Heart, Lock, Mail, Sparkles, X, ChevronLeft, ChevronRight, Plus, ImagePlus, Loader2, Trash2, Video, Film } from "lucide-react";
import { useSite } from "@/context/SiteContext";
import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

const STATIC_PHOTOS = [
  photo1, photo2, photo3, photo4, photo5, photo6, photo7,
  photo8, photo9, photo10, photo11, photo12, photo13, photo14,
  photo15, photo16, photo17, photo18, photoNew1, photoNew2, photoNew3,
  photo22, photo23, photo24, photo25, photo26, photo27, photo28,
  photo29, photo30, photo31, photo32, photo33, photo34, photo35,
  photo36, photo37,
];

const captions = [
  "always ❤", "my fav", "forever", "us ✨", "together",
  "golden", "pure joy", "queen ❤", "adored", "magic",
  "my heart", "bliss", "yours", "stars ✨", "endless",
  "just us", "always", "love ❤", "so real", "breathless", "my world",
  "stunning", "glowing", "radiant", "beautiful", "my queen",
  "divine", "ethereal", "unreal", "soft hours", "serene",
  "luminous", "cherished", "grace", "timeless", "enchanting", "perfect",
];

const specialDates = [
  { date: "November 2023", title: "Where It All Began", description: "The moment everything changed forever.", unlocked: true },
  { date: "February 2024", title: "A Day To Remember", description: "Coming soon...", unlocked: false },
  { date: "May 2024", title: "Growing Together", description: "Coming soon...", unlocked: false },
  { date: "August 2024", title: "Summer of Us", description: "Coming soon...", unlocked: false },
  { date: "December 2024", title: "End of Year Magic", description: "Coming soon...", unlocked: false },
];

const NUM_GROUPS = 6;

function buildGroups(allPhotos: string[]) {
  const GROUPS: string[][] = Array.from({ length: NUM_GROUPS }, () => []);
  allPhotos.forEach((photo, i) => GROUPS[i % NUM_GROUPS].push(photo));
  const startIndices = GROUPS.reduce<number[]>((acc, _, i) => {
    if (i === 0) return [0];
    acc.push(acc[i - 1] + GROUPS[i - 1].length);
    return acc;
  }, []);
  return { GROUPS, startIndices };
}

// ── Lightbox ──────────────────────────────────────────────
const Lightbox = ({ index, total, src, caption, onClose, onPrev, onNext }: {
  index: number; total: number; src: string; caption: string;
  onClose: () => void; onPrev: () => void; onNext: () => void;
}) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: "rgba(5,2,10,0.92)", backdropFilter: "blur(20px)" }}
      onClick={onClose}
    >
      <button
        className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
        onClick={onClose}
      >
        <X className="w-5 h-5" />
      </button>
      <button
        className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-primary/40 flex items-center justify-center text-white transition-colors z-10"
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <div className="relative max-w-[88vw] max-h-[88vh]" onClick={(e) => e.stopPropagation()}>
        <div className="polaroid" style={{ padding: "12px 12px 48px", maxWidth: "min(500px, 88vw)" }}>
          <img src={src} alt="" className="w-full object-contain rounded-sm" style={{ maxHeight: "70vh" }} />
          <span className="polaroid-caption text-sm">{caption}</span>
        </div>
        <div className="absolute -bottom-8 left-0 right-0 text-center text-white/40 text-xs font-body">
          {index + 1} / {total}
        </div>
      </div>
      <button
        className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-primary/40 flex items-center justify-center text-white transition-colors z-10"
        onClick={(e) => { e.stopPropagation(); onNext(); }}
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
};

// ── Photo Group ──────────────────────────────────────────────
const CARD_W = 138;
const CARD_H = 195;
const FAN_RADIUS = 190;

const PhotoGroup = ({
  groupPhotos, groupIndex, startIndex, onOpen,
}: {
  groupPhotos: string[]; groupIndex: number; startIndex: number; onOpen: (i: number) => void;
}) => {
  const [active, setActive] = useState(false);
  const fanPhotos = groupPhotos.slice(0, 4);
  const count = fanPhotos.length;
  const extra = groupPhotos.length - 4;

  const open = () => setActive(true);
  const close = () => setActive(false);

  const handleContainerClick = (e: React.MouseEvent) => {
    if (!active) { e.stopPropagation(); open(); }
  };
  const handleContainerTouch = (e: React.TouchEvent) => {
    if (!active) { e.preventDefault(); open(); }
  };

  return (
    <div
      className="relative flex justify-center select-none"
      style={{ width: "100%", height: CARD_H + 28, perspective: "1000px", perspectiveOrigin: "50% 80%", overflow: "visible" }}
      onMouseEnter={open}
      onMouseLeave={close}
      onClick={handleContainerClick}
      onTouchStart={handleContainerTouch}
    >
      {fanPhotos.map((photo, i) => {
        const norm = count <= 1 ? 0 : i / (count - 1) - 0.5;
        const stackRotZ = norm * 20;
        const stackTransX = norm * 12;
        const stackTransZ = i * 3;
        const fanAngleDeg = norm * 84;
        const fanAngleRad = (fanAngleDeg * Math.PI) / 180;
        const fanTransX = Math.sin(fanAngleRad) * FAN_RADIUS;
        const fanTransZ = (1 - Math.cos(fanAngleRad)) * FAN_RADIUS + 80;

        return (
          <div
            key={i}
            className="absolute cursor-pointer"
            style={{
              width: CARD_W, height: CARD_H,
              left: "50%", top: 0,
              marginLeft: -(CARD_W / 2),
              zIndex: active ? i + 1 : count - i,
              transform: active
                ? `rotateY(${fanAngleDeg}deg) translateX(${fanTransX}px) translateZ(${fanTransZ}px)`
                : `rotateZ(${stackRotZ}deg) translateX(${stackTransX}px) translateZ(${stackTransZ}px)`,
              transition: `transform 0.52s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.04}s`,
            }}
            onClick={(e) => { if (active) { e.stopPropagation(); onOpen(startIndex + i); } }}
          >
            <div className="polaroid w-full h-full" style={{ padding: "8px 8px 30px" }}>
              <div className="w-full overflow-hidden rounded-sm" style={{ height: "calc(100% - 30px)" }}>
                <img
                  src={photo}
                  alt={`Memory ${startIndex + i + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  draggable={false}
                />
              </div>
              <span className="polaroid-caption text-[11px]">{captions[(startIndex + i) % captions.length]}</span>
            </div>
          </div>
        );
      })}
      {!active && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground/40 font-body tracking-widest uppercase whitespace-nowrap pointer-events-none">
          {extra > 0 ? `tap · ${groupPhotos.length} photos` : "tap to reveal"}
        </div>
      )}
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] text-muted-foreground/20 font-body pointer-events-none">
        {groupIndex + 1}
      </div>
    </div>
  );
};

// ── Media Upload Button (image OR video) ──────────────────────
const MediaUploadButton = ({ kind, onUploaded }: { kind: "image" | "video"; onUploaded: () => void }) => {
  const { adminToken, isAdmin } = useSite();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ name: string; pct: number; status: "pending" | "done" | "error"; file?: File }[]>([]);

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result || "").split(",")[1] || "");
      r.onerror = reject;
      r.readAsDataURL(file);
    });

  const validate = (file: File): string | null => {
    if (kind === "image") {
      if (!file.type.startsWith("image/")) return "Only image files are allowed";
      if (file.size > 6 * 1024 * 1024) return "Max 6MB per image";
    } else {
      if (!file.type.startsWith("video/")) return "Only video files are allowed";
      if (file.size > 40 * 1024 * 1024) return "Max 40MB per video";
    }
    return null;
  };

  const uploadOne = async (file: File, idx: number) => {
    setProgress((p) => p.map((it, i) => i === idx ? { ...it, status: "pending", pct: 10 } : it));
    const v = validate(file);
    if (v) throw new Error(v);
    const base64 = await fileToBase64(file);
    setProgress((p) => p.map((it, i) => i === idx ? { ...it, pct: 60 } : it));
    const { data, error } = await supabase.functions.invoke("admin-mutate", {
      body: {
        action: "upload-image",
        pageKey: "landing",
        fileName: file.name,
        fileBase64: base64,
        mediaType: kind,
        uploadedBy: isAdmin ? "admin" : "her",
      },
      headers: adminToken ? { "x-admin-token": adminToken } : undefined,
    });
    if (error) throw new Error(error.message);
    if (data?.error) throw new Error(data.error);
    setProgress((p) => p.map((it, i) => i === idx ? { ...it, pct: 100, status: "done" } : it));
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);
    const arr = Array.from(files);
    setProgress(arr.map((f) => ({ name: f.name, pct: 0, status: "pending" as const, file: f })));
    setUploading(true);
    for (let i = 0; i < arr.length; i++) {
      try {
        await uploadOne(arr[i], i);
      } catch (e) {
        console.error(e);
        setProgress((p) => p.map((it, idx) => idx === i ? { ...it, status: "error", pct: 0 } : it));
      }
    }
    setUploading(false);
    onUploaded();
    // clear progress after a beat
    setTimeout(() => setProgress((p) => p.filter((it) => it.status === "error")), 2500);
  };

  const retry = async (idx: number) => {
    const f = progress[idx]?.file;
    if (!f) return;
    try {
      await uploadOne(f, idx);
      onUploaded();
    } catch (e) {
      setProgress((p) => p.map((it, i) => i === idx ? { ...it, status: "error", pct: 0 } : it));
    }
  };

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept={kind === "image" ? "image/*" : "video/*"}
        multiple
        className="hidden"
        data-testid="input-photo-upload"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div
        className="relative flex justify-center select-none"
        style={{ width: "100%", minHeight: CARD_H + 28 }}
      >
        <button
          data-testid="button-photo-add"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/60 text-primary/60 hover:text-primary transition-all duration-300 active:scale-95 disabled:opacity-50"
          style={{ width: CARD_W, height: CARD_H }}
        >
          {uploading
            ? <Loader2 className="w-7 h-7 animate-spin" />
            : <>
                <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
                  {kind === "image" ? <Plus className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                </div>
                <span className="text-[11px] font-body tracking-wider text-center leading-tight px-2">
                  {kind === "image" ? "Add photos (multiple ok)" : "Add videos"}
                </span>
              </>
          }
        </button>
      </div>
      {progress.length > 0 && (
        <div className="w-full max-w-md mx-auto mt-4 space-y-1.5">
          {progress.map((it, i) => (
            <div key={i} className="text-[11px] font-body">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <span className="truncate flex-1 text-muted-foreground">{it.name}</span>
                {it.status === "error" ? (
                  <button onClick={() => retry(i)} className="text-primary underline">Retry</button>
                ) : (
                  <span className="text-muted-foreground/60">{it.pct}%</span>
                )}
              </div>
              <div className="h-1 rounded-full bg-muted/40 overflow-hidden">
                <div className={`h-full transition-all ${it.status === "error" ? "bg-red-500/70" : "bg-primary"}`} style={{ width: `${it.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
      {error && <p className="text-red-400/80 text-xs mt-2 text-center">{error}</p>}
    </>
  );
};

// ── Main Page ──────────────────────────────────────────────
const LandingPage = () => {
  const { subscribedEmail, setSubscribedEmail, pageImages, refreshPageData } = useSite();
  const [emailInput, setEmailInput] = useState("");
  const [backupEmail, setBackupEmail] = useState("");
  const [showBackup, setShowBackup] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const allLandingMedia = pageImages["landing"] ?? [];
  const uploadedPhotos = allLandingMedia.filter((m) => (m.media_type ?? "image") === "image");
  const uploadedVideos = allLandingMedia.filter((m) => m.media_type === "video");
  const herPhotoCount = uploadedPhotos.filter((m) => m.uploaded_by === "her").length;

  // Combine: admin-uploaded (newest first) + static photos
  const allPhotos = [
    ...uploadedPhotos.map((p) => p.publicUrl),
    ...STATIC_PHOTOS,
  ];

  const { GROUPS, startIndices } = buildGroups(allPhotos);

  const openLightbox = useCallback((i: number) => setLightboxIdx(i), []);
  const closeLightbox = useCallback(() => setLightboxIdx(null), []);
  const prevPhoto = useCallback(() =>
    setLightboxIdx((i) => (i === null ? null : (i - 1 + allPhotos.length) % allPhotos.length)), [allPhotos.length]);
  const nextPhoto = useCallback(() =>
    setLightboxIdx((i) => (i === null ? null : (i + 1) % allPhotos.length)), [allPhotos.length]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showBackup && emailInput.trim()) { setShowBackup(true); return; }
    if (emailInput.trim() && backupEmail.trim()) {
      setSubscribedEmail(emailInput.trim(), backupEmail.trim());
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-24 relative" style={{ overflowX: "hidden" }}>
      <FloatingElements />

      {/* ── Animated Background ── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-100" />
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
        <div className="blob blob-4" />
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse 70% 60% at 50% 50%, transparent 40%, hsl(340 18% 5% / 0.7) 100%)"
        }} />
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <Lightbox
          index={lightboxIdx}
          total={allPhotos.length}
          src={allPhotos[lightboxIdx]}
          caption={captions[lightboxIdx % captions.length]}
          onClose={closeLightbox}
          onPrev={prevPhoto}
          onNext={nextPhoto}
        />
      )}

      {/* ── Hero ── */}
      <section className="relative z-10 px-4 pt-14 pb-20 text-center">
        <div className="animate-fade-in-up max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/8 text-primary text-xs font-body tracking-widest uppercase mb-8 backdrop-blur-sm">
            <Sparkles className="w-3 h-3" />
            <span>made just for you</span>
            <Sparkles className="w-3 h-3" />
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display gradient-text mb-5 leading-[1.1] tracking-tight">
            The Prettiest<br />Queen Alive
          </h1>

          <Heart className="w-8 h-8 text-primary mx-auto my-4 animate-heartbeat opacity-80" />

          <p className="font-script text-2xl md:text-3xl text-accent/90 max-w-xl mx-auto mb-5 leading-relaxed">
            A love letter written in pixels and light
          </p>
          <p className="text-muted-foreground font-body max-w-md mx-auto leading-relaxed text-sm md:text-base">
            Every photo holds a thousand words I never said, every page a chapter of us.
            This is your world — built for you, because you deserve more than the ordinary.
          </p>
        </div>
      </section>

      {/* Divider */}
      <div className="relative z-10 flex items-center gap-4 max-w-xs mx-auto px-4 mb-20">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent to-primary/40" />
        <Heart className="w-4 h-4 text-primary/60 fill-primary/20" />
        <div className="flex-1 h-px bg-gradient-to-l from-transparent to-primary/40" />
      </div>

      {/* ── 3D Gallery ── */}
      <section className="relative z-10 max-w-3xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display gradient-text mb-2">Our Memories</h2>
          <p className="text-muted-foreground text-sm font-body">hover each stack · click to open</p>
          {herPhotoCount > 0 && (
            <p className="text-primary/50 text-xs font-body mt-1">
              {herPhotoCount} photo{herPhotoCount !== 1 ? "s" : ""} added by you ✨
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-20">
          {GROUPS.map((groupPhotos, groupIdx) => (
            <PhotoGroup
              key={groupIdx}
              groupPhotos={groupPhotos}
              groupIndex={groupIdx}
              startIndex={startIndices[groupIdx]}
              onOpen={openLightbox}
            />
          ))}
        </div>

        {/* Add Photos row */}
        <div className="mt-20 pt-6 border-t border-border/20">
          <div className="flex items-center gap-3 mb-10 justify-center">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary/30" />
            <div className="flex items-center gap-2 text-primary/50">
              <ImagePlus className="w-4 h-4" />
              <span className="text-xs font-body tracking-widest uppercase">Add your own</span>
            </div>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary/30" />
          </div>
          <div className="flex justify-center">
            <MediaUploadButton kind="image" onUploaded={() => refreshPageData()} />
          </div>
        </div>
      </section>

      {/* ── Video Memories ── */}
      <section className="relative z-10 max-w-3xl mx-auto px-4 mt-32">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/8 text-primary text-[10px] font-body tracking-widest uppercase mb-3">
            <Film className="w-3 h-3" /> Moving Memories
          </div>
          <h2 className="text-3xl md:text-4xl font-display gradient-text mb-2">Video Memories</h2>
          <p className="text-muted-foreground text-sm font-body">your voice, your laugh, your magic ✨</p>
        </div>

        {uploadedVideos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
            {uploadedVideos.map((v) => (
              <div key={v.id} className="glass-card rounded-2xl overflow-hidden border border-primary/20 hover:border-primary/40 transition-all">
                <video
                  src={v.publicUrl}
                  controls
                  preload="metadata"
                  className="w-full bg-black aspect-video"
                />
                {v.caption && (
                  <p className="text-xs text-muted-foreground font-body p-3 text-center italic">"{v.caption}"</p>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-center">
          <MediaUploadButton kind="video" onUploaded={() => refreshPageData()} />
        </div>
      </section>

      {/* ── Special Dates ── */}
      <section className="relative z-10 max-w-2xl mx-auto px-4 mt-32">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-display gradient-text mb-2">Special Dates</h2>
          <p className="text-muted-foreground text-sm font-body">chapters of our story, one by one</p>
        </div>

        <div className="relative">
          <div className="absolute left-[22px] top-4 bottom-4 w-px bg-gradient-to-b from-primary/60 via-primary/20 to-transparent" />
          <div className="space-y-6">
            {specialDates.map((item, i) => (
              <div key={i} className="relative pl-14 animate-fade-in-up" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className={`absolute left-[14px] top-5 w-[17px] h-[17px] rounded-full border-2 transition-all ${
                  item.unlocked
                    ? "bg-primary border-primary shadow-[0_0_14px_hsl(338_80%_62%_/_0.55)]"
                    : "bg-muted border-border/70"
                }`} />
                <div className={`glass-card rounded-2xl p-5 transition-all duration-300 hover:border-primary/30 ${
                  item.unlocked ? "border-primary/20 hover:shadow-[0_8px_32px_hsl(338_80%_62%_/_0.12)]" : "opacity-65"
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-body tracking-[0.15em] uppercase text-primary/80 font-medium">{item.date}</span>
                    {!item.unlocked && <Lock className="w-3.5 h-3.5 text-muted-foreground/60" />}
                  </div>
                  <h3 className="font-display text-lg text-foreground mb-1">
                    {item.unlocked ? item.title : "🔒 Locked"}
                  </h3>
                  {item.unlocked ? (
                    <p className="text-muted-foreground font-body text-sm leading-relaxed">{item.description}</p>
                  ) : (
                    <div className="mt-3">
                      {subscribedEmail || submitted ? (
                        <p className="text-sm text-primary/70 flex items-center gap-2 font-body">
                          <Mail className="w-3.5 h-3.5" />You'll be notified when this unlocks
                        </p>
                      ) : (
                        <form onSubmit={handleEmailSubmit} className="space-y-2">
                          <input
                            type="email" value={emailInput} onChange={(e) => setEmailInput(e.target.value)}
                            placeholder="Your email for notification..." required
                            className="w-full px-3.5 py-2 rounded-xl bg-muted/60 border border-border/60 text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-body"
                          />
                          {showBackup && (
                            <input
                              type="email" value={backupEmail} onChange={(e) => setBackupEmail(e.target.value)}
                              placeholder="Backup email for a surprise 💕" required
                              className="w-full px-3.5 py-2 rounded-xl bg-muted/60 border border-border/60 text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-body animate-fade-in-up"
                            />
                          )}
                          <button type="submit" className="w-full py-2 rounded-xl bg-gradient-to-r from-primary to-accent/80 text-white text-sm font-body font-medium tracking-wide hover:opacity-90 hover:shadow-md hover:shadow-primary/30 transition-all duration-200">
                            {showBackup ? "Submit ✨" : "Notify Me"}
                          </button>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quote ── */}
      <section className="relative z-10 mt-24 px-4">
        <div className="max-w-xl mx-auto animate-fade-in-up" style={{ animationDelay: "1s" }}>
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-card/80 to-accent/10 backdrop-blur-2xl border border-primary/15 rounded-3xl" />
            <div className="relative z-10 px-8 py-10 md:px-12 md:py-12 text-center">
              <div className="text-6xl leading-none text-primary/20 font-display mb-2 select-none">"</div>
              <p className="font-script text-xl md:text-2xl text-foreground/90 leading-relaxed mb-2">
                You are the poem I never knew how to write,
              </p>
              <p className="font-script text-xl md:text-2xl text-foreground/90 leading-relaxed">
                and the story I'll never stop telling.
              </p>
              <div className="text-6xl leading-none text-primary/20 font-display mt-2 select-none rotate-180 inline-block">"</div>
              <div className="mt-6 flex items-center justify-center gap-3">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary/50" />
                <span className="text-primary/70 font-body text-xs tracking-[0.2em] uppercase">Mr.Mwendwa — always yours</span>
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary/50" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
