# INVINCIBLE PROS — Engineering Conventions

Project-specific standards for the scheduling platform monorepo. These apply to
all code generated in this repository.

## Architecture

- **Monorepo**: pnpm workspaces + Turborepo. Apps in `apps/*`, shared libraries
  in `packages/*`. Package scope is `@invincible/*`.
- **Dependency direction**: `types` → `utils` → (`database`, `sdk`) → apps.
  `types` and `utils` MUST stay framework-free (no React/Nest/Prisma imports).
- **Shared packages build with tsup** (dual ESM+CJS + declarations) and expose
  `dist` via their `exports` map. `ui` is the exception: a "just-in-time"
  package that exports source and is transpiled by Next (`transpilePackages`).
- Centralize third-party versions in the `pnpm-workspace.yaml` `catalog`.

## TypeScript

- Strict mode everywhere (`tsconfig.base.json`), including
  `noUncheckedIndexedAccess`. Prefer `type` imports (`import type`).
- The API (`apps/api`) uses `module: CommonJS` + `moduleResolution: Node`, so
  import shared code from package roots (e.g. `@invincible/utils`), not subpath
  exports.
- No `any`. Model errors with the `AppError`/`Result` types from
  `@invincible/utils`.

## Validation & errors

- **One source of truth for validation**: define Zod schemas in
  `@invincible/utils` (`validation/`) and reuse them in both the API
  (`ZodValidationPipe`) and web forms (`zodResolver`).
- API errors flow through `GlobalExceptionFilter` and are serialized to the
  stable `AppErrorShape`. The SDK rethrows them as `SdkError`. Never leak stack
  traces to clients.

## Scheduling domain

- All availability/booking math lives in the framework-free engine
  (`@invincible/utils/scheduling`) and must be unit-tested. Keep it pure and
  inject `now: Date` for determinism.
- Times are stored and transported in UTC (ISO-8601). Convert to/from IANA
  zones only at the edges using the Luxon-based helpers in `utils/datetime`.
- Bookings are created with a Redis lock + transactional seat re-check +
  idempotency key. Do not bypass this path.

## API

- REST under `/api/v1` (URI versioning). Better Auth is mounted at `/api/auth`.
- Guard order on tenant routes: `SessionAuthGuard` then `OrgMembershipGuard`.
  Resolve the org from the `x-organization-id` header.
- One module per domain concept; controllers stay thin, services hold logic.

## Web

- Next.js App Router. Server components fetch via the SDK; client components use
  TanStack Query hooks in `src/hooks/*`.
- All UI comes from `@invincible/ui`. Do not hand-roll one-off styled elements
  when a primitive exists. Every interactive flow must include loading, empty,
  and error states, and be keyboard/screen-reader accessible.
- Use CSS-variable design tokens for theming; never hard-code colors.

## Testing

- Vitest for unit tests (co-located `*.test.ts` / `*.spec.ts`), Playwright for
  e2e in `apps/web/e2e`. The scheduling engine and validation schemas must keep
  high coverage.

## Branding

- This is an original product. Never copy another product's UI, code, assets,
  or branding. Brand marks live in `@invincible/ui` (e.g. `Logo`).

## Quality gate

Before considering work complete: `pnpm typecheck`, `pnpm lint`, `pnpm test`,
and `pnpm build` must all pass.
