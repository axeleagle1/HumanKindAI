export type Mode = "normal" | "pause" | "ground" | "reflect" | "safety";

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

  // Manual override tags (optional)
  if (t.startsWith("[mode:pause]")) return { mode: "pause", reason: "manual mode" };
  if (t.startsWith("[mode:ground]")) return { mode: "ground", reason: "manual mode" };
  if (t.startsWith("[mode:reflect]")) return { mode: "reflect", reason: "manual mode" };
  if (t.startsWith("[mode:safety]")) return { mode: "safety", reason: "manual mode" };
  if (t.startsWith("[mode:normal]")) return { mode: "normal", reason: "manual mode" };

  // SAFETY (keep cautious; keyword-based is imperfect)
  const safety = [
    "suicide", "kill myself", "end it", "end my life", "self harm", "self-harm", "hurt myself",
    "i want to die", "i dont want to live", "i don't want to live", "i should die", "no reason to live",
    "overdose", "cut myself", "cutting myself", "i might hurt myself",
  ];
  if (hasAny(t, safety)) return { mode: "safety", reason: "self-harm keywords" };

  // PAUSE / CONFLICT / IMPULSIVE
  const pause = [
    "i will text", "i'm going to text", "im going to text", "i will message", "i'm going to message",
    "send this", "reply to", "i'm about to", "im about to", "i swear", "i can't take it", "i cant take it",
    "i'm done", "im done", "i'm gonna say", "im gonna say", "i'll tell them", "ill tell them",
    "i want to explode", "i'm furious", "im furious", "so mad", "pissed", "angry", "rage",
    "my ex", "my boss", "my manager", "my girlfriend", "my boyfriend", "my wife", "my husband",
    "shut up", "you never", "you always", "i hate you", "leave me alone",
    "f***", "fuck", "bitch", "stupid", "idiot",
  ];
  const punctuationHot = /!{3,}|\?{3,}|\.{4,}/.test(raw);
  if (hasAny(t, pause) || punctuationHot || capsIntensity(raw)) {
    return { mode: "pause", reason: "high intensity / conflict cues" };
  }

  // GROUND / ANXIETY / PANIC
  const ground = [
    "panic", "panicking", "anxious", "anxiety", "can't breathe", "cant breathe", "tight chest",
    "heart racing", "racing thoughts", "overthinking", "overwhelmed", "shaking", "dizzy",
    "nervous", "doom", "doomed", "i can't sleep", "cant sleep", "i feel unsafe", "spiraling",
    "spiralling", "stress", "stressed", "i feel like i'm dying", "i feel like im dying",
  ];
  if (hasAny(t, ground)) return { mode: "ground", reason: "anxiety / overwhelm cues" };

  // REFLECT / SADNESS / SHAME
  const reflect = [
    "worthless", "i hate myself", "i'm a failure", "im a failure", "depressed", "sad", "hopeless",
    "tired of this", "i'm not enough", "im not enough", "i messed up", "i messed up again",
    "embarrassed", "guilty", "ashamed", "empty", "nobody cares", "no one cares",
    "i feel alone", "lonely", "heartbroken", "i can't do this", "i cant do this",
    "i feel broken", "i'm exhausted", "im exhausted",
  ];
  if (hasAny(t, reflect)) return { mode: "reflect", reason: "sadness / shame cues" };

  return { mode: "normal", reason: "default" };
}