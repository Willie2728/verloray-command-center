# Verloray AI Command Center — Phase 1 Architecture

## Goal

Phase 1 is a runnable private AI command center with Direct and Council workflows, server-side provider adapters, streaming, and durable project conversations. Later phases are represented in navigation and schemas but never presented as live integrations.

## Runtime boundaries

```text
Browser (React / App Router)
  -> same-origin route handlers (validation, rate limiting, streaming)
    -> ProviderRegistry
      -> MockAdapter (always available, visibly simulated)
      -> OpenAIAdapter (only when OPENAI_API_KEY exists)
      -> AnthropicAdapter (only when ANTHROPIC_API_KEY exists)
    -> ProjectStore (server-only JSON persistence for the local MVP)
```

API keys are read only in route handlers and adapters. They are never serialized to React props, browser storage, persistence records, or logs. Production should replace the local project store with PostgreSQL/Prisma and use a managed secrets vault.

## Streaming protocol

`POST /api/chat/stream` returns Server-Sent Events. Events are normalized as `start`, `delta`, `complete`, or `error`. Council calls are launched concurrently in the browser, so one provider failure cannot cancel successful runs.

## Data model

The local store persists projects, conversations, and normalized messages in `data/verloray.json` (gitignored). Stable IDs and timestamps make records directly migratable. `prisma/schema.prisma` documents the production relational model requested in the brief without requiring a database for first launch.

## Security controls

- Same-origin API boundary; no credential values leave the server.
- Zod request validation and prompt-size limits.
- In-memory per-IP throttling for the local runtime.
- Secure response headers from Next configuration.
- External provider errors are normalized; response bodies and credentials are not echoed.
- Mock behavior is explicit in response metadata and UI.

## Risks and assumptions

- Authentication is authentication-ready, not enabled in Phase 1. Do not expose this build publicly before adding an identity provider and protected-route middleware.
- JSON persistence is intentionally single-instance/local. It is not safe for horizontally scaled production deployment.
- Real-provider streaming requires credentials and network access; it is implemented but can only be verified when keys are supplied.
- Provider pricing changes. Cost is shown as unavailable until dated pricing configuration is provided.
- Browser visual/mobile validation is separate from unit and compile checks and is recorded in `IMPLEMENTATION_LOG.md`.
- Codex/Claude Code execution is represented only by interfaces and documentation; browsers never execute shell commands.

## Local worker design

Future coding agents connect through an authenticated execution broker. The broker creates isolated worktrees, enforces an allowlist, streams an append-only event log, and pauses destructive commands, commits, deployments, sensitive-file access, and external mutations for approval. Diffs are generated before commits. Filesystem paths remain broker-side and are exposed only as authorized workspace-relative paths.

