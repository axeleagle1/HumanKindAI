export type Mode =
  | "greeting"
  | "normal"
  | "pause"
  | "ground"
  | "reflect"
  | "safety";

function hasAny(t: string, list: string[]) {
  return list.some((k) => t.includes(k));
}

function capsIntensity(text: string) {
  const letters = text.replace(/[^A-Za-z]/g, "");
  if (letters.length < 12) return false;
  const upper = letters.replace(/[^A-Z]/g, "").length;
  return upper / letters.length >= 0.7;
}

export function detectModeFree(text: string): { mode: Mode; reason: string } {
  const raw = text || "";
  const t = raw.toLowerCase().trim();

  // ---------------------------
  // Manual override tags (optional)
  // ---------------------------
  // Supports: [MODE:PAUSE] blah blah
  const manual = t.match(/^\[mode:(greeting|normal|pause|ground|reflect|safety)\]/i);
  if (manual?.[1]) {
    const m = manual[1].toLowerCase() as Mode;
    return { mode: m, reason: "manual mode" };
  }

  // ---------------------------
  // Greeting detection (FIRST)
  // Only trigger if message is basically just a greeting.
  // ---------------------------
  const greetingExact = new Set([
    "hi",
    "hey",
    "hello",
    "yo",
    "sup",
    "hiya",
    "hey there",
    "hello there",
    "good morning",
    "good afternoon",
    "good evening",
  ]);

  // normalize small punctuation (e.g. "hi!", "hey.")
  const tNoPunct = t.replace(/[!.?,]+$/g, "").trim();
  if (greetingExact.has(tNoPunct)) {
    return { mode: "greeting", reason: "simple greeting" };
  }

  // If message is extremely short and contains greeting word only
  if (
    t.length <= 12 &&
    (t.includes("hi") || t.includes("hey") || t.includes("hello")) &&
    !t.includes("i feel") &&
    !t.includes("im ") &&
    !t.includes("i'm ")
  ) {
    return { mode: "greeting", reason: "short greeting" };
  }

  // ---------------------------
  // SAFETY (keep cautious; keyword-based is imperfect)
  // ---------------------------
  const safety = [
    "suicide",
    "kill myself",
    "end it",
    "end my life",
    "self harm",
    "self-harm",
    "hurt myself",
    "i want to die",
    "i dont want to live",
    "i don't want to live",
    "i should die",
    "no reason to live",
    "overdose",
    "od",
    "cut myself",
    "cutting myself",
    "i might hurt myself",
  ];
  if (hasAny(t, safety)) return { mode: "safety", reason: "self-harm keywords" };

  // ---------------------------
  // PAUSE / CONFLICT / IMPULSIVE
  // ---------------------------
  const pause = [
    "i will text",
    "i'm going to text",
    "im going to text",
    "i will message",
    "i'm going to message",
    "im going to message",
    "send this",
    "reply to",
    "i'm about to",
    "im about to",
    "i swear",
    "i can't take it",
    "i cant take it",
    "i'm done",
    "im done",
    "i'm gonna say",
    "im gonna say",
    "i'll tell them",
    "ill tell them",
    "i want to explode",
    "i'm furious",
    "im furious",
    "so mad",
    "pissed",
    "angry",
    "rage",
    "my ex",
    "my boss",
    "my manager",
    "my girlfriend",
    "my boyfriend",
    "my wife",
    "my husband",
    "shut up",
    "you never",
    "you always",
    "i hate you",
    "leave me alone",
    "f***",
    "fuck",
    "bitch",
    "stupid",
    "idiot",
  ];

  const punctuationHot = /!{3,}|\?{3,}|\.{4,}/.test(raw);
  const bigAngerCombo =
    (t.includes("angry") || t.includes("mad") || t.includes("furious")) &&
    (t.includes("text") || t.includes("message") || t.includes("reply") || t.includes("send"));

  if (hasAny(t, pause) || punctuationHot || capsIntensity(raw) || bigAngerCombo) {
    return { mode: "pause", reason: "high intensity / conflict cues" };
  }

  // ---------------------------
  // GROUND / ANXIETY / PANIC
  // ---------------------------
  const ground = [
    "panic",
    "panicking",
    "anxious",
    "anxiety",
    "can't breathe",
    "cant breathe",
    "tight chest",
    "heart racing",
    "racing thoughts",
    "overthinking",
    "overwhelmed",
    "shaking",
    "dizzy",
    "nervous",
    "doom",
    "doomed",
    "i can't sleep",
    "cant sleep",
    "i feel unsafe",
    "spiraling",
    "spiralling",
    "stress",
    "stressed",
    "i feel like i'm dying",
    "i feel like im dying",
    "my mind won't stop",
    "my mind wont stop",
  ];
  if (hasAny(t, ground)) return { mode: "ground", reason: "anxiety / overwhelm cues" };

  // ---------------------------
  // REFLECT / SADNESS / SHAME
  // ---------------------------
  const reflect = [
    "worthless",
    "i hate myself",
    "i'm a failure",
    "im a failure",
    "depressed",
    "sad",
    "hopeless",
    "tired of this",
    "i'm not enough",
    "im not enough",
    "i messed up",
    "i messed up again",
    "embarrassed",
    "guilty",
    "ashamed",
    "empty",
    "nobody cares",
    "no one cares",
    "i feel alone",
    "lonely",
    "heartbroken",
    "i can't do this",
    "i cant do this",
    "i feel broken",
    "i'm exhausted",
    "im exhausted",
  ];
  if (hasAny(t, reflect)) return { mode: "reflect", reason: "sadness / shame cues" };

  return { mode: "normal", reason: "default" };
}