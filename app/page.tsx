// app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen text-white bg-gradient-to-br from-black via-[#0a0f1f] to-[#111827]">
      {/* Navbar */}
      <header className="flex items-center justify-between px-6 md:px-10 py-5">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-white/10 border border-white/10 backdrop-blur-md" />
          <span className="font-semibold tracking-wide">HumanKindAI</span>
        </div>

        <nav className="flex items-center gap-3 text-sm">
          <Link
            href="/login"
            className="opacity-70 hover:opacity-100 transition"
          >
            Log in
          </Link>
          <Link
            href="/app"
            className="bg-white text-black px-4 py-2 rounded-full font-medium hover:opacity-90 transition"
          >
            Try KinderAI
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <main className="px-6 md:px-10">
        <div className="mx-auto max-w-3xl pt-16 md:pt-24 pb-16 md:pb-24 text-center">
          <div className="mx-auto mb-6 h-12 w-12 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md flex items-center justify-center">
            <div className="h-6 w-6 rounded-full bg-white/20" />
          </div>

          <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
            What do you need help with?
          </h1>

          <p className="mt-4 text-gray-400">
            <span className="text-white/80 font-medium">KinderAI</span> guides you
            step-by-step from emotion → clarity → action.
          </p>

          <PromptBar />

          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Chip label="De-escalate" template="I’m feeling overwhelmed because " />
            <Chip label="Clarify" template="Here’s the situation: " />
            <Chip label="Decide" template="Help me choose between A and B: " />
            <Chip
              label="Communicate"
              template="Rewrite this to be clear and kind: "
            />
          </div>

          <p className="mt-8 text-xs text-white/40">
            Private by default.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 md:px-10 pb-8">
        <div className="mx-auto max-w-3xl flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <span>© {new Date().getFullYear()} HumanKindAI</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-white/70 transition">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white/70 transition">
              Terms
            </Link>
            <Link href="/contact" className="hover:text-white/70 transition">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function PromptBar() {
  // Keep it server component friendly by using a plain <form> that routes to /app
  // We’ll handle chip click using query params too.
  return (
    <form action="/app" method="GET" className="mt-10">
      <div className="relative mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_0_60px_rgba(120,90,255,0.12)]">
        <input
          name="prompt"
          placeholder="Type what’s on your mind..."
          className="w-full bg-transparent px-6 py-5 pr-14 text-base md:text-lg placeholder:text-white/30 focus:outline-none"
          autoComplete="off"
        />
        <button
          type="submit"
          className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white text-black font-semibold hover:opacity-90 transition flex items-center justify-center"
          aria-label="Go"
        >
          →
        </button>
      </div>
    </form>
  );
}

function Chip({ label, template }: { label: string; template: string }) {
  // Chip routes to /app with a prefilled prompt template
  const href = `/app?prompt=${encodeURIComponent(template)}`;

  return (
    <Link
      href={href}
      className="px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition text-sm"
    >
      {label}
    </Link>
  );
}