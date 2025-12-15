-- 1. Enable the pgvector extension to work with embeddings
create extension if not exists vector;

-- 2. Create a table to store your documents
create table documents (
  id bigserial primary key,
  content text, -- The text content of the chunk
  metadata jsonb, -- Metadata like filename, page number
  embedding vector(1536) -- OpenAI text-embedding-3-small has 1536 dimensions
);

-- 3. Create a function to search for documents
create or replace function match_documents (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where 1 - (documents.embedding <=> query_embedding) > match_threshold
  order by documents.embedding <=> query_embedding
  limit match_count;
end;
$$;
