export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return Response.json({ reply: "Message is required." }, { status: 400 });
    }

    // Simulate delay so typing feels real
    await new Promise((r) => setTimeout(r, 700));

    const reply =
      "I hear you. That sounds important.\n\n" +
      "Tell me more about what you're feeling right now.";

    return Response.json({ reply });
  } catch (error) {
    console.error(error);
    return Response.json(
      { reply: "Something went wrong." },
      { status: 500 }
    );
  }
}