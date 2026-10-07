<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## File & naming conventions

### Filenames

All source files are **kebab-case**: `login-form.tsx`, `top-nav.tsx`, `forgot-password.ts`.
Next.js reserved files keep their required names (`page.tsx`, `layout.tsx`, `error.tsx`, `not-found.tsx`, `route.ts`, `default.tsx`).

### Symbols inside files

- **Components** → `PascalCase` (`LoginForm`, `TopNav`)
- **Functions, hooks, server actions** → `camelCase` (`forgotPassword`, `useMap`, `toRideCard`)
- **Zod schemas, consts** → `camelCase` (`createRideSchema`)

Filename and its main export do not have to match casing — `login-form.tsx` exports `LoginForm`.

### Where a file lives, Server Actions, index files

The root `AGENTS.md` is the single source for these rules. See its "Web Architecture (`apps/web`)" section. In short:

- Feature code lives in `src/features/<name>/`. `src/app/` holds routing files only, with no `_components` or `_actions` folders.
- Server Actions live in `features/<name>/actions/`, one action per file, named after the action.
- No `index.ts` or `index.tsx` files. A component folder repeats its name in the main file (`ride-card/ride-card.tsx`).
