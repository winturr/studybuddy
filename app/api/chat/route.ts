import { google } from "@ai-sdk/google";
import { streamText, convertToModelMessages, generateText } from "ai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import { embed } from "ai";
import prisma from "@/app/lib/prisma";

// Minimum similarity threshold - chunks below this are likely not relevant
const SIMILARITY_THRESHOLD = 0.35;

// Function to extract and save memories from conversation
async function extractAndSaveMemories(
  userId: string,
  userMessage: string,
  assistantResponse: string
) {
  try {
    // Use AI to extract important facts/memories from the conversation
    const extractionPrompt = `Analyze this conversation and extract any important personal facts, preferences, or information about the user that would be useful to remember for future conversations.

User message: "${userMessage}"
Assistant response: "${assistantResponse}"

Rules:
1. Only extract factual information about the user (not about topics they're asking about)
2. Focus on: names, preferences, goals, interests, important dates, relationships, learning style
3. Be concise - each memory should be one clear sentence
4. If there's nothing important to remember, respond with "NONE"
5. Format each memory on a new line, prefixed with category in brackets like: [preference] User prefers visual learning

Respond with only the memories or "NONE":`;

    const result = await generateText({
      model: google("gemini-2.5-flash"),
      prompt: extractionPrompt,
      maxOutputTokens: 500,
    });

    const extractedText = result.text.trim();
    console.log("[Memory Extraction] Extracted text:", extractedText);

    if (extractedText === "NONE" || !extractedText) {
      console.log("[Memory Extraction] No memories to save");
      return;
    }

    // Parse and save memories
    const lines = extractedText.split("\n").filter((line) => line.trim());
    console.log(
      "[Memory Extraction] Found",
      lines.length,
      "potential memories"
    );

    for (const line of lines) {
      // Extract category if present: [category] content
      const categoryMatch = line.match(/^\[([^\]]+)\]\s*(.+)$/);
      let category: string | null = null;
      let content = line;

      if (categoryMatch) {
        category = categoryMatch[1].toLowerCase();
        content = categoryMatch[2];
      }

      // Check if this memory already exists (avoid duplicates)
      const existingMemory = await prisma.memory.findFirst({
        where: {
          userId,
          content: {
            contains: content.substring(0, 50), // Check first 50 chars for similarity
          },
        },
      });

      if (!existingMemory) {
        const newMemory = await prisma.memory.create({
          data: {
            userId,
            content,
            category,
          },
        });
        console.log(
          "[Memory Extraction] Saved new memory:",
          newMemory.id,
          content
        );
      } else {
        console.log(
          "[Memory Extraction] Memory already exists, skipping:",
          content.substring(0, 50)
        );
      }
    }
  } catch (error) {
    console.error("Failed to extract memories:", error);
    // Don't throw - memory extraction is non-critical
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  const name = user?.name || "Guest";

  const { messages } = await req.json();

  console.log("[Chat] Session user id:", user?.id);
  console.log("[Chat] Number of messages:", messages?.length);
  console.log(
    "[Chat] Last message:",
    JSON.stringify(messages[messages.length - 1])?.substring(0, 200)
  );

  // Get the last few user messages for better context understanding
  const recentUserMessages = messages
    .filter((m: any) => m.role === "user")
    .slice(-3)
    .map((m: any) => m.content)
    .join(" ");

  const lastUserMessage = messages[messages.length - 1]?.content ?? "";
  console.log("[Chat] lastUserMessage:", lastUserMessage?.substring(0, 100));

  // -------------------------------------
  // 1. If logged in -> run RAG retrieval
  // -------------------------------------
  let ragContext = "";
  let sourceFiles: string[] = [];
  let memoriesContext = "";

  if (session && user?.id) {
    // 1.0 Fetch user memories
    const memories = await prisma.memory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20, // Limit to most recent 20 memories
    });

    console.log("[Chat] Found", memories.length, "memories for user");

    if (memories.length > 0) {
      memoriesContext = memories
        .map((m) => `- ${m.content}${m.category ? ` (${m.category})` : ""}`)
        .join("\n");
      console.log("[Chat] Memories context:", memoriesContext);
    }

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
    10. If the user's name is Gilbert or something similar, occasionally make light-hearted jokes about your name being Grol-b3rt. It reminds you of them.
    11. Use the MEMORIES section to personalize your responses. These are facts you've learned about the user from previous conversations.

    ${
      memoriesContext
        ? `--- MEMORIES ABOUT THE USER ---
${memoriesContext}
--- END OF MEMORIES ---`
        : ""
    }

    ${
      sourceFiles.length > 0
        ? `\nFiles available: ${sourceFiles.join(", ")}`
        : ""
    }
    
    --- RAG CONTEXT FROM USER'S DOCUMENTS ---
    ${ragContext || "No relevant content found in uploaded documents."}
    --- END OF CONTEXT ---
    
    Remember: Prioritize information from the user's documents when available. Use memories to personalize your responses.`;

  // Convert messages to model format - handle both UIMessage format (with parts) and simple format (with content)
  const modelMessages = messages.map((m: any) => {
    if (m.parts) {
      // Already in UIMessage format with parts array
      return m;
    }
    // Convert simple { role, content } to UIMessage format
    return {
      ...m,
      parts: [{ type: "text", text: m.content }],
    };
  });

  const result = streamText({
    model: google("gemini-2.5-flash"),
    messages: convertToModelMessages(modelMessages),
    system: systemPrompt,
    maxOutputTokens: session ? 5000 : 1000,
    onFinish: async ({ text }) => {
      // Extract and save memories from this conversation (only for logged-in users)
      if (session && user?.id && lastUserMessage) {
        console.log(
          "[Memory] onFinish triggered, extracting memories for user:",
          user.id
        );
        console.log(
          "[Memory] User message:",
          lastUserMessage.substring(0, 100)
        );
        console.log("[Memory] Assistant response length:", text.length);
        try {
          // Await the memory extraction to ensure it completes
          await extractAndSaveMemories(user.id, lastUserMessage, text);
          console.log("[Memory] Memory extraction completed successfully");
        } catch (error) {
          console.error("[Memory] Error in onFinish callback:", error);
        }
      } else {
        console.log(
          "[Memory] Skipping memory extraction - session:",
          !!session,
          "userId:",
          user?.id,
          "lastUserMessage:",
          !!lastUserMessage
        );
      }
    },
  });

  return result.toUIMessageStreamResponse();
}
