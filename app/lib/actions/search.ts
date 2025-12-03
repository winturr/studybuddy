import { embed } from "ai";
import { google } from "@ai-sdk/google";
import prisma from "@/app/lib/prisma";

export type SearchResult = {
  content: string;
  similarity: number;
  fileName: string;
};

/**
 * Search for relevant content from user's uploaded documents using vector similarity
 */
export async function searchEmbeddings(
  userId: string,
  query: string,
  limit: number = 5
): Promise<SearchResult[]> {
  try {
    // Generate embedding for the query
    const { embedding } = await embed({
      model: google.textEmbeddingModel("text-embedding-004"),
      value: query,
    });

    // Search for similar embeddings using cosine similarity
    // Only search within the user's files
    const results = await prisma.$queryRaw<
      { content: string; similarity: number; fileName: string }[]
    >`
      SELECT 
        e."content",
        1 - (e."vector" <=> ${JSON.stringify(embedding)}::vector) as similarity,
        f."name" as "fileName"
      FROM "Embedding" e
      INNER JOIN "File" f ON e."fileId" = f."id"
      WHERE f."userId" = ${userId}
        AND f."status" = 'COMPLETED'
      ORDER BY e."vector" <=> ${JSON.stringify(embedding)}::vector
      LIMIT ${limit}
    `;

    // Filter results with a minimum similarity threshold
    const threshold = 0.3;
    return results.filter((r) => r.similarity >= threshold);
  } catch (error) {
    console.error("Error searching embeddings:", error);
    return [];
  }
}

/**
 * Format search results into a context string for the AI
 */
export function formatContextForAI(results: SearchResult[]): string {
  if (results.length === 0) {
    return "";
  }

  const contextParts = results.map((r, i) => {
    return `[Source ${i + 1}: ${r.fileName}]\n${r.content}`;
  });

  return `
--- RELEVANT CONTEXT FROM USER'S DOCUMENTS ---
${contextParts.join("\n\n")}
--- END OF CONTEXT ---
`;
}
