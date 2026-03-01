export type Mode = "normal" | "pause" | "ground" | "reflect" | "safety";

export function detectModeFree(text: string): { mode: Mode; reason: string } {
  const t = text.toLowerCase();

  const safety = ["suicide", "kill myself", "end it", "self harm", "hurt myself"];
  if (safety.some((k) => t.includes(k))) {
    return { mode: "safety", reason: "self-harm keywords" };
  }

  const pause = ["i will text", "i'm going to text", "send this", "reply to", "my ex", "my boss", "i hate", "i'm done", "f***", "fuck", "shut up"];
  if (pause.some((k) => t.includes(k)) || /!{3,}/.test(text) || (text === text.toUpperCase() && text.length > 10)) {
    return { mode: "pause", reason: "high intensity or conflict cues" };
  }

  const anxiety = ["panic", "anxious", "can't breathe", "heart racing", "overthinking", "scared", "i can't sleep"];
  if (anxiety.some((k) => t.includes(k))) {
    return { mode: "ground", reason: "anxiety cues" };
  }

  const sadness = ["worthless", "i hate myself", "i'm a failure", "depressed", "sad", "hopeless", "tired of this"];
  if (sadness.some((k) => t.includes(k))) {
    return { mode: "reflect", reason: "sadness/shame cues" };
  }

  return { mode: "normal", reason: "default" };
}