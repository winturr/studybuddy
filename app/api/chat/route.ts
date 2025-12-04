import { google } from "@ai-sdk/google";
import { streamText, convertToModelMessages } from "ai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import { embed } from "ai";
import prisma from "@/app/lib/prisma";

// Minimum similarity threshold - chunks below this are likely not relevant
const SIMILARITY_THRESHOLD = 0.35;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  const name = user?.name || "Guest";

  const { messages } = await req.json();

  // Get the last few user messages for better context understanding
  const recentUserMessages = messages
    .filter((m: any) => m.role === "user")
    .slice(-3)
    .map((m: any) => m.content)
    .join(" ");

  const lastUserMessage = messages[messages.length - 1]?.content ?? "";

  // -------------------------------------
  // 1. If logged in -> run RAG retrieval
  // -------------------------------------
  let ragContext = "";
  let sourceFiles: string[] = [];

  if (session && user?.id) {
    // 1.1 Create embedding for the user's query (use recent context for better retrieval)
    const queryForEmbedding = recentUserMessages || lastUserMessage;
    const queryEmbedding = await embed({
      model: google.textEmbedding("text-embedding-004"),
      value: queryForEmbedding,
    });

    const vectorString = JSON.stringify(queryEmbedding.embedding);

    // 1.2 Vector similarity search - get top 2 chunks from EACH file to ensure all files are represented
    // Uses window function to rank chunks within each file, then takes top 2 per file
    const results = await prisma.$queryRaw<
      {
        content: string;
        metadata: any;
        similarity: number;
        fileName: string;
      }[]
    >`
      WITH ranked_chunks AS (
        SELECT 
          e."content",
          e."metadata",
          1 - (e."vector" <=> ${vectorString}::vector) as similarity,
          f."name" as "fileName",
          ROW_NUMBER() OVER (PARTITION BY f."id" ORDER BY e."vector" <=> ${vectorString}::vector) as rank
        FROM "Embedding" e
        INNER JOIN "File" f ON e."fileId" = f."id"
        WHERE f."userId" = ${user.id} 
          AND f."status" = 'COMPLETED'
      )
      SELECT "content", "metadata", similarity, "fileName"
      FROM ranked_chunks
      WHERE rank <= 2 AND similarity > ${SIMILARITY_THRESHOLD}
      ORDER BY similarity DESC
      LIMIT 12;
    `;

    // 1.3 Combine retrieved chunks with source attribution
    if (results.length > 0) {
      sourceFiles = [...new Set(results.map((r) => r.fileName))];
      ragContext = results
        .map(
          (r, i) =>
            `[Source: ${r.fileName} | Relevance: ${(r.similarity * 100).toFixed(
              0
            )}%]\n${r.content}`
        )
        .join("\n\n---\n\n");
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
    NEVER DISCLOSE THAT YOU ARE A LANGUAGE MODEL OR AI, as that is not relevant to your role. Instead, roleplay like you were created for the terminal.
  `
    : `You are Grol-b3rt, a helpful virtual tutor for the user named ${name}. You have a helpful, calm personality.
    
    CRITICAL WRITING STYLE RULES - YOU MUST FOLLOW THESE:
    1. Write in normal lowercase text like a regular person. Never write words in ALL CAPS.
    2. Bad example: "HELLO! I AM GROL-B3RT AND I AM HERE TO HELP!"
    3. Good example: "Hello! I'm GROL-B3RT and I'm here to help!"
    4. Use proper sentence capitalization only (first letter of sentences, proper nouns).
    5. Write in a friendly, conversational tone.
    6. Use paragraphs and bullet points for clarity.
    
    IMPORTANT INSTRUCTIONS FOR USING CONTEXT:
    1. You have access to the user's uploaded study materials below.
    2. When answering questions, ALWAYS check the RAG context first for relevant information.
    3. If the context contains relevant information, use it to provide accurate, specific answers.
    4. Cite which file the information comes from when referencing the context.
    5. If the context doesn't contain relevant information for the question, you may answer from general knowledge but mention that the answer isn't from their documents.
    6. If no documents are uploaded yet, encourage the user to upload their study materials.
    7. DO NOT answer questions solely from your general knowledge if relevant information is available in the user's documents. Rely on the documents.
    8. DO NOT answer questions that are not present in the files given by the user, DO NOT USE GENERAL KNOWLEDGE.
    9. NEVER DISCLOSE THAT YOU ARE A LANGUAGE MODEL OR AI, as that is not relevant to your role. Instead, roleplay like you were created for the terminal.

    ${
      sourceFiles.length > 0
        ? `\nFiles available: ${sourceFiles.join(", ")}`
        : ""
    }
    i
    --- RAG CONTEXT FROM USER'S DOCUMENTS ---
    ${ragContext || "No relevant content found in uploaded documents."}
    --- END OF CONTEXT ---
    
    Remember: Prioritize information from the user's documents when available.`;

  const result = streamText({
    model: google("gemini-2.5-flash"),
    messages: convertToModelMessages(messages),
    system: systemPrompt,
    maxOutputTokens: session ? 5000 : 1000,
  });

  return result.toUIMessageStreamResponse();
}
