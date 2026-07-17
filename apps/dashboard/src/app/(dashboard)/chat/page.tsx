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
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (token) loadConvos();
  }, [token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadConvos = async () => {
    const list = await api<Conversation[]>("/api/v1/chat/conversations", { token: token! });
    setConvos(list);
  };

  const loadMessages = async (id: string) => {
    setActiveId(id);
    const conv = await api<{ messages: Message[] }>(`/api/v1/chat/conversations/${id}`, { token: token! });
    setMessages(conv.messages);
  };

  const newConvo = async () => {
    const conv = await api<{ id: string }>("/api/v1/chat/conversations", { method: "POST", token: token! });
    setActiveId(conv.id);
    setMessages([]);
    await loadConvos();
  };

  const send = async () => {
    if (!input.trim() || !activeId || sending) return;
    const text = input;
    setInput("");
    setSending(true);

    setMessages((prev) => [...prev, { id: "temp-user", role: "user", content: text, created_at: new Date().toISOString() }]);

    try {
      const reply = await api<Message>(`/api/v1/chat/conversations/${activeId}/messages`, {
        method: "POST", body: { content: text }, token: token!,
      });
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== "temp-user"),
        { id: "real-user", role: "user", content: text, created_at: reply.created_at },
        reply,
      ]);
      loadConvos();
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { id: "error", role: "assistant", content: `Error: ${err.message}. Make sure OPENROUTER_API_KEY is set.`, created_at: new Date().toISOString() },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-3rem)] -m-6">
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-3 border-b border-gray-100">
          <button onClick={newConvo}
            className="w-full py-2 bg-[#3B4B9E] text-white rounded-lg text-sm font-medium hover:bg-[#2d3a7a] transition-colors">
            + New conversation
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {convos.length === 0 && (
            <p className="text-gray-400 text-xs text-center mt-8 px-4">No conversations yet. Start one!</p>
          )}
          {convos.map((c) => (
            <button key={c.id} onClick={() => loadMessages(c.id)}
              className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                activeId === c.id ? "bg-blue-50 border-l-2 border-l-[#3B4B9E]" : ""
              }`}>
              <p className="text-sm font-medium text-gray-900 truncate">{c.title || "New chat"}</p>
              <p className="text-xs text-gray-400 truncate mt-0.5">{c.last_message || "..."}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-gray-50">
        {!activeId ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[#3B4B9E] flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">Aa</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Talk to Aawiz</h2>
              <p className="text-gray-500 text-sm mb-6 max-w-xs">Your AI companion for emotional wellbeing. Start a conversation to explore how you feel.</p>
              <button onClick={newConvo}
                className="px-6 py-2.5 bg-[#3B4B9E] text-white rounded-lg text-sm font-medium hover:bg-[#2d3a7a] transition-colors">
                Start a conversation
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="px-4 py-3 bg-white border-b border-gray-200 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#3B4B9E] flex items-center justify-center">
                <span className="text-white text-xs font-bold">Aa</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Aawiz</p>
                <p className="text-xs text-gray-400">Your companion</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center mt-16">
                  <p className="text-gray-400 text-sm">Say hello to start the conversation.</p>
                </div>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] ${msg.role === "user" ? "order-1" : "order-1"}`}>
                    {msg.role === "assistant" && (
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 rounded-full bg-[#3B4B9E] flex items-center justify-center">
                          <span className="text-white text-[10px] font-bold">Aa</span>
                        </div>
                        <span className="text-xs text-gray-400">Aawiz</span>
                      </div>
                    )}
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-[#3B4B9E] text-white rounded-br-md"
                        : "bg-white border border-gray-200 text-gray-800 rounded-bl-md"
                    }`}>
                      {msg.content}
                    </div>
                    <p className={`text-[10px] text-gray-400 mt-1 ${msg.role === "user" ? "text-right" : ""}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#3B4B9E] flex items-center justify-center">
                      <span className="text-white text-[10px] font-bold">Aa</span>
                    </div>
                    <div className="flex gap-1 px-4 py-3 bg-white border border-gray-200 rounded-2xl">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="px-4 py-3 bg-white border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
                  placeholder="Talk to me about anything..."
                  className="flex-1 px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4B9E] focus:border-transparent"
                  disabled={sending}
                />
                <button onClick={send} disabled={sending || !input.trim()}
                  className="w-10 h-10 bg-[#3B4B9E] rounded-full flex items-center justify-center hover:bg-[#2d3a7a] disabled:opacity-50 transition-colors">
                  <span className="text-white text-lg">↑</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
