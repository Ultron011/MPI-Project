-- 1. Create sessions table
create table if not exists sessions (
  id bigserial primary key,
  name text not null,
  description text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 2. Add session_id to documents table
alter table documents 
add column if not exists session_id bigint references sessions(id) on delete cascade;

-- 3. Create index for faster queries
create index if not exists idx_documents_session_id on documents(session_id);

-- 4. Update the match_documents function to support session filtering
create or replace function match_documents (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_session_id bigint default null
)
returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float,
  session_id bigint
)
language plpgsql
as $$
begin
  return query
  select
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) as similarity,
    documents.session_id
  from documents
  where 
    (filter_session_id is null or documents.session_id = filter_session_id)
    and 1 - (documents.embedding <=> query_embedding) > match_threshold
  order by documents.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- 5. Create a function to get session with document count
create or replace function get_sessions_with_stats()
returns table (
  id bigint,
  name text,
  description text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  document_count bigint
)
language sql
as $$
  select 
    s.id,
    s.name,
    s.description,
    s.created_at,
    s.updated_at,
    count(d.id) as document_count
  from sessions s
  left join documents d on s.id = d.session_id
  group by s.id, s.name, s.description, s.created_at, s.updated_at
  order by s.updated_at desc;
$$;
