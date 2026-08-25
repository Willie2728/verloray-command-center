# Verloray AI Command Center

A private, production-structured multi-model orchestration command center. Phase 1 is a working local vertical slice: dimensional provider selection, Direct and concurrent Council modes, normalized SSE streaming, server-only OpenAI/Anthropic adapters, an explicit simulation adapter, and persistent project conversations.

## Launch

Requirements: Node 20+ and pnpm.

```powershell
Copy-Item .env.example .env.local
pnpm install
pnpm dev
```

Open `http://localhost:3000`. The simulation provider works without credentials. To enable a real provider, add `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` to `.env.local`, restart the server, open Integrations, and select that connected provider. Never put keys in browser code or commit `.env.local`.

## Checks

```powershell
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md). Browser requests cross a same-origin route boundary and enter a provider registry implementing `AIProviderAdapter`. All streams become normalized SSE events. Council calls fan out concurrently with `Promise.allSettled`, isolating failures. Local MVP projects use an atomic, serialized JSON store under `data/`; the complete PostgreSQL target schema lives in `prisma/schema.prisma`.

## Adding a provider

1. Add non-secret metadata to `src/lib/providers/catalog.ts`.
2. Implement `AIProviderAdapter` in a separate server-only module.
3. Read credentials only from server environment or a vault reference.
4. Register the adapter in `registry.ts`.
5. Normalize deltas/errors; preserve raw metadata server-side when needed.
6. Add adapter tests and disclose provider data-retention terms in Integrations.

Only official APIs, SDKs, OAuth, MCP, or authorized local brokers are acceptable integration paths.

## Database and deployment

The checked-in Prisma schema is the production PostgreSQL design. Before a public deployment, install Prisma, configure `DATABASE_URL`, create migrations, replace `src/lib/store.ts`, and test backup/deletion paths. Deploy behind HTTPS with managed Postgres, a secrets vault, durable rate limiting, file malware scanning, monitoring, and an identity provider. Set `AUTH_SECRET` in the vault—not Git.

## Security notes

Phase 1 includes server-only keys, input validation, prompt limits, local rate limiting, normalized errors, and secure headers. Authentication is structurally anticipated but **not enabled**, so this build must not be exposed publicly. External content must be treated as untrusted instructions. The execution broker is a safe mock; no browser-triggered shell execution exists.

## Current limitations / roadmap

- Live OpenAI and Anthropic paths require user-supplied credentials and have not been claimed operational without them.
- Authentication, PostgreSQL/Prisma runtime, Redis-backed limits, file uploads, Compare evaluation, Wisdom orchestration, Guide editing, approval execution, and usage accounting are later phases.
- Codex, Claude Code, Copilot, and avatar integrations are abstractions only. Local workers must use isolated worktrees, command logs, diff review, and approval gates.
- Cost is intentionally unavailable until a dated pricing table is configured.

Next recommended step: add authentication plus the PostgreSQL repository implementation, then validate one credentialed provider end-to-end before expanding Phase 2 adapters.
