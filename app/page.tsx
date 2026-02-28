"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Search, Image as ImageIcon, Grid } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
  image?: string;
};

type Chat = {
  id: string;
  title: string;
  messages: Message[];
};

export default function Home() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showApps, setShowApps] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeChat = chats.find((c) => c.id === activeChatId);

  // Load chats
  useEffect(() => {
    const saved = localStorage.getItem("humankindai-chats");
    if (saved) {
      const parsed = JSON.parse(saved);
      setChats(parsed);
      if (parsed.length > 0) setActiveChatId(parsed[0].id);
    }
  }, []);

  // Save chats
  useEffect(() => {
    localStorage.setItem("humankindai-chats", JSON.stringify(chats));
  }, [chats]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages]);

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: "New Chat",
      messages: [],
    };
    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newChat.id);
  };

  const sendText = async () => {
    if (!input.trim() || !activeChat) return;

    const userMessage: Message = { role: "user", content: input };

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === activeChat.id
          ? {
              ...chat,
              title:
                chat.messages.length === 0
                  ? input.slice(0, 30)
                  : chat.title,
              messages: [...chat.messages, userMessage],
            }
          : chat
      )
    );

    const messageToSend = input;
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageToSend }),
      });

      const data = await res.json();

      const aiMessage: Message = {
        role: "assistant",
        content: data.reply,
      };

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === activeChat.id
            ? { ...chat, messages: [...chat.messages, aiMessage] }
            : chat
        )
      );
    } catch {
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === activeChat.id
            ? {
                ...chat,
                messages: [
                  ...chat.messages,
                  { role: "assistant", content: "Something went wrong." },
                ],
              }
            : chat
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: any) => {
    const file = e.target.files[0];
    if (!file || !activeChat) return;

    const reader = new FileReader();
    reader.onload = () => {
      const imageMessage: Message = {
        role: "user",
        content: "",
        image: reader.result as string,
      };

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === activeChat.id
            ? { ...chat, messages: [...chat.messages, imageMessage] }
            : chat
        )
      );
    };
    reader.readAsDataURL(file);
  };

  const filteredChats = chats.filter((chat) =>
    chat.messages.some((msg) =>
      msg.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#0b0f19] via-black to-[#0a0a0a] text-white">

      {/* Sidebar */}
      <aside className="w-72 bg-[#0d1424]/80 backdrop-blur-xl border-r border-white/5 p-6 flex flex-col shadow-2xl">

        {/* Logo Section */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 shadow-lg">
            <img
              src="/logo.png"
              alt="HumanKindAI Logo"
              className="w-8 h-8 object-contain"
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white/90 leading-tight">
              HumanKindAI
            </h2>
            <p className="text-[11px] text-white/40 tracking-wide">
              Emotional Intelligence AI
            </p>
          </div>
        </div>

        <button
          onClick={createNewChat}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2 rounded-xl mb-6 shadow-lg"
        >
          <Plus size={18} />
          New Chat
        </button>

        {/* Search */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-white/60 mb-2">
            <Search size={16} />
            Search chats
          </div>
          <input
            type="text"
            placeholder="Type a keyword..."
            className="w-full p-2 rounded-lg bg-white/5 border border-white/10 text-sm outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Images */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 text-white/70 hover:text-white transition mb-4"
        >
          <ImageIcon size={18} />
          Images
        </button>

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          onChange={handleImageUpload}
        />

        {/* Apps */}
        <button
          onClick={() => setShowApps(true)}
          className="flex items-center gap-2 text-white/70 hover:text-white transition"
        >
          <Grid size={18} />
          Apps
        </button>

        <div className="mt-6 flex flex-col gap-2 overflow-y-auto">
          {(searchQuery ? filteredChats : chats).map((chat) => (
            <button
              key={chat.id}
              onClick={() => setActiveChatId(chat.id)}
              className={`text-left px-3 py-2 rounded-lg text-sm truncate ${
                chat.id === activeChatId
                  ? "bg-white/10"
                  : "hover:bg-white/5"
              }`}
            >
              {chat.title}
            </button>
          ))}
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col items-center px-10 py-12">

        <div className="w-full max-w-3xl bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-[0_0_60px_rgba(0,0,0,0.6)] flex flex-col gap-6">

          {activeChat?.messages.map((msg, index) => (
            <div
              key={index}
              className={`p-4 rounded-2xl max-w-[75%] whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 self-end"
                  : "bg-white/[0.06] border border-white/10 self-start"
              }`}
            >
              {msg.image && (
                <img
                  src={msg.image}
                  alt="uploaded"
                  className="rounded-lg mb-2 max-h-60"
                />
              )}
              {msg.content}
            </div>
          ))}

          {loading && (
            <div className="text-white/50">Thinking...</div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {activeChat && (
          <div className="w-full max-w-3xl flex gap-3 mt-8">
            <textarea
              className="flex-1 p-4 rounded-xl bg-gray-900/80 border border-gray-700 resize-none"
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendText();
                }
              }}
              placeholder="Talk to HumanKindAI..."
            />
            <button
              onClick={sendText}
              disabled={loading}
              className="bg-blue-600 px-6 rounded-xl hover:bg-blue-500 disabled:opacity-50"
            >
              Send
            </button>
          </div>
        )}
      </main>

      {/* Apps Modal */}
      {showApps && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center">
          <div className="bg-[#111827] p-8 rounded-2xl w-96">
            <h3 className="text-lg font-semibold mb-4">Apps</h3>
            <p className="text-white/60 text-sm mb-6">
              Future tools will appear here.
            </p>
            <button
              onClick={() => setShowApps(false)}
              className="bg-blue-600 px-4 py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}