create extension if not exists vector;

create table if not exists "DocumentChunk" (
  id text primary key,
  "documentId" text not null,
  "chunkIndex" integer not null,
  content text not null,
  embedding vector(1536),
  "createdAt" timestamp not null default now(),
  constraint "DocumentChunk_documentId_fkey"
    foreign key ("documentId")
    references "Document"(id)
    on delete cascade
);

create unique index if not exists "DocumentChunk_documentId_chunkIndex_key"
  on "DocumentChunk" ("documentId", "chunkIndex");

create index if not exists "DocumentChunk_documentId_idx"
  on "DocumentChunk" ("documentId");

create index if not exists "DocumentChunk_embedding_idx"
  on "DocumentChunk"
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);
