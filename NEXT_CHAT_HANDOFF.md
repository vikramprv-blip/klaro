# klaro-services — handoff for next chat

## What was fixed
- Switched Voyage SDK usage to `VoyageAIClient`
- Restored missing exports in `lib/embeddings.ts`:
  - `generateEmbedding`
  - `generateEmbeddings`
- Confirmed Voyage embeddings work with:
  - `VOYAGE_API_KEY`
  - `VOYAGE_EMBED_MODEL=voyage-3-large`
- Fixed Supabase / Prisma connection:
  - using session pooler
  - host: `aws-1-us-east-1.pooler.supabase.com`
  - port: `5432`
- Enabled Prisma multi-schema support for Supabase auth/public
- Ran `prisma db pull` successfully
- Fixed vector dimension mismatch:
  - DB changed from `vector(1536)` to `vector(1024)`
  - Voyage output is 1024-dim
- Confirmed indexing works:
  - `/api/documents/[id]/index`
- Confirmed AI semantic search works:
  - `/api/documents/search-ai`

## Current known-good result
- Indexed sample document successfully
- `DocumentChunk` rows created
- embeddings stored
- semantic search for `invoice` returns matching result

## Important current config
- `DATABASE_URL` and `DIRECT_URL` point to Supabase session pooler
- `VOYAGE_EMBED_MODEL=voyage-3-large`
- `DocumentChunk.embedding` must stay `vector(1024)` unless embedding model changes

## Next phase requested
1. PDF ingestion
2. Auto-index on upload
3. Hybrid search (keyword + semantic)
4. Chat over documents

## Useful endpoints already present
- `POST /api/documents/[id]/index`
- `POST /api/documents/search-ai`
- `GET /api/documents/list`

## Useful files already involved
- `lib/embeddings.ts`
- `lib/ai/voyage.ts`
- `lib/document-indexer.ts`
- `app/api/documents/[id]/index/route.ts`
- `app/api/documents/search-ai/route.ts`

## Prompt for next chat
Continue from here in klaro-services.

Current state:
- Voyage embeddings fixed and working with `voyage-3-large`
- Prisma + Supabase connection fixed
- vector dimension aligned to 1024
- document indexing works
- semantic AI search works

Now implement next phase:
1. PDF ingestion
2. auto-index on upload
3. hybrid search (keyword + semantic)
4. chat over documents

Return ONLY copy/paste bash commands.
