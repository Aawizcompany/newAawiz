"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

type Message = { id: string; role: "user" | "assistant"; content: string; created_at: string };
type Conversation = { id: string; title: string | null; updated_at: string; last_message: string | null };

export default function ChatPage() {
  const { token } = useAuth();
  const [convos, setConvos] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showList, setShowList] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (token) loadConvos(); }, [token]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const loadConvos = async () => {
    const list = await api<Conversation[]>("/api/v1/chat/conversations", { token: token! });
    setConvos(list);
  };

  const openConvo = async (id: string) => {
    setActiveId(id);
    setShowList(false);
    const conv = await api<{ messages: Message[] }>(`/api/v1/chat/conversations/${id}`, { token: token! });
    setMessages(conv.messages);
  };

  const newConvo = async () => {
    const conv = await api<{ id: string }>("/api/v1/chat/conversations", { method: "POST", token: token! });
    setActiveId(conv.id);
    setMessages([]);
    setShowList(false);
    loadConvos();
  };

  const send = async () => {
    if (!input.trim() || !activeId || sending) return;
    const text = input;
    setInput("");
    setSending(true);
    setMessages((prev) => [...prev, { id: "tmp", role: "user", content: text, created_at: new Date().toISOString() }]);
    try {
      const reply = await api<Message>(`/api/v1/chat/conversations/${activeId}/messages`, {
        method: "POST", body: { content: text }, token: token!,
      });
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== "tmp"),
        { id: "u", role: "user", content: text, created_at: reply.created_at },
        reply,
      ]);
      loadConvos();
    } catch (err: any) {
      setMessages((prev) => [...prev, {
        id: "err", role: "assistant",
        content: `Error: ${err.message}`,
        created_at: new Date().toISOString(),
      }]);
    } finally {
      setSending(false);
    }
  };

  /* ── Conversation list ── */
  if (showList || !activeId) {
    return (
      <div className="p-4 pb-24">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-semibold text-gray-900">Chat</h1>
          <button onClick={newConvo}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#6366F1] text-white rounded-xl text-xs font-medium">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-white" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
            New chat
          </button>
        </div>

        {convos.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#EEF2FF] flex items-center justify-center mb-4">
              <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="#6366F1" strokeWidth="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-gray-900 mb-1">Talk to Aawiz</h2>
            <p className="text-sm text-gray-400 mb-6 max-w-[220px]">Your AI companion for emotional wellbeing.</p>
            <button onClick={newConvo}
              className="px-6 py-2.5 bg-[#6366F1] text-white rounded-xl text-sm font-medium">
              Start a conversation
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {convos.map((c) => (
              <button key={c.id} onClick={() => openConvo(c.id)}
                className="w-full text-left bg-white border border-gray-100 rounded-2xl px-4 py-3.5 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-sm font-semibold text-gray-900 truncate">{c.title || "New conversation"}</p>
                <p className="text-xs text-gray-400 truncate mt-0.5">{c.last_message || "..."}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ── Chat view ── */
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="px-4 py-3 bg-white border-b border-gray-100 flex items-center gap-3 shrink-0">
        <button onClick={() => setShowList(true)}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="#6B7280" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <div className="w-8 h-8 rounded-xl bg-[#EEF2FF] flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="#6366F1" strokeWidth="1.8">
            <path d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">Aawiz</p>
          <p className="text-[10px] text-gray-400">Your AI companion</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#F9FAFB]">
        {messages.length === 0 && (
          <p className="text-center text-sm text-gray-400 mt-16">Say hello to start the conversation.</p>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
              msg.role === "user"
                ? "bg-[#6366F1] text-white rounded-br-md"
                : "bg-white border border-gray-100 text-gray-800 rounded-bl-md shadow-sm"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="flex gap-1 px-4 py-3 bg-white border border-gray-100 rounded-2xl rounded-bl-md shadow-sm">
              {[0, 150, 300].map((d) => (
                <span key={d} className="w-2 h-2 bg-[#6366F1] rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 bg-white border-t border-gray-100 mb-16 shrink-0">
        <div className="flex items-center gap-2 bg-gray-100 rounded-2xl px-4 py-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
            placeholder="Talk to me about anything..."
            className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
            disabled={sending}
          />
          <button onClick={send} disabled={sending || !input.trim()}
            className="w-8 h-8 bg-[#6366F1] rounded-xl flex items-center justify-center disabled:opacity-40 transition-opacity shrink-0">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-white" strokeWidth="2" strokeLinecap="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
