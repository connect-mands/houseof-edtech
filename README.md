# LessonForge

**Collaborative lesson plan studio for educators** — House of Edtech Fullstack Developer Assignment (Jan 2026).

Lesson plans model pedagogy (objectives, instructional flow, assessment, standards), support draft/private/public visibility, and include an optional Groq-powered AI instructional coach.

## Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router, Server Actions) |
| Language | TypeScript |
| UI | Tailwind CSS 4, Radix UI primitives |
| Database | PostgreSQL (Neon) + Drizzle ORM |
| Auth | Auth.js (NextAuth v5) — JWT + credentials |
| AI (optional) | Vercel AI SDK + Groq (Llama 3.3) |
| Testing | Vitest |
| CI/CD | GitHub Actions → Vercel |

## Environment

Create a **`.env`** file in the project root (gitignored):

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (Neon locally or on Vercel) |
| `AUTH_SECRET` | Random secret — `openssl rand -base64 32` |
| `NEXT_PUBLIC_AUTHOR_NAME` | Your name (footer) |
| `NEXT_PUBLIC_GITHUB_URL` | GitHub profile URL |
| `NEXT_PUBLIC_LINKEDIN_URL` | LinkedIn profile URL |
| `GROQ_API_KEY` | Optional — [Groq Console](https://console.groq.com/keys) |

## Local setup

```bash
npm install
npm run db:migrate
npm run db:seed    # optional demo user: demo@lessonforge.app / DemoPass1
npm run dev
```

For local PostgreSQL or Docker, set `DATABASE_URL` accordingly. Docker Compose maps Postgres to host port **5433** to avoid clashing with a local install on 5432.

## Deploy (Vercel + Neon)

1. Push to GitHub.
2. Create a database at [Neon](https://console.neon.tech).
3. In Vercel → **Settings → Environment Variables**, set `DATABASE_URL` to your Neon URL (`*.neon.tech`, include `?sslmode=require`). Do **not** use `localhost` in production.
4. Set `AUTH_SECRET`, `NEXT_PUBLIC_*`, and optional `GROQ_API_KEY`.
5. Run migrations once from your machine:

   ```bash
   DATABASE_URL="your-neon-url" npm run db:migrate
   ```

6. Deploy from the **production** URL (not an old preview deployment).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run db:migrate` | Apply SQL migration |
| `npm run db:seed` | Seed demo educator + public lesson |
| `npm run test:unit` | Run Vitest |

## Submission checklist

- [ ] Footer env vars set locally and on Vercel
- [ ] Production URL deployed and linked in submission
- [ ] GitHub repository shared
- [ ] (Optional) `GROQ_API_KEY` on Vercel for AI coach
