import { useRef, useState, useEffect } from "react";
import { Volume2, VolumeX, Play, Pause, Plus, Music } from "lucide-react";
import { Slider } from "@/components/ui/slider";

const DEFAULT_TRACK = { name: "My Lover", src: "/my-lover.mp3" };

const AudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(30);
  const [isExpanded, setIsExpanded] = useState(false);
  const [track, setTrack] = useState<{ name: string; src: string }>(() => {
    try {
      const raw = localStorage.getItem("queen-track");
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return DEFAULT_TRACK;
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const duckTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDuckedRef = useRef(false);

  useEffect(() => {
    const audio = new Audio(track.src);
    audio.loop = true;
    audio.volume = volume / 100;
    audioRef.current = audio;

    audio.addEventListener("play", () => setIsPlaying(true));
    audio.addEventListener("pause", () => setIsPlaying(false));

    const tryPlay = () => {
      audio.play().catch(() => {
        const handler = () => {
          audio.play();
          document.removeEventListener("click", handler);
        };
        document.addEventListener("click", handler);
      });
    };
    tryPlay();

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [track.src]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  // Listen for chat-chime event to duck music temporarily
  useEffect(() => {
    const handleDuck = () => {
      const audio = audioRef.current;
      if (!audio || isMuted || !isPlaying) return;

      // Cancel any pending restore
      if (duckTimerRef.current) clearTimeout(duckTimerRef.current);

      if (!isDuckedRef.current) {
        isDuckedRef.current = true;
        audio.volume = Math.max(0, (volume / 100) * 0.1); // duck to 10%
      }

      // Restore after chime finishes (~2.5s)
      duckTimerRef.current = setTimeout(() => {
        if (audio && !isMuted) {
          audio.volume = volume / 100;
        }
        isDuckedRef.current = false;
      }, 2500);
    };

    window.addEventListener("chat-chime", handleDuck);
    return () => window.removeEventListener("chat-chime", handleDuck);
  }, [volume, isMuted, isPlaying]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
  };

  const toggleMute = () => setIsMuted((m) => !m);

  const handleTrackUpload = (file: File) => {
    if (!file.type.startsWith("audio/")) return;
    if (file.size > 15 * 1024 * 1024) {
      alert("Track too large — keep it under 15MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      const next = { name: file.name.replace(/\.[^.]+$/, ""), src: dataUrl };
      setTrack(next);
      try { localStorage.setItem("queen-track", JSON.stringify(next)); } catch (_) {}
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      className="fixed bottom-4 right-4 z-[90] flex items-center gap-2 sm:bottom-6 sm:right-6 sm:gap-3"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {isExpanded && (
        <div className="glass-card rounded-2xl px-3 py-2 flex items-center gap-2 animate-fade-in-up sm:px-4 sm:gap-3">
          <Music className="w-3.5 h-3.5 text-primary/80 shrink-0" />
          <span className="text-[11px] font-body text-foreground/80 truncate max-w-[110px] sm:max-w-[140px]">
            {track.name}
          </span>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-6 h-6 rounded-full flex items-center justify-center text-primary hover:bg-primary/10 shrink-0"
            aria-label="Add new track"
            title="Upload a new track"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleTrackUpload(f); e.target.value = ""; }}
          />
          <div className="w-20 sm:w-28">
          <Slider
            value={[isMuted ? 0 : volume]}
            onValueChange={([v]) => {
              setVolume(v);
              setIsMuted(v === 0);
            }}
            max={100}
            step={1}
            className="flex-1"
          />
          </div>
        </div>
      )}
      <button
        onClick={togglePlay}
        className="w-10 h-10 sm:w-11 sm:h-11 rounded-full glass-card flex items-center justify-center text-primary hover:text-accent transition-colors shadow-lg"
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? <Pause className="w-4 h-4 sm:w-5 sm:h-5" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5" />}
      </button>
      <button
        onClick={toggleMute}
        className="w-10 h-10 sm:w-11 sm:h-11 rounded-full glass-card flex items-center justify-center text-primary hover:text-accent transition-colors shadow-lg"
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
      </button>
    </div>
  );
};

export default AudioPlayer;
