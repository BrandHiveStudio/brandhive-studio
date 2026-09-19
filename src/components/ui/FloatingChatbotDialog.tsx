"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUp, X } from "lucide-react";
import Image from "next/image";

type ChatMessage = {
  id: number;
  author: "assistant" | "visitor";
  text: string;
};

type LeadForm = {
  name: string;
  email: string;
  company: string;
};

const starterMessages: ChatMessage[] = [
  {
    id: 1,
    author: "assistant",
    text: "Hi! I'm HIVE AI.\n\nI'm here to help you explore BrandHive Studio, recommend the right services, and answer any questions before you start your project.",
  },
];

const suggestions = [
  "Recommend a Service",
  "View Our Process",
  "Start a Project",
  "View Portfolio",
];

interface FloatingChatbotDialogProps {
  onClose: () => void;
}

export default function FloatingChatbotDialog({ onClose }: FloatingChatbotDialogProps) {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(starterMessages);
  const [isReplying, setIsReplying] = useState(false);
  const [leadForm, setLeadForm] = useState<LeadForm>({ name: "", email: "", company: "" });
  const [leadCaptureOpen, setLeadCaptureOpen] = useState(false);
  const [leadStatus, setLeadStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [leadError, setLeadError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const messageId = useRef(1);
  const isSubmittingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const shouldReduceMotion = useReducedMotion();

  // Purge any legacy persistent chat history on mount and cleanup in-flight requests on unmount
  useEffect(() => {
    try {
      window.localStorage.removeItem("brandhive-chat-history");
    } catch {
      // Ignore storage restrictions
    }
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      try {
        window.localStorage.removeItem("brandhive-chat-history");
      } catch {
        // Ignore storage restrictions
      }
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => inputRef.current?.focus(), 180);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleClose = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    isSubmittingRef.current = false;
    setIsReplying(false);
    setDraft("");
    setLeadCaptureOpen(false);
    setLeadStatus("idle");
    setLeadError("");
    try {
      window.localStorage.removeItem("brandhive-chat-history");
    } catch {
      // Ignore
    }
    onClose();
  };

  const sendMessage = async (value: string) => {
    const text = value.trim();
    if (!text || isReplying || isSubmittingRef.current) return;

    isSubmittingRef.current = true;
    setDraft("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }

    const visitorMessage = { id: messageId.current + 1, author: "visitor" as const, text };
    const nextMessages = [...messages, visitorMessage];

    messageId.current = visitorMessage.id;
    setMessages(nextMessages);
    setLeadCaptureOpen(false);
    setLeadStatus("idle");
    setLeadError("");
    setIsReplying(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          message: text,
          history: messages.slice(-8).map((entry) => ({
            role: entry.author === "assistant" ? "assistant" : "user",
            content: entry.text,
          })),
        }),
      });

      const data = await response.json();
      const assistantReply = data?.reply || "Thanks for reaching out. I can guide you to the right next step.";

      messageId.current += 1;
      setMessages((current) => [
        ...current,
        { id: messageId.current, author: "assistant", text: assistantReply },
      ]);

      if (data?.needsLeadCapture) {
        setLeadCaptureOpen(true);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }
      messageId.current += 1;
      setMessages((current) => [
        ...current,
        { id: messageId.current, author: "assistant", text: "I’m having trouble reaching the assistant right now. Please try again or contact us directly." },
      ]);
    } finally {
      abortControllerRef.current = null;
      isSubmittingRef.current = false;
      setIsReplying(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage(draft);
  };

  const handleLeadSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = leadForm.name.trim();
    const email = leadForm.email.trim();
    const company = leadForm.company.trim();

    if (!name || !email) {
      setLeadStatus("error");
      setLeadError("Please add your name and email so we can follow up.");
      return;
    }

    setLeadStatus("submitting");
    setLeadError("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Lead capture from chat",
          lead: { name, email, company },
          history: messages.slice(-6).map((entry) => ({
            role: entry.author === "assistant" ? "assistant" : "user",
            content: entry.text,
          })),
        }),
      });

      const data = await response.json();
      const assistantReply = data?.reply || "Thanks. We’ll be in touch soon.";

      messageId.current += 1;
      setMessages((current) => [
        ...current,
        { id: messageId.current, author: "assistant", text: assistantReply },
      ]);
      setLeadForm({ name: "", email: "", company: "" });
      setLeadCaptureOpen(false);
      setLeadStatus("success");
    } catch {
      setLeadStatus("error");
      setLeadError("We could not submit your details right now. Please contact us directly.");
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage(draft);
    }
  };

  return (
    <motion.section
      id="brandhive-chat"
      aria-label="BrandHive Studio chat"
      aria-live="polite"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.96 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      role="dialog"
      onWheel={(event) => {
        event.stopPropagation();
      }}
      className="mb-3 flex h-[min(38rem,calc(100dvh-7.5rem))] w-[calc(100vw-2rem)] max-w-[25rem] flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0c1117]/85 shadow-[0_24px_80px_rgba(0,0,0,0.55),0_0_42px_rgba(22,199,255,0.12),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl sm:w-[25rem]"
    >
      <div className="relative flex items-center justify-between border-b border-white/8 px-5 py-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(22,199,255,0.18),transparent_42%)]" />
        <div className="relative flex items-center gap-3">
          <div className="relative grid size-10 place-items-center rounded-2xl border border-[#16C7FF]/30 bg-[#16C7FF]/10 shadow-[0_0_20px_rgba(22,199,255,0.15)] overflow-hidden">
            <Image
              src="/favicon/official_HIVE_AI_Symbol.png"
              alt="HIVE AI Assistant Symbol"
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight text-white">HIVE AI Assistant</p>
            <p className="flex items-center gap-1.5 text-xs text-white/55">
              <span className="size-1.5 rounded-full bg-[#16C7FF] shadow-[0_0_8px_#16C7FF]" />
              Powered by BrandHive Studio
            </p>
          </div>
        </div>
        <button type="button" onClick={handleClose} className="relative grid size-9 place-items-center rounded-full text-white/60 transition hover:bg-white/8 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16C7FF]" aria-label="Close chat">
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>

      <div
        ref={messagesRef}
        className="flex-1 space-y-3 overflow-y-auto px-4 py-5 [scrollbar-color:rgba(255,255,255,0.18)_transparent]"
        aria-label="Chat messages"
        onWheel={(event) => {
          const element = messagesRef.current;
          if (!element) return;

          const isAtTop = element.scrollTop === 0 && event.deltaY < 0;
          const isAtBottom = element.scrollHeight - element.clientHeight - element.scrollTop <= 1 && event.deltaY > 0;

          if (isAtTop || isAtBottom) {
            event.preventDefault();
          }
        }}
      >
        {messages.map((message) => (
          <motion.div key={message.id} initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={message.author === "visitor" ? "ml-auto max-w-[85%]" : "max-w-[88%]"}>
            <p className={message.author === "visitor" ? "rounded-2xl rounded-br-md bg-[#16C7FF] px-3.5 py-2.5 text-sm leading-5 text-[#050608] shadow-[0_6px_18px_rgba(22,199,255,0.2)] whitespace-pre-line" : "rounded-2xl rounded-bl-md border border-white/8 bg-white/5 px-3.5 py-2.5 text-sm leading-5 text-white/80 whitespace-pre-line"}>
              {message.text}
            </p>
          </motion.div>
        ))}
        {isReplying && <div className="w-fit rounded-2xl rounded-bl-md border border-white/8 bg-white/5 px-4 py-3 text-xs text-white/50">Hive is typing<span className="animate-pulse">...</span></div>}
        {leadCaptureOpen && (
          <motion.form onSubmit={handleLeadSubmit} initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-[#16C7FF]/20 bg-[#16C7FF]/8 p-3 text-sm text-white/80">
            <p className="mb-2 font-semibold text-[#8be5ff]">Let’s keep the momentum going</p>
            <div className="space-y-2">
              <input value={leadForm.name} onChange={(event) => setLeadForm((current) => ({ ...current, name: event.target.value }))} className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none placeholder:text-white/35" placeholder="Your name" />
              <input value={leadForm.email} onChange={(event) => setLeadForm((current) => ({ ...current, email: event.target.value }))} className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none placeholder:text-white/35" placeholder="Your email" type="email" />
              <input value={leadForm.company} onChange={(event) => setLeadForm((current) => ({ ...current, company: event.target.value }))} className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none placeholder:text-white/35" placeholder="Company (optional)" />
            </div>
            {leadStatus === "error" && <p className="mt-2 text-xs text-[#ff8a8a]">{leadError}</p>}
            {leadStatus === "success" && <p className="mt-2 text-xs text-[#8be5ff]">Thanks — we’ll follow up shortly.</p>}
            <button type="submit" disabled={leadStatus === "submitting"} className="mt-3 w-full rounded-xl bg-[#16C7FF] px-3 py-2 text-sm font-semibold text-[#050608] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
              {leadStatus === "submitting" ? "Sending..." : "Send my details"}
            </button>
          </motion.form>
        )}
      </div>

      {messages.length === 1 && (
        <div className="flex gap-2 overflow-x-auto px-4 pb-3" aria-label="Suggested questions">
          {suggestions.map((suggestion) => (
            <button key={suggestion} type="button" onClick={() => void sendMessage(suggestion)} className="shrink-0 rounded-full border border-[#16C7FF]/20 bg-[#16C7FF]/5 px-3 py-1.5 text-xs font-medium text-[#73dcff] transition hover:border-[#16C7FF]/45 hover:bg-[#16C7FF]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16C7FF]">
              {suggestion}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="border-t border-white/8 p-3">
        <label className="sr-only" htmlFor="chat-message">Message Hive Assistant</label>
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 p-1.5 transition focus-within:border-[#16C7FF]/45 focus-within:ring-4 focus-within:ring-[#16C7FF]/10">
          <input ref={inputRef} id="chat-message" value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={handleKeyDown} placeholder="Ask HIVE AI anything..." className="min-w-0 flex-1 bg-transparent px-2.5 py-2 text-sm text-white outline-none placeholder:text-white/35" autoComplete="off" />
          <button type="submit" disabled={!draft.trim() || isReplying} className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#16C7FF] text-[#050608] transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16C7FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c1117]" aria-label="Send message">
            <ArrowUp className="size-4" aria-hidden="true" />
          </button>
        </div>
        <p className="pt-2 text-center text-[10px] text-white/30">Powered by HIVE AI • BrandHive Studio</p>
      </form>
    </motion.section>
  );
}
