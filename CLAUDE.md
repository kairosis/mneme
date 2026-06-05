# Mneme

Mneme is a standalone TypeScript monorepo that consumes events from the Kairosis event platform via RabbitMQ and stores semantic vector embeddings in Qdrant. It also accepts document uploads and exposes a semantic search API. Mneme operates independently of Arachni — both subscribe to `kairosis.topic` without knowledge of each other. Akasha is the only system that combines both.

---

## Repository Structure

```
mneme/
├── apps/
│   ├── server/          # NestJS app — RabbitMQ subscriber, embedding pipeline, Qdrant writer, REST API
│   └── web/             # Next.js app — document upload UI, search explorer
├── packages/
│   └── qdrant/          # Shared Qdrant client wrapper, collection config, base types
├── .env.example
├── docker-compose.yml
├── pnpm-workspace.yaml
└── CLAUDE.md
```

---

## Technology Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (LTS) |
| Language | TypeScript (strict) |
| Package manager | pnpm workspaces (no Nx) |
| Server framework | NestJS |
| Frontend framework | Next.js (App Router) |
| Message broker | RabbitMQ (AMQP) |
| Vector database | Qdrant (self-hosted, `@qdrant/js-client-rest`) |
| Embedding model | Vercel AI SDK (`ai` package) |
| Connector schemas | npm packages (from Kairosis) |
| Containerization | Docker + Docker Compose |

---

## Core Concept

```
kairosis.topic (RabbitMQ)
    └── Mneme binds its own queues (independent of Arachni)
            └── event payload → normalize to text → embed → Qdrant

File upload (Next.js UI or NestJS API)
    └── document → chunk → embed → Qdrant
```

Mneme has no knowledge of Arachni or Neo4j. It is a pure vector memory store.

---

## Qdrant Collection

A single collection `mneme` is used for all vectors. Source type is distinguished via payload metadata.

### Collection config

```typescript
{
  collection_name: "mneme",
  vectors: {
    size: <model_dimensions>,   // determined by embedding model
    distance: "Cosine"
  }
}
```

### Point payload schema

```typescript
{
  source: "event" | "document",

  // if source === "event"
  eventId: string,
  eventType: string,           // e.g. "slack.message.received"
  connector: string,           // e.g. "slack"
  routingKey: string,
  timestamp: string,
  normalizedText: string,      // the text that was embedded

  // if source === "document"
  documentId: string,
  filename: string,
  mimeType: string,
  chunkIndex: number,
  totalChunks: number,
  uploadedAt: string,
  normalizedText: string,      // the chunk text that was embedded
}
```

Akasha can filter by `source`, `connector`, `eventType`, or `timestamp` range when querying Mneme.

---

## Apps

### `apps/server` — NestJS

**RabbitMQ ingest:**
- Binds its own queues to `kairosis.topic` using topic routing keys (same keys as Arachni, independent queues)
- Queue naming: `mneme.<connector>` (e.g. `mneme.slack`, `mneme.github`)
- Dead-letter queue: `mneme.dlq`
- Each event is routed to a connector-specific normalizer, then embedded and written to Qdrant

**Document ingest:**
- REST endpoint: `POST /ingest/document` — accepts file upload (multipart/form-data)
- Also callable directly by agents or CLI (not frontend-only)
- Documents are chunked using a per-type strategy, each chunk embedded independently
- Supported formats: PDF, plain text, Markdown (extensible)

**Search API:**
- REST endpoint: `POST /search` — accepts a query string, returns top-k results
- Supports optional filters: `source`, `connector`, `eventType`, `from`, `to`
- Primarily consumed by Akasha, but usable by any agent

**Key modules:**
- `RabbitMQModule` — AMQP connection, queue binding, message consumption
- `QdrantModule` — client singleton, collection init on startup
- `EmbeddingModule` — Vercel AI SDK wrapper, single embed + batch embed
- `IngestModule` — fan-out to per-connector normalizers + document ingest
- `NormalizerRegistry` — maps event type → normalizer function
- `ChunkingModule` — per-document-type chunking strategies
- `SearchModule` — semantic search endpoint

### `apps/web` — Next.js

- Document upload UI — drag and drop, upload progress, upload history
- Search explorer — semantic search interface with source/connector filters
- Calls the NestJS server via API routes (App Router route handlers)

---

## packages/qdrant

Shared package used by both apps:

- Qdrant client instantiation
- Collection name constant and init helper
- TypeScript types for point payloads (`EventPoint`, `DocumentPoint`)
- Search result types

---

## Normalizers

Normalizers live in `apps/server/src/normalizers/` — one file per connector. Mneme owns the language layer; connector packages are schema-only.

Each normalizer is a pure function:

```typescript
// apps/server/src/normalizers/slack.normalizer.ts
import { SlackMessageReceivedPayload } from '@kairosis/connector-slack';

export const normalizeSlackMessage = (payload: SlackMessageReceivedPayload): string =>
  `${payload.author} sent a message in ${payload.channel}: "${payload.text}"`;
```

The `NormalizerRegistry` maps event types to normalizer functions:

```typescript
const registry: Record<string, (payload: unknown) => string> = {
  'slack.message.received': normalizeSlackMessage,
  'github.push': normalizeGithubPush,
  // ...
};
```

If no normalizer is registered for an event type, the event is logged and skipped (not written to Qdrant).

---

## Chunking Strategies

Document chunking lives in `apps/server/src/chunking/` — one strategy per document type.

```typescript
interface ChunkingStrategy {
  chunk(text: string, metadata: DocumentMetadata): Chunk[];
}
```

| Document type | Strategy |
|---|---|
| PDF | Page-aware, then sentence-boundary split |
| Markdown | Section-aware (split on headings) |
| Plain text | Sentence-aware with overlap |

Slack messages and other short event payloads are never chunked — they are embedded as a single unit.

---

## Embedding

All embedding goes through the `EmbeddingModule`, which wraps the Vercel AI SDK:

```typescript
import { embedMany } from 'ai';

const { embeddings } = await embedMany({
  model: embeddingModel,
  values: texts,
});
```

The embedding model is configured via environment variable. Mneme does not hard-code a provider.

---

## RabbitMQ Convention

- **Exchange:** `kairosis.topic` (topic exchange, created by Kairosis — Mneme does not create it)
- **Queue naming:** `mneme.<connector>` (e.g. `mneme.slack`, `mneme.github`)
- **Routing keys:** same topic patterns as Arachni (e.g. `slack.#`, `github.#`)
- Mneme creates its own queues on startup independently of Arachni
- Dead-letter queue: `mneme.dlq`

---

## Environment Variables

```env
# RabbitMQ
RABBITMQ_URL=amqp://kairosis:<password>@localhost:5672
RABBITMQ_EXCHANGE=kairosis.topic

# Qdrant
QDRANT_URL=http://localhost:6333
QDRANT_COLLECTION=mneme

# Embedding (Vercel AI SDK)
EMBEDDING_MODEL=openai:text-embedding-3-small
OPENAI_API_KEY=                        # or whichever provider

# Server
SERVER_PORT=3000

# Web
NEXT_PUBLIC_API_URL=http://localhost:3000
WEB_PORT=3001
```

---

## REST API

### `POST /ingest/document`
Upload a document for chunking and embedding.
- Content-Type: `multipart/form-data`
- Field: `file` — the document
- Returns: `{ documentId, chunks, status }`

### `POST /search`
Semantic search across all vectors.
```typescript
// Request
{
  query: string,
  topK?: number,           // default 10
  filter?: {
    source?: "event" | "document",
    connector?: string,
    eventType?: string,
    from?: string,         // ISO timestamp
    to?: string
  }
}

// Response
{
  results: Array<{
    score: number,
    payload: EventPoint | DocumentPoint
  }>
}
```

---

## Docker

- `mneme-server` — NestJS server image
- `mneme-web` — Next.js frontend image

`docker-compose.yml` orchestrates both. Qdrant and RabbitMQ are external (self-hosted) — not included in Mneme's compose file.

---

## Code Conventions

- **Strict TypeScript** — no `any`, no implicit returns
- **NestJS patterns** — modules, providers, decorators; no raw Express
- **Qdrant** — use `@qdrant/js-client-rest` directly; no ORM layer
- **Normalizers are pure functions** — no side effects, no async
- **Chunking strategies implement a common interface**
- **Embedding is always batched** — never embed one vector at a time in a loop
- **Failed messages** are nacked and routed to `mneme.dlq`; never silently dropped
- **No knowledge of Arachni or Neo4j** — Mneme is vector-only

---

## Adding a New Connector

1. Install the Kairosis connector schema package: `pnpm add @kairosis/connector-<name> --filter server`
2. Create `apps/server/src/normalizers/<name>.normalizer.ts`
3. Register the normalizer in `NormalizerRegistry`
4. Add the routing key binding and queue `mneme.<name>` in `RabbitMQModule`

---

## Adding a New Document Type

1. Create `apps/server/src/chunking/<type>.strategy.ts` implementing `ChunkingStrategy`
2. Register it in `ChunkingModule` keyed by MIME type

---

## Scripts

```bash
pnpm dev          # start both apps in dev mode
pnpm build        # build all apps and packages
pnpm lint         # lint all packages
pnpm typecheck    # tsc --noEmit across all packages
pnpm docker:build # build both Docker images
```