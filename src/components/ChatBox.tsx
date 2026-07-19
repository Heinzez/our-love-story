import { useState, useEffect, useRef, useCallback } from "react";
import { MessageCircleHeart, Send, ChevronDown, Heart, Loader2, ShieldCheck, Paperclip, Mic, Image as ImageIcon, Film, Square, Smile, SmilePlus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSite } from "@/context/SiteContext";
import { supabase } from "@/integrations/supabase/client";

type ChatMessage = {
  id: string;
  text: string;
  sender: "her" | "me";
  status: "sent" | "delivered" | "seen";
  date: string;
  isAi: boolean;
  createdAt: string;
  mediaUrl?: string | null;
  mediaType?: string | null;
  reactions?: Record<string, string[]>;
};

// ── Status display ────────────────────────────────────────────
const STATUS_ICONS: Record<string, string> = {
  sent: "✓",
  delivered: "✓✓",
  seen: "✓✓",
};

const REACTION_EMOJIS = ["❤️", "😂", "🥺", "🔥", "🌹", "😍", "👀", "🙌"];
const EMOJI_PANEL = ["❤️","😂","🥺","🔥","🌹","😍","👀","🙌","💍","✨","💕","💌","🤍","😘","🥰","😌","🙈","💫","🌙","☕","🍷","🌸","💖","🫶"];

function groupByDay(messages: ChatMessage[]) {
  const groups: Record<string, ChatMessage[]> = {};
  for (const m of messages) {
    if (!groups[m.date]) groups[m.date] = [];
    groups[m.date].push(m);
  }
  return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (dateStr === today.toISOString().slice(0, 10)) return "Today";
  if (dateStr === yesterday.toISOString().slice(0, 10)) return "Yesterday";
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

function formatTime(ts: string) {
  return new Date(ts).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

// ── Soft chime via Web Audio API ─────────────────────────────
function playChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Dispatch event so AudioPlayer can duck volume
    window.dispatchEvent(new CustomEvent("chat-chime"));

    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      const start = ctx.currentTime + i * 0.18;
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.22, start + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.7);
      osc.start(start);
      osc.stop(start + 0.7);
    });

    setTimeout(() => { try { ctx.close(); } catch (_) {} }, 2500);
  } catch (_) {
    // Audio not available — ignore
  }
}

export default function ChatBox() {
  const { isAdmin, adminToken } = useSite();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [unread, setUnread] = useState(0);
  const [pollMs, setPollMs] = useState(4000);
  const [attachOpen, setAttachOpen] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [reactingFor, setReactingFor] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [sendingMedia, setSendingMedia] = useState(false);
  const mediaRecRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const imgInputRef = useRef<HTMLInputElement>(null);
  const vidInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevMsgCount = useRef(0);
  const prevMsgIds = useRef<Set<string>>(new Set());
  const qc = useQueryClient();

  const { data: messages = [], isLoading } = useQuery<ChatMessage[]>({
    queryKey: ["chat-messages"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("chat", { body: { action: "list" } });
      if (error) throw new Error(error.message);
      return (data as ChatMessage[]) || [];
    },
    refetchInterval: open ? pollMs : Math.max(pollMs, 10000),
  });

  const sendMutation = useMutation({
    mutationFn: async (text: string) => {
      const { data, error } = await supabase.functions.invoke("chat", {
        body: { action: isAdmin ? "reply" : "send", text },
        headers: isAdmin && adminToken ? { "x-admin-token": adminToken } : undefined,
      });
      if (error) throw new Error(error.message);
      if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
      return data;
    },
    onSuccess: () => { setPollMs(4000); qc.invalidateQueries({ queryKey: ["chat-messages"] }); },
    onError: (e: Error) => {
      // Back off on rate limit
      if (/slow down/i.test(e.message) || /429/.test(e.message)) setPollMs((p) => Math.min(p * 2, 30000));
    },
  });

  const reactMutation = useMutation({
    mutationFn: async ({ messageId, emoji }: { messageId: string; emoji: string }) => {
      const { data, error } = await supabase.functions.invoke("chat", {
        body: { action: "react", messageId, emoji, who: isAdmin ? "me" : "her" },
      });
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["chat-messages"] }); setReactingFor(null); },
  });

  const fileToBase64 = (file: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result || "").split(",")[1] || "");
      r.onerror = reject;
      r.readAsDataURL(file);
    });

  const sendMedia = async (file: Blob, kind: "image" | "video" | "audio", fileName: string) => {
    setSendingMedia(true);
    try {
      // size caps
      const cap = kind === "video" ? 40 * 1024 * 1024 : kind === "audio" ? 10 * 1024 * 1024 : 6 * 1024 * 1024;
      if (file.size > cap) throw new Error(`File too large. Max ${cap / 1024 / 1024}MB.`);
      const fileBase64 = await fileToBase64(file);
      const { data, error } = await supabase.functions.invoke("chat", {
        body: {
          action: "send-media",
          fileBase64, fileName, kind,
          sender: isAdmin ? "me" : "her",
        },
        headers: isAdmin && adminToken ? { "x-admin-token": adminToken } : undefined,
      });
      if (error) throw new Error(error.message);
      if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
      qc.invalidateQueries({ queryKey: ["chat-messages"] });
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setSendingMedia(false);
      setAttachOpen(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      audioChunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mr.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((t) => t.stop());
        await sendMedia(blob, "audio", `voice-${Date.now()}.webm`);
      };
      mr.start();
      mediaRecRef.current = mr;
      setRecording(true);
    } catch (e) {
      alert("Microphone access denied.");
    }
  };

  const stopRecording = () => {
    mediaRecRef.current?.stop();
    mediaRecRef.current = null;
    setRecording(false);
  };

  // Mark seen when chat opens — different logic for admin vs her
  useEffect(() => {
    if (!open) return;
    setUnread(0);
    const markSender = isAdmin ? "her" : "me";
    supabase.functions.invoke("chat", { body: { action: "seen", markSender } }).catch(() => {});
  }, [open, isAdmin]);

  // Detect new incoming messages → update unread badge + play chime
  useEffect(() => {
    if (!messages.length) return;

    const currentIds = new Set(messages.map(m => m.id));

    if (prevMsgIds.current.size > 0) {
      // Find truly new messages since last poll
      const newMsgs = messages.filter(m => !prevMsgIds.current.has(m.id));

      // From her perspective: chime on new messages from "me" (him)
      // From admin perspective: no chime (admin is the sender)
      const incomingForViewer = newMsgs.filter(m =>
        isAdmin ? m.sender === "her" : m.sender === "me"
      );

      if (incomingForViewer.length > 0 && !open) {
        if (!isAdmin) playChime(); // chime only for her when window is closed
      }
    }

    prevMsgIds.current = currentIds;

    // Unread badge: messages from the other side that aren't "seen" yet
    if (!open) {
      const unreadSender = isAdmin ? "her" : "me";
      const count = messages.filter(m => m.sender === unreadSender && m.status !== "seen").length;
      setUnread(count);
    }
  }, [messages, open, isAdmin]);

  // Scroll to bottom on new messages when open
  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    sendMutation.mutate(text);
  }, [input, sendMutation]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const grouped = groupByDay(messages);
  const showTyping = sendMutation.isPending || sendingMedia;

  return (
    <>
      {/* Floating bubble — bottom-LEFT to avoid audio controls on the right */}
      <button
        data-testid="button-chat-open"
        onClick={() => setOpen(true)}
        className={`fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent/80 shadow-lg shadow-primary/40 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${open ? "opacity-0 pointer-events-none" : "opacity-100"}`}
      >
        <MessageCircleHeart className="w-6 h-6 text-white" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white text-primary text-[11px] font-bold flex items-center justify-center shadow">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Chat window — anchored bottom-left */}
      <div
        className={`fixed bottom-0 left-0 z-50 flex flex-col transition-all duration-400 ease-out
          ${open
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-8 pointer-events-none"
          }
          w-full sm:w-[380px] sm:bottom-6 sm:left-6 sm:rounded-3xl overflow-hidden
          shadow-2xl shadow-primary/20
        `}
        style={{ height: open ? "min(560px, 85vh)" : "0px" }}
      >
        {/* Header */}
        <div className="relative flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-primary/90 to-accent/70 backdrop-blur-xl shrink-0">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            <Heart className="w-4 h-4 text-white fill-white" />
          </div>
          <div>
            <p className="text-white font-display text-sm leading-tight flex items-center gap-1.5">
              Talk to me 💕
              {isAdmin && <ShieldCheck className="w-3.5 h-3.5 text-white/70" />}
            </p>
            <p className="text-white/60 text-[11px] font-body">
              {isAdmin ? "Admin — replying as Mr.Mwendwa" : "I'm always listening"}
            </p>
          </div>
          <button
            data-testid="button-chat-close"
            onClick={() => setOpen(false)}
            className="ml-auto w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Messages area */}
        <div
          className="flex-1 overflow-y-auto px-4 py-4 space-y-1"
          style={{ background: "hsl(var(--background))" }}
        >
          {isLoading && (
            <div className="flex justify-center pt-8">
              <Loader2 className="w-5 h-5 text-primary/40 animate-spin" />
            </div>
          )}

          {!isLoading && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-3 pt-12 text-center">
              <Heart className="w-10 h-10 text-primary/20 fill-primary/10" />
              <p className="text-muted-foreground font-body text-sm max-w-[200px] leading-relaxed">
                {isAdmin ? "No messages yet. She'll show up here." : "Say anything. I love hearing from you 💕"}
              </p>
            </div>
          )}

          {grouped.map(([date, msgs]) => (
            <div key={date}>
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-border/40" />
                <span className="text-[10px] text-muted-foreground/50 font-body tracking-wider uppercase">{formatDate(date)}</span>
                <div className="flex-1 h-px bg-border/40" />
              </div>

              {msgs.map((m) => {
                // isMine = message sent by the current viewer
                const isMine = isAdmin ? m.sender === "me" : m.sender === "her";
                const isSeenByOther = m.status === "seen";

                return (
                  <div
                    key={m.id}
                    data-testid={`message-${m.sender}-${m.id}`}
                    className={`flex mb-2 ${isMine ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm font-body leading-relaxed ${
                      isMine
                        ? "bg-gradient-to-br from-primary/80 to-primary/60 text-white rounded-br-sm"
                        : "bg-card border border-border/60 text-foreground rounded-bl-sm"
                    }`}>
                      {m.isAi && (
                        <span className="text-[10px] opacity-50 block mb-0.5">✨ auto-reply</span>
                      )}
                      {m.mediaUrl && m.mediaType === "image" && (
                        <img src={m.mediaUrl} alt="" className="rounded-lg max-w-full mb-1.5" />
                      )}
                      {m.mediaUrl && m.mediaType === "video" && (
                        <video src={m.mediaUrl} controls className="rounded-lg max-w-full mb-1.5" />
                      )}
                      {m.mediaUrl && m.mediaType === "audio" && (
                        <audio src={m.mediaUrl} controls className="w-full mb-1.5" />
                      )}
                      {m.text && <p>{m.text}</p>}
                      <div className={`flex items-center gap-1 mt-1 justify-end ${isMine ? "text-white/50" : "text-muted-foreground/50"}`}>
                        <span className="text-[10px]">{formatTime(m.createdAt as unknown as string)}</span>
                        {isMine && (
                          <span className={`text-[10px] font-medium ${isSeenByOther ? "text-blue-300" : ""}`}>
                            {STATUS_ICONS[m.status] || "✓"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div
          className="shrink-0 px-3 py-3 border-t border-border/40 flex items-end gap-2"
          style={{ background: "hsl(var(--background))" }}
        >
          {/* Attach menu */}
          <div className="relative shrink-0">
            <button
              onClick={() => setAttachOpen((o) => !o)}
              className="w-10 h-10 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground hover:text-primary transition-all mb-0.5"
              title="Attach"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            {attachOpen && (
              <div className="absolute bottom-12 left-0 z-50 rounded-xl bg-card border border-border/60 shadow-xl p-1 w-44">
                <button onClick={() => imgInputRef.current?.click()} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/60 text-sm text-foreground">
                  <ImageIcon className="w-4 h-4 text-primary" /> Photo
                </button>
                <button onClick={() => vidInputRef.current?.click()} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/60 text-sm text-foreground">
                  <Film className="w-4 h-4 text-primary" /> Video
                </button>
                <button
                  onClick={() => { setAttachOpen(false); recording ? stopRecording() : startRecording(); }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/60 text-sm text-foreground"
                >
                  {recording ? <Square className="w-4 h-4 text-red-500" /> : <Mic className="w-4 h-4 text-primary" />}
                  {recording ? "Stop & send" : "Voice note"}
                </button>
              </div>
            )}
            <input ref={imgInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
              const f = e.target.files?.[0]; if (f) sendMedia(f, "image", f.name); e.target.value = "";
            }} />
            <input ref={vidInputRef} type="file" accept="video/*" className="hidden" onChange={(e) => {
              const f = e.target.files?.[0]; if (f) sendMedia(f, "video", f.name); e.target.value = "";
            }} />
          </div>

          {recording && (
            <button onClick={stopRecording} className="px-2 text-[11px] text-red-400 font-body animate-pulse">
              ● recording — tap to stop
            </button>
          )}

          <textarea
            data-testid="input-chat-message"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder={isAdmin ? "Reply to her..." : "Type something sweet..."}
            rows={1}
            className="flex-1 resize-none rounded-2xl bg-muted/60 border border-border/40 px-3.5 py-2.5 text-sm font-body text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all max-h-28 overflow-y-auto"
            style={{ lineHeight: "1.5" }}
          />
          <button
            data-testid="button-chat-send"
            onClick={handleSend}
            disabled={!input.trim() || sendMutation.isPending || sendingMedia}
            className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-accent/80 flex items-center justify-center text-white disabled:opacity-40 hover:opacity-90 active:scale-95 transition-all shrink-0 mb-0.5"
          >
            {sendMutation.isPending || sendingMedia
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Send className="w-4 h-4" />
            }
          </button>
        </div>
      </div>

      {/* Backdrop (mobile) */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm sm:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
