"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  parseApiErrorFromResponse,
  parseApiError,
} from "@/lib/parse-api-error";

type Message = { role: "user" | "assistant"; content: string };

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim() || loading) return;
    const userMessage = message.trim();
    setMessage("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);
    try {
      const body: { message: string; latitude?: number; longitude?: number } = {
        message: userMessage,
      };
      if (location) {
        body.latitude = location.lat;
        body.longitude = location.lng;
      }
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      let errorMessage: string;
      if (!res.ok) {
        const parsed = await parseApiErrorFromResponse(res);
        errorMessage = parsed.message;
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: errorMessage },
        ]);
        return;
      }
      const data = (await res.json()) as { answer?: string };
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer ?? "" },
      ]);
    } catch {
      const parsed = parseApiError(null);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: parsed.message },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function requestLocation() {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => setLocation(null)
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <nav className="p-4 border-b border-slate-200 bg-white">
        <Link href="/" className="text-emerald-600 hover:underline">
          Voltar
        </Link>
        <h1 className="text-xl font-bold text-slate-800 mt-2">
          Assistente de viagens
        </h1>
        <button
          type="button"
          onClick={requestLocation}
          className="mt-2 text-sm text-emerald-600 hover:underline"
        >
          {location
            ? "Localização ativa"
            : "Usar minha localização nas respostas"}
        </button>
      </nav>
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[60vh]"
      >
        {messages.length === 0 && (
          <p className="text-slate-500 text-center py-8">
            Pergunte sobre destinos, restaurantes, trilhas ou onde se hospedar.
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={
              m.role === "user"
                ? "ml-auto max-w-[80%] bg-emerald-600 text-white p-3 rounded-lg"
                : "mr-auto max-w-[80%] bg-white border border-slate-200 p-3 rounded-lg text-slate-800"
            }
          >
            {m.content}
          </div>
        ))}
        {loading && (
          <div className="mr-auto max-w-[80%] bg-white border border-slate-200 p-3 rounded-lg text-slate-500">
            Pensando...
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={sendMessage} className="p-4 border-t border-slate-200 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Sua pergunta..."
            className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="px-4 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50"
          >
            Enviar
          </button>
        </div>
      </form>
    </div>
  );
}
