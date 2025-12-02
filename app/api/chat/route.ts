import { google } from "@ai-sdk/google";
import { convertToModelMessages, streamText } from "ai";
import { getServerSession } from "next-auth";

export async function POST(req: Request) {
  //session
  const session = await getServerSession();

  const user = session?.user;
  const name = user?.name || "Guest";

  const { messages } = await req.json();
  const lastUserMessage = messages[messages.length - 1]?.content ?? "";

  //ai
  let ragContent = "";

  if (session) {
    //waley pa
  }

  //default
  //create a prommpt
  const systemPrompt = !session
    ? `
  You are StudyBuddy, a friendly virtual tutor. The user is not logged in, so politely explain that 
  signing in will unlock:
  - Personalized Tutoring and chat experience.
  - Answer based on their uploaded documents (RAG)`
    : ``;

  const result = streamText({
    model: google("gemini-2.5-flash"),
    messages: convertToModelMessages(messages),
    system: systemPrompt,
    maxOutputTokens: session ? 1000 : 300,
  });

  return result.toUIMessageStreamResponse();
}
