import { detectModeFree } from "../../../lib/ai/modes";
import { respondFree } from "../../../lib/ai/respondFree";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return Response.json({ reply: "Message is required." }, { status: 400 });
    }

    // optional: small delay
    await new Promise((r) => setTimeout(r, 350));

    const { mode, reason } = detectModeFree(message);
    const payload = respondFree(mode, message);

    console.log("MODE:", mode, "| REASON:", reason);

    // Your frontend already reads `reply` — keep it.
    // Add quickReplies for the UX buttons.
    return Response.json({
      reply: payload.reply,
      quickReplies: payload.quickReplies,
      mode,
      reason,
    });
  } catch (error) {
    console.error("Chat API Error:", error);
    return Response.json({ reply: "Something went wrong." }, { status: 500 });
  }
}