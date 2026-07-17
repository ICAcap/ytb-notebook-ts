-- Enable trigram support for note content fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Fuzzy search: trigram index over "Note"."contentText"
CREATE INDEX "Note_contentText_trgm_idx" ON "Note" USING GIN ("contentText" gin_trgm_ops);
