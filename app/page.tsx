"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Plus,
  Search,
  Image as ImageIcon,
  Grid,
  MoreHorizontal,
  Share2,
  Users,
  Pencil,
  Pin,
  Archive,
  Trash2,
  X,
  SendHorizonal,
  PanelLeft,
  Menu,
} from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
  image?: string; // stored, but not rendered
};

type Chat = {
  id: string;
  title: string;
  messages: Message[];
};

const makeTitle = (text: string) => {
  const cleaned = text
    .replace(/\s+/g, " ")
    .replace(/[^\w\s.,!?'"-]/g, "")
    .trim();

  if (!cleaned) return "Untitled";
  if (cleaned.length <= 42) return cleaned;

  const cut = cleaned.slice(0, 42);
  const words = cut.split(" ");
  if (words.length <= 1) return cut + "…";
  return words.slice(0, -1).join(" ") + "…";
};

export default function Home() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [showApps, setShowApps] = useState(false);

  // Desktop sidebar collapse
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Mobile drawer
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // 3-dot menu per chat row
  const [openMenuFor, setOpenMenuFor] = useState<string | null>(null);

  // Custom modals
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [renameTargetId, setRenameTargetId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeChat = useMemo(
    () => chats.find((c) => c.id === activeChatId),
    [chats, activeChatId]
  );

  // Close chat menu when clicking outside
  useEffect(() => {
    const close = () => setOpenMenuFor(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  // Load chats (ALWAYS create a first chat if none exist, including saved "[]")
  useEffect(() => {
    const saved = localStorage.getItem("humankindai-chats");

    if (saved) {
      const parsed: Chat[] = JSON.parse(saved);
      if (parsed.length > 0) {
        setChats(parsed);
        setActiveChatId(parsed[0].id);
        return;
      }
    }

    const firstChat: Chat = {
      id: Date.now().toString(),
      title: "Untitled",
      messages: [],
    };

    setChats([firstChat]);
    setActiveChatId(firstChat.id);
  }, []);

  // Save chats
  useEffect(() => {
    localStorage.setItem("humankindai-chats", JSON.stringify(chats));
  }, [chats]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages, loading]);

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: "Untitled",
      messages: [],
    };
    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    setOpenMenuFor(null);
    setMobileSidebarOpen(false); // close drawer on mobile
  };

  const sendText = async () => {
    if (!activeChat || loading) return;
    const messageToSend = input.trim();
    if (!messageToSend) return;

    const userMessage: Message = { role: "user", content: messageToSend };

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === activeChat.id
          ? {
              ...chat,
              title:
                chat.messages.length === 0
                  ? makeTitle(messageToSend)
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

  // Store image as hidden attachment; do not display the photo
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeChat) return;

    const reader = new FileReader();
    reader.onload = () => {
      const imageMessage: Message = {
        role: "user",
        content: "📎 Image attached",
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
    e.target.value = "";
  };

  const requestRenameChat = (chatId: string) => {
    const current = chats.find((c) => c.id === chatId)?.title ?? "Untitled";
    setRenameTargetId(chatId);
    setRenameValue(current);
  };

  const confirmRenameChat = () => {
    if (!renameTargetId) return;
    const next = renameValue.trim();
    if (!next) return;

    setChats((prev) =>
      prev.map((c) => (c.id === renameTargetId ? { ...c, title: next } : c))
    );
    setRenameTargetId(null);
  };

  const requestDeleteChat = (chatId: string) => {
    setDeleteTargetId(chatId);
  };

  const confirmDeleteChat = () => {
    if (!deleteTargetId) return;

    const remaining = chats.filter((c) => c.id !== deleteTargetId);
    setChats(remaining);

    if (activeChatId === deleteTargetId) {
      if (remaining.length > 0) setActiveChatId(remaining[0].id);
      else {
        const fresh: Chat = {
          id: Date.now().toString(),
          title: "Untitled",
          messages: [],
        };
        setChats([fresh]);
        setActiveChatId(fresh.id);
      }
    }

    setDeleteTargetId(null);
  };

  const filteredChats = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return chats.filter((chat) => {
      return (
        chat.title.toLowerCase().includes(q) ||
        chat.messages.some((msg) => msg.content.toLowerCase().includes(q))
      );
    });
  }, [chats, searchQuery]);

  // Premium behavior: only show chats that have at least 1 message
  const visibleChats = useMemo(() => {
    const base = searchQuery ? filteredChats : chats;
    return base.filter((c) => c.messages.length > 0);
  }, [chats, filteredChats, searchQuery]);

  const selectChat = (id: string) => {
    setActiveChatId(id);
    setMobileSidebarOpen(false); // close drawer on mobile
  };

  // Sidebar content renderer (used by desktop + mobile drawer)
  const SidebarContent = ({
    isMobile,
  }: {
    isMobile?: boolean;
  }) => (
    <>
      {/* Brand row (expanded only) */}
      {!sidebarCollapsed && !isMobile && (
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 shadow-lg overflow-hidden">
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
          </div>

          <button
            onClick={() => setSidebarCollapsed(true)}
            className="ml-auto h-9 w-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-white/70 hover:bg-white/10 transition"
            title="Collapse sidebar"
          >
            <PanelLeft size={16} />
          </button>
        </div>
      )}

      {/* Mobile brand header */}
      {isMobile && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
              <img
                src="/logo.png"
                alt="HumanKindAI"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-sm font-semibold text-white/90">
              HumanKindAI
            </div>
          </div>

          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="h-9 w-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-white/70 hover:bg-white/10 transition"
            aria-label="Close sidebar"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Collapsed toggle (desktop collapsed) */}
      {sidebarCollapsed && !isMobile && (
        <div className="flex items-center justify-center mb-3">
          <button
            onClick={() => setSidebarCollapsed(false)}
            className="h-10 w-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-white/70 hover:bg-white/10 transition"
            title="Expand sidebar"
          >
            <PanelLeft size={16} />
          </button>
        </div>
      )}

      {/* New Chat */}
      <button
        onClick={createNewChat}
        className={`flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-600/20 hover:shadow-blue-500/25 transition ${
          !isMobile && sidebarCollapsed ? "h-12 w-12 mx-auto" : "px-4 py-2"
        }`}
        title="New chat"
      >
        <Plus size={18} />
        {(isMobile || (!isMobile && !sidebarCollapsed)) && "New Chat"}
      </button>

      {/* Search (hidden on desktop collapsed) */}
      {(!isMobile && !sidebarCollapsed) && (
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
      )}

      {/* Quick actions */}
      {isMobile || (!isMobile && !sidebarCollapsed) ? (
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
      ) : (
        // collapsed desktop icon-only actions
        <div className="mt-5 flex flex-col items-center gap-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:bg-white/10 transition"
            title="Images"
          >
            <ImageIcon size={20} />
          </button>

          <button
            onClick={() => setShowApps(true)}
            className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:bg-white/10 transition"
            title="Apps"
          >
            <Grid size={20} />
          </button>
        </div>
      )}

      {/* Chat list label should be ABOVE chat list (not above New Chat) */}
      {(isMobile || (!isMobile && !sidebarCollapsed)) && (
        <div className="mt-8 mb-3 text-xs uppercase tracking-wider text-white/40">
          Your chats
        </div>
      )}

      {/* Chats list (hidden on desktop collapsed) */}
      {(isMobile || (!isMobile && !sidebarCollapsed)) && (
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {visibleChats.map((chat) => {
            const isActive = chat.id === activeChatId;

            return (
              <div
                key={chat.id}
                className={`group relative flex items-center rounded-xl border transition ${
                  isActive
                    ? "bg-blue-500/10 border-blue-400/20 shadow-sm shadow-blue-500/10"
                    : "bg-white/0 border-transparent hover:bg-white/5 hover:border-white/10"
                }`}
              >
                <button
                  onClick={() => selectChat(chat.id)}
                  className="flex-1 text-left px-3 py-2 text-sm truncate"
                  title={chat.title}
                >
                  {chat.title}
                </button>

                {/* dots only on direct hover (desktop only) */}
                {!isMobile && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuFor((prev) => (prev === chat.id ? null : chat.id));
                    }}
                    className="mr-2 hidden group-hover:flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 transition"
                    aria-label="Chat options"
                    title="Options"
                  >
                    <MoreHorizontal size={16} />
                  </button>
                )}

                {/* Mobile: simple long-press replacement (optional); for now keep menu off */}
                {!isMobile && openMenuFor === chat.id && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-2 top-11 z-50 w-56 rounded-xl border border-white/10 bg-[#0b1220]/95 backdrop-blur-xl shadow-2xl overflow-hidden"
                  >
                    <button
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/5"
                      onClick={() => {
                        setOpenMenuFor(null);
                        alert("Share (coming soon)");
                      }}
                    >
                      <Share2 size={16} />
                      Share
                    </button>

                    <button
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/5"
                      onClick={() => {
                        setOpenMenuFor(null);
                        alert("Start a group chat (coming soon)");
                      }}
                    >
                      <Users size={16} />
                      Start a group chat
                    </button>

                    <button
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/5"
                      onClick={() => {
                        setOpenMenuFor(null);
                        requestRenameChat(chat.id);
                      }}
                    >
                      <Pencil size={16} />
                      Rename
                    </button>

                    <div className="h-px bg-white/10 my-1" />

                    <button
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/5"
                      onClick={() => {
                        setOpenMenuFor(null);
                        alert("Pin chat (coming soon)");
                      }}
                    >
                      <Pin size={16} />
                      Pin chat
                    </button>

                    <button
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/5"
                      onClick={() => {
                        setOpenMenuFor(null);
                        alert("Archive (coming soon)");
                      }}
                    >
                      <Archive size={16} />
                      Archive
                    </button>

                    <button
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
                      onClick={() => {
                        setOpenMenuFor(null);
                        requestDeleteChat(chat.id);
                      }}
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen text-white">
      {/* Background */}
      <div className="fixed inset-0 -z-10 bg-[#020617]" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(900px_circle_at_50%_0%,rgba(59,130,246,0.18),transparent_55%),radial-gradient(700px_circle_at_80%_20%,rgba(236,72,153,0.12),transparent_55%),radial-gradient(900px_circle_at_20%_80%,rgba(34,197,94,0.08),transparent_55%)]" />

      <div className="flex min-h-screen">
        {/* Desktop sidebar (hidden on mobile) */}
        <aside
          className={`hidden md:flex border-r border-white/5 bg-white/[0.03] backdrop-blur-2xl flex-col transition-all duration-200 ${
            sidebarCollapsed ? "w-20 p-4" : "w-72 p-6"
          }`}
        >
          <SidebarContent />
        </aside>

        {/* Mobile drawer sidebar */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-[200] md:hidden">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="absolute left-0 top-0 h-full w-[85%] max-w-[320px] border-r border-white/10 bg-[#0b1220]/95 backdrop-blur-2xl p-5 flex flex-col">
              <SidebarContent isMobile />
            </div>
          </div>
        )}

        {/* Main */}
        <main className="flex-1 flex flex-col items-center px-3 sm:px-6 py-5 sm:py-10">
          <div className="w-full max-w-4xl flex-1">
            {/* Chat panel */}
            <div className="h-full rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl shadow-[0_0_60px_rgba(0,0,0,0.55)] overflow-hidden flex flex-col">
              {/* Top bar */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/5">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Mobile menu */}
                  <button
                    className="md:hidden h-9 w-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-white/70 hover:bg-white/10 transition"
                    onClick={() => setMobileSidebarOpen(true)}
                    aria-label="Open sidebar"
                    title="Menu"
                  >
                    <Menu size={18} />
                  </button>

                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-white/90">
                      {activeChat?.messages.length
                        ? activeChat.title
                        : "HumanKindAI"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages area */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
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
                        Start a conversation.
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
                      className={`max-w-[90%] sm:max-w-[78%] rounded-2xl px-4 py-3 whitespace-pre-wrap border shadow-sm ${
                        msg.role === "user"
                          ? "bg-gradient-to-br from-blue-600/30 to-blue-500/10 border-blue-400/20 text-white/90 shadow-blue-500/10"
                          : "bg-white/[0.055] border-white/10 text-white/85"
                      }`}
                    >
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

          {/* Composer (premium) */}
          {activeChat && (
            <div className="w-full max-w-4xl mt-4 sm:mt-5">
              <div className="rounded-2xl bg-[linear-gradient(90deg,rgba(59,130,246,0.35),rgba(236,72,153,0.22),rgba(34,197,94,0.12))] p-[1px] shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
                <div className="rounded-2xl border border-white/10 bg-[#0b1220]/60 backdrop-blur-xl p-2 focus-within:ring-2 focus-within:ring-blue-500/30">
                  <div className="flex items-end gap-2">
                    <textarea
                      className="min-h-[56px] flex-1 resize-none bg-transparent px-3 py-3 text-white/90 placeholder:text-white/35 outline-none"
                      rows={2}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendText();
                        }
                      }}
                      placeholder="Write a message"
                    />

                    <button
                      onClick={sendText}
                      disabled={loading || !input.trim()}
                      className="h-[56px] w-[56px] rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/25 hover:bg-blue-500 hover:shadow-blue-500/30 disabled:opacity-50 disabled:hover:bg-blue-600 transition active:scale-[0.98] flex items-center justify-center"
                      aria-label="Send"
                      title="Send"
                    >
                      <SendHorizonal size={18} />
                    </button>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-2 px-1 pb-1">
                    {["Summarize", "Make it kinder", "Give 3 options"].map(
                      (t) => (
                        <button
                          key={t}
                          onClick={() =>
                            setInput((prev) => (prev ? prev + " " + t : t))
                          }
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/65 hover:bg-white/10 transition"
                        >
                          {t}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Apps Modal */}
        {showApps && (
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
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

        {/* Delete Modal */}
        {deleteTargetId && (
          <div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
            onClick={() => setDeleteTargetId(null)}
          >
            <div
              className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0b1220]/95 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold text-white/90">
                    Delete chat?
                  </h3>
                  <button
                    onClick={() => setDeleteTargetId(null)}
                    className="h-9 w-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-white/60 hover:bg-white/10 hover:text-white transition"
                    aria-label="Close"
                  >
                    <X size={16} />
                  </button>
                </div>

                <p className="mt-3 text-sm text-white/60">
                  This will delete{" "}
                  <span className="font-semibold text-white/80">
                    {chats.find((c) => c.id === deleteTargetId)?.title ??
                      "this chat"}
                  </span>
                  .
                </p>
                <p className="mt-2 text-xs text-white/35">
                  This action can’t be undone.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-white/10 px-6 py-4">
                <button
                  onClick={() => setDeleteTargetId(null)}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteChat}
                  className="rounded-full bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-500 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rename Modal */}
        {renameTargetId && (
          <div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
            onClick={() => setRenameTargetId(null)}
          >
            <div
              className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0b1220]/95 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold text-white/90">
                    Rename chat
                  </h3>
                  <button
                    onClick={() => setRenameTargetId(null)}
                    className="h-9 w-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-white/60 hover:bg-white/10 hover:text-white transition"
                    aria-label="Close"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="mt-4">
                  <label className="text-xs text-white/45">Chat name</label>
                  <input
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") confirmRenameChat();
                    }}
                    className="mt-2 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white/90 placeholder:text-white/35 outline-none focus:ring-2 focus:ring-blue-500/30"
                    placeholder="Untitled"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-white/10 px-6 py-4">
                <button
                  onClick={() => setRenameTargetId(null)}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRenameChat}
                  className="rounded-full bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500 transition"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}