<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Barista App - Engineering Guidelines & Architecture Enforcement

## 1. Language & Naming Conventions
- **100% English** for all code, domain models, functions, interfaces, comments, commit messages, and tests.
- **Bilingual UI (English + Spanish)**: All user-facing strings must be localized via typed dictionaries (`src/infrastructure/ui/i18n/`).

## 2. Hexagonal Architecture (Ports and Adapters)
Directory boundaries are strictly enforced by automated architecture tests (`npm run test:arch`):

- `src/domain/`:
  - Contains entities, value objects, domain errors, and pure business logic.
  - **Zero external dependencies**: Must NEVER import from `application`, `infrastructure`, React, Next.js, or Prisma.
- `src/application/`:
  - Contains use cases and ports (interfaces):
    - `ports/in/`: Primary/Driver ports (use cases).
    - `ports/out/`: Secondary/Driven ports (repository interfaces, scraper interfaces, LLM extractor interfaces).
  - Can only import from `domain` and other application ports.
  - Must NEVER import from `infrastructure`, React, Next.js, or Prisma.
- `src/infrastructure/`:
  - `in/`: Controllers, API Route Handlers, UI components, hooks.
  - `out/`: Database repositories (Prisma), external roaster web scrapers, LLM parser infrastructure.

## 3. Strict Code Quality & File Limits
- **Maximum 200 lines per file** across all files in `src/`.
- Every feature must be accompanied by unit tests and pass `npm run test:arch`.
- Adhere to Single Responsibility Principle (SRP) and keep domain models immutable.

## 4. Coffee & Equipment Specifications
- **Target Grinder**: DF64 Gen II (stepless dial 0 to 90, 64mm flat burrs, single-dose bellows).
- **Target Machine**: Sage Barista Touch Impress (54mm portafilter, 18.0g standard double dose, assisted tamp with 10kg + 7° twist, ThermoJet temperature presets: Low, Normal, High, Very High).
- **Extraction Parameters**: Dose (g), Yield (g), Ratio (1:X), Shot Time (s), Water Temp, Grind Setting (DF64 scale), and Recommended Rest Days.

## 5. UI Guidelines (No AI-Slop)
- Avoid generic SaaS cards, neon purple gradients, and superficial badges.
- Follow editorial specialty coffee aesthetics: earthy/warm crema tones, dark roast charcoal, and clean monospaced metrics for technical brew parameters.
- Verify mobile responsiveness at 320px, 375px, 414px, and 768px.

