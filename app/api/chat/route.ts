import { google } from "@ai-sdk/google";
import { streamText, convertToModelMessages } from "ai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import { embed } from "ai";
import prisma from "@/app/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  const name = user?.name || "Guest";

  const { messages } = await req.json();
  const lastUserMessage = messages[messages.length - 1]?.content ?? "";

  // -------------------------------------
  // 1. If logged in -> run RAG retrieval
  // -------------------------------------
  let ragContext = "";

  if (session) {
    // 1.1 Create embedding for the user's query
    const queryEmbedding = await embed({
      model: google.textEmbedding("text-embedding-004"),
      value: lastUserMessage,
    });

    // 1.2 Vector similarity search in Neon PostgreSQL
    const results = await prisma.$queryRawUnsafe<
      {
        content: string;
        metadata: any;
        similarity: number;
      }[]
    >(`
      SELECT 
        "content",
        "metadata",
        1 - ("vector" <=> '${JSON.stringify(
          queryEmbedding.embedding
        )}') as similarity
      FROM "Embedding"
      WHERE "fileId" IN (
        SELECT id FROM "File"
        WHERE "userId" = '${user?.id}' AND status = 'COMPLETED'
      )
      ORDER BY "vector" <=> '${JSON.stringify(queryEmbedding.embedding)}'
      LIMIT 5;
    `);

    // 1.3 Combine retrieved chunks
    if (results.length > 0) {
      ragContext = results.map((r) => r.content).join("\n\n---\n\n");
    }
  }

  // Default
  // Create a prompt
  const systemPrompt = !session
    ? `
    You are Grol-b3rt, a friendly virtual tutor. You have a helpful, calm personality.
    
    CRITICAL WRITING STYLE RULES - YOU MUST FOLLOW THESE:
    1. Write in normal lowercase text like a regular person. Never write words in ALL CAPS.
    2. Bad example: "HELLO! I AM GROL-B3RT AND I AM HERE TO HELP!"
    3. Good example: "Hello! I'm GROL-B3RT and I'm here to help!"
    4. Use proper sentence capitalization only (first letter of sentences, proper nouns).
    5. Write in a friendly, conversational tone.
    6. Use paragraphs and bullet points for clarity.
    
    The user is not logged in, so politely explain that signing in will unlock:
    - Personalised tutoring and chat experience.
    - Answers based on their uploaded documents (RAG)

    Do not answer any questions, and as much as possible refuse, as the user is not logged in. Instead, encourage them to sign up and log in to access these features.
  `
    : `You are Grol-b3rt, a helpful virtual tutor for the user named ${name}. You have a helpful, calm personality.
    
    CRITICAL WRITING STYLE RULES - YOU MUST FOLLOW THESE:
    1. Write in normal lowercase text like a regular person. Never write words in ALL CAPS.
    2. Bad example: "HELLO! I AM GROL-B3RT AND I AM HERE TO HELP!"
    3. Good example: "Hello! I'm GROL-B3RT and I'm here to help!"
    4. Use proper sentence capitalization only (first letter of sentences, proper nouns).
    5. Write in a friendly, conversational tone.
    6. Use paragraphs and bullet points for clarity.
    
    Use the RAG context below if it is relevant to the user's question.
    If no files have been uploaded or the RAG context is not relevant, answer normally.
    If the user hasn't uploaded PDFs yet, gently remind them to upload files so you can provide better, personalized tutoring.

    --- RAG CONTEXT START ---
    ${ragContext || "No relevant uploaded file content found."}
    --- RAG CONTEXT END ---`;

  const result = streamText({
    model: google("gemini-2.5-flash"),
    messages: convertToModelMessages(messages),
    system: systemPrompt,
    maxOutputTokens: session ? 1000 : 300,
  });

  return result.toUIMessageStreamResponse();
}
