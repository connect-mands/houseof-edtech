# LessonForge

**Collaborative lesson plan studio for educators** — built for the [House of Edtech](https://houseofedtech.com) Fullstack Developer Assignment (Jan 2026).

LessonForge goes beyond generic CRUD: lesson entities model **pedagogy** (objectives, instructional flow, assessment, standards), support **draft / private / public** visibility, and include an optional **AI instructional coach** for differentiation and formative assessment ideas.

## Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router, Server Actions, SSR) |
| Language | TypeScript |
| UI | Tailwind CSS 4, Radix primitives, custom shadcn-style components |
| Database | PostgreSQL + Drizzle ORM |
| Auth | Auth.js (NextAuth v5) — JWT + credentials |
| AI (optional) | Vercel AI SDK + Groq (Llama 3.3) |
| Testing | Vitest (unit) |
| CI/CD | GitHub Actions → Vercel |

## Quick start

### 1. Prerequisites

- Node.js 20.9+
- Docker (for local PostgreSQL) or a hosted Postgres URL

### 2. Environment

Edit the single **`.env`** file in the project root (gitignored). Next.js and CLI scripts (`db:migrate`, etc.) read it automatically.

| Variable | Local | Production (Vercel) |
|----------|-------|------------------------|
| `DATABASE_URL` | Docker URL on port 5433 | Vercel Postgres / Neon connection string |
| `AUTH_SECRET` | Any long random string | New secret (`openssl rand -base64 32`) |
| `NEXT_PUBLIC_AUTHOR_NAME` | Your name | Same |
| `NEXT_PUBLIC_GITHUB_URL` | Your GitHub | Same |
| `NEXT_PUBLIC_LINKEDIN_URL` | Your LinkedIn | Same |
| `GROQ_API_KEY` | Free from [Groq Console](https://console.groq.com/keys) | Same |

Do not commit `.env`. For production, set the same keys in the Vercel project **Settings → Environment Variables**.

### 3. Database

```bash
docker compose up -d
npm run db:migrate
npm run db:seed   # optional demo user
```

Demo credentials after seed: `demo@lessonforge.app` / `DemoPass1`

#### Database troubleshooting

If you see `password authentication failed for user "lessonforge"`:

1. **Port conflict** — This project maps Docker Postgres to **port 5433** so it does not clash with a local PostgreSQL on 5432. Ensure `.env` has:
   `postgresql://lessonforge:lessonforge@localhost:5433/lessonforge`
2. **Start the container** — `docker compose up -d` (Docker Desktop must be running).
3. **Apply schema** — `npm run db:migrate` then optionally `npm run db:seed`.
4. **Custom Postgres** — If you use your own server, set `DATABASE_URL` to your user, password, host, and database name instead.

### 4. Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Features (assignment mapping)

| Requirement | Implementation |
|-------------|----------------|
| Next.js 16 + TypeScript | App Router, Server Actions, typed Drizzle schema |
| PostgreSQL CRUD | Lesson plans — create, read, update, delete with Zod validation |
| Not a basic todo app | Pedagogy-first lesson model + community gallery |
| Tailwind UI | Responsive layout, accessible labels, focus states |
| Auth (good to have) | Register / login, owner-only edit & delete |
| AI (optional) | `/api/ai/suggest` — differentiation & assessment coaching |
| Security | bcrypt passwords, authorization checks, [SECURITY.md](./SECURITY.md) |
| Testing | `npm run test:unit` |
| CI/CD | `.github/workflows/ci.yml` |
| Deployment | Vercel-ready (see below) |

## Deploy to Vercel + Neon

1. Push this repo to GitHub (`.env` stays local; it is not pushed).
2. Create a database at [Neon](https://console.neon.tech) and copy the **connection string** (use the pooled URL or add `?sslmode=require`).
3. In Vercel → **Settings → Environment Variables**, set:
   - `DATABASE_URL` = your Neon URL (must **not** be `localhost`)
   - `AUTH_SECRET`, `NEXT_PUBLIC_*`, optional `GROQ_API_KEY`
4. Apply the schema **once** from your machine (not Docker):

   ```bash
   DATABASE_URL="postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require" npm run db:migrate
   ```

5. Redeploy on Vercel after saving env vars.

**Common mistake:** leaving `DATABASE_URL` as `localhost` on Vercel — the app cannot reach your laptop’s Postgres. Use the Neon host (`*.neon.tech`) only in production.

GitHub Actions runs lint, unit tests, and build on every push/PR.

## Project structure

```
src/
  app/           # Routes (pages + API)
  actions/       # Server Actions (CRUD, auth)
  components/    # UI + lesson components
  lib/           # db, auth, validations
drizzle/         # SQL migrations
.github/         # CI workflow
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run db:migrate` | Apply SQL migration |
| `npm run db:seed` | Seed demo educator + public lesson |
| `npm run test:unit` | Vitest |
| `npm run test` | Same as `test:unit` |

## Submission checklist

- [ ] Set footer vars in `.env` locally and in Vercel (`NEXT_PUBLIC_*`)
- [ ] Deploy to Vercel and add live URL to README / submission
- [ ] Share GitHub repository link
- [ ] (Optional) Add `GROQ_API_KEY` on Vercel for AI coach

## License

MIT — submission project for interview purposes.
