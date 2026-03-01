"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const TARGET_BASE = "https://kinderai.vercel.app";

// ✅ Suggestion: toggle if you want "Launch Chat" to open in a new tab
const OPEN_IN_NEW_TAB = false;

// ✅ Suggestion: keep paths in one place
const CHAT_PATH = "/chat";
const LOGIN_PATH = "/login"; // change if your app uses a different login route

function isLikelyDesktop() {
  if (typeof window === "undefined") return false;
  const finePointer =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(pointer:fine)").matches;
  const wide = window.innerWidth >= 900;
  return finePointer && wide;
}

export default function Home() {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const chips = useMemo(
    () => ["De-escalate", "Get clarity", "Decide", "Communicate"],
    []
  );

  useEffect(() => {
    // OpenAI-like touch: autofocus on desktop, but avoid popping iPhone keyboard.
    if (isLikelyDesktop()) {
      inputRef.current?.focus();
    }
  }, []);

  // ✅ Suggestion: safer URL building + optional new-tab behavior
  const go = (value?: string) => {
    if (typeof window === "undefined") return;

    const text = (value ?? input).trim();

    const url = new URL(TARGET_BASE);
    // ensure correct path join
    url.pathname = `${url.pathname.replace(/\/$/, "")}${CHAT_PATH}`;

    if (text) url.searchParams.set("prompt", text);

    if (OPEN_IN_NEW_TAB) {
      window.open(url.toString(), "_blank", "noopener,noreferrer");
      return;
    }

    // Cross-domain redirect (works exactly like you want)
    window.location.assign(url.toString());
  };

  const goLogin = () => {
    if (typeof window === "undefined") return;

    const url = new URL(TARGET_BASE);
    url.pathname = `${url.pathname.replace(/\/$/, "")}${LOGIN_PATH}`;

    if (OPEN_IN_NEW_TAB) {
      window.open(url.toString(), "_blank", "noopener,noreferrer");
      return;
    }

    window.location.assign(url.toString());
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    go();
  };

  return (
    <div className="min-h-screen text-white">
      {/* Background */}
      <div className="fixed inset-0 -z-10 bg-[#020617]" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(900px_circle_at_50%_0%,rgba(59,130,246,0.18),transparent_55%),radial-gradient(700px_circle_at_80%_20%,rgba(236,72,153,0.12),transparent_55%),radial-gradient(900px_circle_at_20%_80%,rgba(34,197,94,0.08),transparent_55%)]" />

      {/* Top nav */}
      <header className="mx-auto w-full max-w-6xl px-5 sm:px-8 pt-5 sm:pt-7 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* ✅ Fix: logo */}
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="h-10 w-10 rounded-2xl bg-white/5 border border-white/10 overflow-hidden shadow-lg"
            aria-label="Go to top"
            title="HumanKindAI"
          >
            <img
              src="/logo.png"
              alt="HumanKindAI"
              className="h-full w-full object-contain"
            />
          </button>

          <div className="font-semibold tracking-tight text-white/90">
            HumanKindAI
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* ✅ Suggestion: make Log in do something */}
          <button
            onClick={goLogin}
            className="text-sm text-white/65 hover:text-white/85 transition"
          >
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

      {/* Hero */}
      <main className="mx-auto w-full max-w-6xl px-5 sm:px-8 pt-16 sm:pt-24 pb-16">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight text-white/95">
            How are you today?
          </h1>

          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-white/55">
            KinderAI helps you move from emotion → clarity → action.
          </p>

          {/* Input */}
          <form onSubmit={onSubmit} className="mt-8 sm:mt-10">
            <div className="mx-auto flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl px-4 py-3 shadow-[0_0_60px_rgba(0,0,0,0.35)]">
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
                title="Send"
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

          {/* Footer */}
          <div className="mt-16 flex items-center justify-between text-xs text-white/35">
            <div>© {new Date().getFullYear()} HumanKindAI</div>

            <div className="flex items-center gap-4">
              {/* ✅ Suggestion: wire these up (choose landing pages or app pages) */}
              <button
                onClick={() => window.location.assign("/privacy")}
                className="hover:text-white/55 transition"
              >
                Privacy
              </button>
              <button
                onClick={() => window.location.assign("/terms")}
                className="hover:text-white/55 transition"
              >
                Terms
              </button>
              <button
                onClick={() => window.location.assign("/contact")}
                className="hover:text-white/55 transition"
              >
                Contact
              </button>

              {/* If you prefer these to go to the app instead, swap to:
                  onClick={() => window.location.assign(`${TARGET_BASE}/privacy`)}
               */}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}