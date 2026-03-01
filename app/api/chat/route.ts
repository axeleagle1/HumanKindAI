import { detectModeFree } from "../../../lib/ai/modes";
import { respondFree } from "../../../lib/ai/respondFree";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    // Validate input
    if (!message || typeof message !== "string") {
      return Response.json(
        { reply: "Message is required." },
        { status: 400 }
      );
    }

    // Optional delay so it feels natural (typing effect)
    await new Promise((r) => setTimeout(r, 500));

    // Detect emotional mode (free keyword-based version)
    const { mode, reason } = detectModeFree(message);

    // Generate response based on detected mode
    const reply = respondFree(mode, message);

    // Helpful for debugging in terminal
    console.log("MODE:", mode, "| REASON:", reason);

    // Return response (keeps your frontend working)
    return Response.json({
      reply,
      mode,
      reason,
    });

  } catch (error) {
    console.error("Chat API Error:", error);

    return Response.json(
      { reply: "Something went wrong." },
      { status: 500 }
    );
  }
}