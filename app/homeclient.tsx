"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const TARGET_BASE = "https://kinderai.vercel.app";

function isLikelyDesktop() {
  if (typeof window === "undefined") return false;
  const finePointer =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(pointer:fine)").matches;
  const wide = window.innerWidth >= 900;
  return finePointer && wide;
}

export default function HomeClient() {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const chips = useMemo(
    () => ["Regulate", "Reflect", "Decide", "Communicate"],
    []
  );

  useEffect(() => {
    if (isLikelyDesktop()) inputRef.current?.focus();
  }, []);

  const go = (value?: string) => {
    const text = (value ?? input).trim();
    const url = `${TARGET_BASE}/chat${
      text ? `?prompt=${encodeURIComponent(text)}` : ""
    }`;
    window.location.assign(url);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    go();
  };

  return (
    <div className="min-h-screen text-white relative">
      {/* Background */}
      <div className="fixed inset-0 -z-10 bg-[#020617]" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(900px_circle_at_50%_0%,rgba(59,130,246,0.18),transparent_55%),radial-gradient(700px_circle_at_80%_20%,rgba(236,72,153,0.12),transparent_55%),radial-gradient(900px_circle_at_20%_80%,rgba(34,197,94,0.08),transparent_55%)]" />

      {/* Top nav */}
      <header className="mx-auto w-full max-w-6xl px-5 sm:px-8 pt-5 sm:pt-7 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-white/5 border border-white/10 overflow-hidden shadow-lg">
            <img
              src="/logo.png"
              alt="HumanKindAI"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="font-semibold tracking-tight text-white/90">
            HumanKindAI
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="text-sm text-white/65 hover:text-white/85 transition">
            Log in
          </button>

          <button
            onClick={() => go("")}
            className="rounded-full bg-white text-[#0b1220] px-4 py-2 text-sm font-semibold hover:bg-white/90 transition"
          >
            Try KinderAI
          </button>
        </div>
      </header>

      {/* Hero - Slightly Lower Than Center */}
      <main className="mx-auto w-full max-w-6xl px-5 sm:px-8 flex items-center justify-center min-h-screen pt-10 sm:pt-16">
        <div className="mx-auto max-w-2xl text-center -mt-10 sm:-mt-14">
          <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight text-white/95">
            How are you today?
          </h1>

          {/* Input */}
          <form onSubmit={onSubmit} className="mt-8 sm:mt-10">
            <div className="mx-auto flex items-center gap-2 rounded-2xl border border-white/10 bg-white/4 backdrop-blur-2xl px-4 py-3 shadow-[0_0_60px_rgba(0,0,0,0.35)]">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tell me what’s on your mind…"
                className="w-full bg-transparent outline-none text-white/90 placeholder:text-white/35"
                aria-label="Prompt"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className={`h-10 w-10 rounded-full flex items-center justify-center transition ${
                  input.trim()
                    ? "bg-white text-[#0b1220] hover:bg-white/90"
                    : "bg-white/10 text-white/30 cursor-not-allowed"
                }`}
                aria-label="Send"
              >
                →
              </button>
            </div>

            {/* Chips */}
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {chips.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => go(c)}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 hover:bg-white/10 transition"
                >
                  {c}
                </button>
              ))}
            </div>
          </form>
        </div>
      </main>

      {/* Bottom Left */}
      <div className="fixed bottom-4 left-6 text-xs text-white/35">
        © {new Date().getFullYear()} HumanKindAI
      </div>

      {/* Bottom Right */}
      <div className="fixed bottom-4 right-6 flex items-center gap-4 text-xs text-white/35">
        <button className="hover:text-white/55 transition">Privacy</button>
        <button className="hover:text-white/55 transition">Terms</button>
        <button className="hover:text-white/55 transition">Contact</button>
      </div>
    </div>
  );
}