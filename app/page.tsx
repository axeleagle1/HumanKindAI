"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function ChatPage() {
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get("prompt") || "";

  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);

  const [input, setInput] = useState("");

  // When landing passes ?prompt=hi
  useEffect(() => {
    if (initialPrompt) {
      sendMessage(initialPrompt);
    }
  }, [initialPrompt]);

  async function sendMessage(text: string) {
    if (!text) return;

    const userMessage = { role: "user" as const, content: text };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Call your existing API route
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });

    const data = await res.json();

    const assistantMessage = {
      role: "assistant" as const,
      content: data.reply,
    };

    setMessages((prev) => [...prev, assistantMessage]);
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="flex-1 p-6 max-w-3xl mx-auto w-full">
        {messages.map((msg, i) => (
          <div key={i} className="mb-4">
            <div className="text-sm opacity-50">{msg.role}</div>
            <div>{msg.content}</div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-white/10">
        <div className="max-w-3xl mx-auto flex gap-3">
          <input
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
          />
          <button
            onClick={() => sendMessage(input)}
            className="bg-white text-black px-4 rounded-xl"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}