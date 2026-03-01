import type { Mode } from "./modes";

export type BotPayload = {
  reply: string;
  quickReplies: string[];
};

function pick(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function isShortNeutral(text: string) {
  const t = (text || "").toLowerCase().trim();

  // Very short / neutral / filler inputs
  const exact = new Set([
    "ok",
    "okay",
    "kk",
    "k",
    "alright",
    "aight",
    "yeah",
    "yea",
    "yup",
    "nah",
    "no",
    "yes",
    "sure",
    "hmm",
    "hm",
    "uh",
    "uhh",
    "idk",
    "i dunno",
    "dont know",
    "don't know",
    "maybe",
    "fine",
    "good",
    "nice",
    "cool",
    "bet",
    "word",
    "lol",
    "lmao",
    "bruh",
  ]);

  if (exact.has(t)) return true;

  // Single emoji / very short
  if (t.length <= 2) return true;

  // Simple emoji-only messages
  if (/^[\p{Emoji}\s]+$/u.test(text)) return true;

  return false;
}

export function respondFree(mode: Mode, userText: string): BotPayload {
  // If the input is short/neutral, keep it light regardless of mode (except safety)
  // This prevents “therapy tone” for messages like "ok", "hmm", "idk", "yeah"
  const shortNeutral = isShortNeutral(userText);

  if (mode !== "safety" && shortNeutral) {
    const replies = [
      `Got it.

No rush. When you’re ready, you can drop a little more context and I’ll stay with you.`,
      `Okay.

We can go slow. If you want, share just one sentence about what’s on your mind.`,
      `All good.

You don’t have to force words. If it helps, tell me whether you want calm, clarity, or a plan.`,
      `I’m here.

Take your time. Even a few words is enough.`,
      `Understood.

If you’re not sure where to start, you can pick one: calm, clarity, or a plan.`,
    ];

    const quickReplies = [
      "I need calm",
      "I need clarity",
      "I need a plan",
      "I don’t know where to start",
      "[MODE:GROUND] I feel anxious",
      "[MODE:PAUSE] I want to message someone",
    ];

    return { reply: pick(replies), quickReplies };
  }

  switch (mode) {
    case "greeting": {
      const replies = [
        `Hey. I’m here.

No pressure — start wherever you want.`,
        `Hi. I’m with you.

Take your time. We can keep it simple.`,
        `Hey.

Whenever you’re ready, I’ll listen.`,
        `Hello.

No rush. You can start with one sentence.`,
      ];

      const quickReplies = [
        "I need calm",
        "I need clarity",
        "I need a plan",
        "I feel overwhelmed",
        "Rewrite something kindly",
      ];

      return { reply: pick(replies), quickReplies };
    }

    case "pause": {
      const replies = [
        `I can feel how charged this is. You’re not wrong for feeling it.

Let’s protect you from a reaction you’ll regret.
Take 60 seconds. No sending, no replying. Just space.

If you want, paste the draft here and I’ll rewrite it calmer and cleaner.`,
        `This looks like a “pause first” moment.

Nothing needs to be sent right now.
A short delay can save you from a long cleanup later.

Drop the message you’re about to send — I’ll help refine it.`,
        `Your emotions are loud for a reason. Something important got hit.

You don’t have to act while it’s this hot.
Let’s slow it down and keep your power.

Draft it here. I’ll help you say it with control.`,
        `I’m here with you. This is intense.

Let’s create a buffer between feeling and action.
One minute of space, then we choose the next move with clarity.

Paste what you were going to send when you’re ready.`,
        `This is the kind of moment where your future self will thank you for waiting.

No drama. No punishment.
Just a calm pause, then a clean response.

Drop the draft here when you’re ready.`,
      ];

      const quickReplies = [
        "I want to calm down first",
        "Here’s my draft (rewrite it)",
        "Make it firm but respectful",
        "Make it shorter and calmer",
        "I want to say nothing for now",
        "[MODE:GROUND] I’m overwhelmed",
      ];

      return { reply: pick(replies), quickReplies };
    }

    case "ground": {
      const replies = [
        `You’re overwhelmed. That makes sense.

Right now the goal is calm, not answers.
One slow breath in. A longer breath out.
Do that three times. Let your body settle.`,
        `This is your nervous system asking for safety.

Feet on the floor.
Jaw unclenched.
Exhale longer than you inhale.

We can think clearly after the alarm quiets down.`,
        `You don’t have to fix everything in this state.

Slow your breathing down.
Loosen your shoulders.
Let the moment pass through you instead of dragging you under.`,
        `I’m here. We’re not rushing.

Small steps.
One breath.
One long exhale.

You’re allowed to slow down without explaining anything yet.`,
        `This is heavy. You’re doing your best.

Let’s ground:
Feel your feet.
Relax your shoulders.
Take one long exhale.

You’re coming back to the present.`,
      ];

      const quickReplies = [
        "Guide me through breathing",
        "I feel panic in my body",
        "I feel overwhelmed",
        "I want silence and space",
        "[MODE:REFLECT] I feel ashamed",
        "[MODE:PAUSE] I want to text someone",
      ];

      return { reply: pick(replies), quickReplies };
    }

    case "reflect": {
      const replies = [
        `I hear how heavy this is.

You’re not “too much.”
You’re a human carrying more than your system can hold right now.

We can hold this gently and untangle it slowly.`,
        `I’m sorry you’re in this headspace.

This feeling is real, and it deserves kindness.
No judgment here. No pressure.

We’ll take it one piece at a time.`,
        `That pain makes sense.

You don’t need to earn compassion by being “okay.”
You deserve softness even while you’re messy.

I’m staying with you.`,
        `You’re not broken.

You’re exhausted and hurting.
That deserves care, not criticism.

We can turn this into something clearer and lighter.`,
        `I can feel the weight in this.

You’re allowed to feel it without being swallowed by it.
We can slow down and make it more manageable together.`,
      ];

      const quickReplies = [
        "It’s about relationships",
        "It’s about work/stress",
        "It’s about self-worth",
        "I feel guilty",
        "I feel lonely",
        "[MODE:GROUND] I’m panicking",
      ];

      return { reply: pick(replies), quickReplies };
    }

    case "safety": {
      const replies = [
        `I’m really glad you said this instead of keeping it inside.

Your safety matters more than any conversation.
If you might hurt yourself, please reach out to a real person right now — someone you trust nearby, or your local emergency number.

If you share your country, I can point you to the right crisis resources.`,
        `This is serious, and you shouldn’t have to carry it alone.

If there’s any immediate danger, please contact local emergency services or a trusted person right now.
You deserve support in the room, not just on a screen.`,
        `I’m sorry it has gotten this intense.

Please bring someone in right now — a friend, family member, or emergency support.
You don’t have to fight this alone.`,
      ];

      const quickReplies = [
        "I can contact someone",
        "I’m alone right now",
        "I’m in the Philippines",
        "I’m in the US",
        "I’m in another country",
        "[MODE:GROUND] Help me calm down",
      ];

      return { reply: pick(replies), quickReplies };
    }

    case "normal":
    default: {
      const replies = [
        `I’m here.

No pressure to explain perfectly.
Start messy. We’ll shape it into something clear.`,
        `You’re safe to be honest here.

We can slow it down and make it manageable.
One small piece at a time.`,
        `I’m with you.

You don’t have to carry it alone.
We’ll sort it out gently.`,
        `You’re doing your best.

We can bring calm first, then clarity.
No rush.`,
        `It’s okay if you don’t know what to say yet.

Even a few words is enough.
I’m here with you.`,
      ];

      const quickReplies = [
        "I need clarity",
        "I need calm",
        "I need a plan",
        "I feel overwhelmed",
        "[MODE:PAUSE] I want to message someone",
        "[MODE:REFLECT] I feel ashamed",
      ];

      return { reply: pick(replies), quickReplies };
    }
  }
}