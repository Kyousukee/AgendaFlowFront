# AGENTS.md

## Project

**AgendaFlow** - SaaS scheduling app for beauty/wellness businesses (barbershops, salons, aesthetics). Consumes a NestJS REST API. Two areas: public landing page + business admin panel.

## Stack

- Angular 22 (standalone components, SSR via `@angular/ssr`)
- TypeScript 6.0, ES2022 target
- Express 5 (SSR server at `src/server.ts`)
- Vitest (unit tests via `@angular/build:unit-test`)
- Prettier (single quotes, 100 print width, Angular HTML parser)
- No ESLint configured
- SCSS for styles (global entry: `src/styles.css`)
- **Angular Material is NOT yet installed** - add if needed for UI components
- Component prefix: `app`

## Commands

```bash
ng serve              # Dev server (port 4200, with SSR)
ng build              # Production build (outputs to dist/)
ng test               # Run unit tests (Vitest)
ng build --watch      # Watch mode (development config)
node dist/AgendaFlow/server/server.mjs  # Serve SSR build (port 4000 or PORT env)
```

## Architecture

Feature-first, standalone components, lazy-loaded routes. Entry point: `src/main.ts` -> `app.ts`.

```
src/app/
├── app.config.ts          # Providers (router, client hydration)
├── app.config.server.ts   # SSR providers
├── app.routes.ts          # Route definitions
├── app.routes.server.ts   # SSR routes (all prerender by default)
├── core/                  # Global services, guards, interceptors only
├── shared/                # Reusable components (no feature dependencies)
├── features/              # Feature modules (each with own routes.ts)
│   └── <feature>/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── models/
│       ├── interfaces/
│       └── routes.ts
├── models/
├── services/
├── guards/
├── interceptors/
└── environments/
```

## Conventions

- **Standalone components only** - no NgModules
- **Reactive Forms exclusively** - no Template Driven Forms
- **Signals** for component state, **RxJS** for HTTP/async
- HTTP calls go through services only, never directly from components
- No `any` - use explicit interfaces/types; all API data must be typed
- No inline styles - use SCSS files
- Prefer Angular Material components over custom implementations
- Prefer Flexbox; CSS Grid when needed

## File Naming

- Components: `feature-name.component.ts`
- Services: `feature-name.service.ts`
- Interfaces: `feature-name.interface.ts`
- Models: `feature-name.model.ts`

## SSR Notes

- Default render mode is `Prerender` (see `app.routes.server.ts`)
- Server runs on `PORT` env var or defaults to 4000
- SSR entry: `src/server.ts` (Express app)

## Code Style

- Prettier enforced: single quotes, 100 char width, Angular parser for HTML templates
- 2-space indent, final newline, trim trailing whitespace
