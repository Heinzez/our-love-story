import { useRef, useState, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Slider } from "@/components/ui/slider";

const AudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(30);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const audio = new Audio("/my-lover.mp3");
    audio.loop = true;
    audio.volume = volume / 100;
    audioRef.current = audio;

    // Attempt autoplay
    const tryPlay = () => {
      audio.play().then(() => setHasStarted(true)).catch(() => {
        // Autoplay blocked — start on first user interaction
        const handler = () => {
          audio.play().then(() => setHasStarted(true));
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
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  const toggleMute = () => setIsMuted((m) => !m);

  return (
    <div
      className="fixed bottom-6 right-6 z-[90] flex items-center gap-3"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {isExpanded && (
        <div className="glass-card rounded-full px-4 py-2 flex items-center gap-3 animate-fade-in-up w-36">
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
      )}
      <button
        onClick={toggleMute}
        className="w-11 h-11 rounded-full glass-card flex items-center justify-center text-primary hover:text-accent transition-colors shadow-lg"
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      </button>
    </div>
  );
};

export default AudioPlayer;
