-- Add HNSW index for faster vector similarity search
-- This significantly improves query performance for cosine distance searches

CREATE INDEX IF NOT EXISTS "Embedding_vector_idx" ON "Embedding" 
USING hnsw ("vector" vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Add index on fileId for faster JOINs
CREATE INDEX IF NOT EXISTS "Embedding_fileId_idx" ON "Embedding" ("fileId");
