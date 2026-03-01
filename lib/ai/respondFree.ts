import type { Mode } from "./modes";

export function respondFree(mode: Mode, _userText: string) {
  switch (mode) {
    case "pause":
      return `I’m sensing a lot of intensity here.

Before you send or react—want to pause for 60 seconds?

Choose one:
1) Draft it here (safe draft, not sending)
2) Rewrite it calmer
3) Tell me the outcome you want (what you *actually* want to happen)`;

    case "ground":
      return `Let’s slow everything down for 20 seconds.

Try this with me:
Inhale 4 seconds… hold 2… exhale 6.
Do that 3 times.

Now: what’s the biggest feeling right this second—fear, pressure, or uncertainty?`;

    case "reflect":
      return `I hear how heavy this feels.

Before we solve anything—can I check:
What happened right before you started feeling this way?

One sentence is enough.`;

    case "safety":
      return `I’m really sorry you’re feeling this way.

If you’re in immediate danger or might hurt yourself, please reach out to someone right now (a trusted person nearby, or your local emergency number).

If you tell me what country you’re in, I can suggest the right crisis resources.

For this moment: are you safe right now—yes or no?`;

    case "normal":
    default:
      return `I’m here.

What’s going on—what happened, and what do you need most right now: clarity, calm, or a plan?`;
  }
}