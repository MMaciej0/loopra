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

### Where a file lives

One question: **used by more than one route?**

- No → stays in that route's `_components/`
- Yes → `src/components/<name>/`

Three buckets, nothing else:

| Location                 | Holds                                                  |
| ------------------------ | ------------------------------------------------------ |
| `app/**/_components/`    | UI used by exactly one route or route group            |
| `src/components/ui/`     | Design-system primitives only (button, input, dialog…) |
| `src/components/<name>/` | UI shared across two or more routes                    |

Colocation is the default. Delete a route folder → its components go with it, no orphans.

### Server actions live beside their consumer

Split by **unit**, not by kind. An action used by one component sits in that component's folder:

```
_components/logout-button/
  index.tsx     LogoutButton
  action.ts     logout()
```

Do **not** create a top-level `_actions/` sibling for a single-consumer action — it costs a `../` hop and hides the component. Hoist to a shared `_actions/` only once a second consumer appears.

### index files

Add `index.tsx` only when a folder is a real public boundary — one exported thing with internal parts (`components/ride-card/`, `_components/logout-button/`). Never one per leaf file; a tree full of `index.tsx` tabs is unnavigable.
