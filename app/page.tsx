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

  // Load chats (and create a first chat if none exist)
  useEffect(() => {
    const saved = localStorage.getItem("humankindai-chats");
    if (saved) {
      const parsed: Chat[] = JSON.parse(saved);
      setChats(parsed);
      if (parsed.length > 0) setActiveChatId(parsed[0].id);
    } else {
      const firstChat: Chat = {
        id: Date.now().toString(),
        title: "New Chat",
        messages: [],
      };
      setChats([firstChat]);
      setActiveChatId(firstChat.id);
    }
  }, []);

  // Save chats
  useEffect(() => {
    localStorage.setItem("humankindai-chats", JSON.stringify(chats));
  }, [chats]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages, loading]);

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
    if (!input.trim() || !activeChat || loading) return;

    const messageToSend = input.trim();
    const userMessage: Message = { role: "user", content: messageToSend };

    // Optimistic add user message + set title if first message
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === activeChat.id
          ? {
              ...chat,
              title:
                chat.messages.length === 0
                  ? messageToSend.slice(0, 30)
                  : chat.title,
              messages: [...chat.messages, userMessage],
            }
          : chat
      )
    );

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
        content: data.reply ?? "No response.",
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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

    // allow re-uploading same file
    e.target.value = "";
  };

  const filteredChats = chats.filter((chat) => {
    const q = searchQuery.toLowerCase();
    return (
      chat.title.toLowerCase().includes(q) ||
      chat.messages.some((msg) => msg.content.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen text-white">
      {/* Background */}
      <div className="fixed inset-0 -z-10 bg-[#020617]" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(900px_circle_at_50%_0%,rgba(59,130,246,0.18),transparent_55%),radial-gradient(700px_circle_at_80%_20%,rgba(236,72,153,0.12),transparent_55%),radial-gradient(900px_circle_at_20%_80%,rgba(34,197,94,0.08),transparent_55%)]" />

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-72 border-r border-white/5 bg-white/[0.03] backdrop-blur-2xl p-6 flex flex-col">
          {/* Brand */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 shadow-lg overflow-hidden">
              <img
                src="/logo.png"
                alt="HumanKindAI Logo"
                className="w-full h-full object-contain"
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

          {/* New Chat */}
          <button
            onClick={createNewChat}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2 shadow-lg shadow-blue-600/20 hover:shadow-blue-500/25 transition"
          >
            <Plus size={18} />
            New Chat
          </button>

          {/* Search */}
          <div className="mt-6">
            <div className="flex items-center gap-2 text-white/60 mb-2 text-sm">
              <Search size={16} />
              Search chats
            </div>
            <input
              type="text"
              placeholder="Type a keyword..."
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white/90 placeholder:text-white/35 outline-none focus:ring-2 focus:ring-blue-500/30"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Quick actions */}
          <div className="mt-6 flex gap-3 text-sm">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-white/70 hover:bg-white/10 transition"
            >
              <ImageIcon size={16} />
              Images
            </button>

            <button
              onClick={() => setShowApps(true)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-white/70 hover:bg-white/10 transition"
            >
              <Grid size={16} />
              Apps
            </button>
          </div>

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleImageUpload}
          />

          {/* Chats */}
          <div className="mt-6 flex-1 overflow-y-auto space-y-2 pr-1">
            {(searchQuery ? filteredChats : chats).map((chat) => (
              <button
                key={chat.id}
                onClick={() => setActiveChatId(chat.id)}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm truncate border transition ${
                  chat.id === activeChatId
                    ? "bg-blue-500/10 border-blue-400/20 shadow-sm shadow-blue-500/10"
                    : "bg-white/0 border-transparent hover:bg-white/5 hover:border-white/10"
                }`}
                title={chat.title}
              >
                {chat.title}
              </button>
            ))}
          </div>

          <div className="pt-4 text-xs text-white/35">
            Calm • Ethical • Private by design
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 flex flex-col items-center px-6 py-10">
          <div className="w-full max-w-4xl flex-1">
            {/* Chat panel */}
            <div className="h-full rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl shadow-[0_0_60px_rgba(0,0,0,0.55)] overflow-hidden">
              {/* Top bar */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                    <img
                      src="/logo.png"
                      alt="logo"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="leading-tight">
                    <div className="text-sm text-white/85 font-medium">
                      {activeChat?.title ?? "HumanKindAI"}
                    </div>
                    <div className="text-xs text-white/40">
                      Calm responses • Not medical advice
                    </div>
                  </div>
                </div>

                <div className="text-xs text-white/40">
                  Press <span className="text-white/60">Enter</span> to send
                </div>
              </div>

              {/* Messages */}
              <div className="h-[calc(100%-64px)] p-6 overflow-y-auto">
                {/* Empty state */}
                {activeChat && activeChat.messages.length === 0 && (
                  <div className="h-full flex items-center justify-center">
                    <div className="max-w-md text-center">
                      <div className="mx-auto mb-4 h-14 w-14 rounded-3xl bg-white/5 border border-white/10 overflow-hidden shadow-lg shadow-blue-500/10">
                        <img
                          src="/logo.png"
                          alt="HumanKindAI"
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <h1 className="text-2xl font-semibold text-white/90">
                        HumanKindAI
                      </h1>
                      <p className="mt-2 text-sm text-white/50">
                        A calm, ethical companion for clarity, emotional growth,
                        and practical self-improvement.
                      </p>

                      <div className="mt-5 flex flex-wrap justify-center gap-2">
                        {[
                          "Help me calm down",
                          "Rewrite this kindly",
                          "Plan my day with balance",
                        ].map((t) => (
                          <button
                            key={t}
                            onClick={() => setInput(t)}
                            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/70 hover:bg-white/10 transition"
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeChat?.messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`mb-4 flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[78%] rounded-2xl px-4 py-3 whitespace-pre-wrap border ${
                        msg.role === "user"
                          ? "bg-blue-600/20 border-blue-400/20 text-white/90 shadow-sm shadow-blue-500/10"
                          : "bg-white/[0.06] border-white/10 text-white/85"
                      }`}
                    >
                      {msg.image && (
                        <img
                          src={msg.image}
                          alt="uploaded"
                          className="rounded-xl mb-2 max-h-60 border border-white/10"
                        />
                      )}
                      {msg.content}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="text-white/45 text-sm">Thinking…</div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>

          {/* Composer */}
          {activeChat && (
            <div className="w-full max-w-4xl mt-5">
              <div className="rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-xl shadow-lg shadow-black/30 p-2 focus-within:ring-2 focus-within:ring-blue-500/30">
                <div className="flex items-end gap-2">
                  <textarea
                    className="min-h-[54px] flex-1 resize-none bg-transparent px-3 py-3 text-white/90 placeholder:text-white/35 outline-none"
                    rows={2}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendText();
                      }
                    }}
                    placeholder="Talk to HumanKindAI…"
                  />

                  <button
                    onClick={sendText}
                    disabled={loading || !input.trim()}
                    className="h-[54px] rounded-xl bg-blue-600 px-6 text-white shadow-md shadow-blue-600/20 hover:bg-blue-500 hover:shadow-blue-500/25 disabled:opacity-50 disabled:hover:bg-blue-600 transition active:scale-[0.99]"
                  >
                    Send
                  </button>
                </div>

                <div className="mt-2 flex flex-wrap gap-2 px-1 pb-1">
                  {["Summarize", "Make it kinder", "Give 3 options"].map((t) => (
                    <button
                      key={t}
                      onClick={() =>
                        setInput((prev) => (prev ? prev + " " + t : t))
                      }
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/65 hover:bg-white/10 transition"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-2 text-xs text-white/35 px-1">
                Tip: Shift+Enter for a new line.
              </div>
            </div>
          )}
        </main>

        {/* Apps Modal */}
        {showApps && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0b1220]/90 p-6 shadow-2xl">
              <h3 className="text-lg font-semibold mb-2">Apps</h3>
              <p className="text-white/55 text-sm mb-5">
                Future tools will appear here.
              </p>
              <button
                onClick={() => setShowApps(false)}
                className="rounded-xl bg-blue-600 px-4 py-2 hover:bg-blue-500 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}