# Security considerations — LessonForge

## Threat model (summary)

LessonForge handles educator accounts and instructional content. Primary risks include unauthorized access to private lessons, injection attacks, credential compromise, and abuse of the AI endpoint.

## Mitigations implemented

| Risk | Mitigation |
|------|------------|
| SQL injection | Parameterized queries via Drizzle ORM; no raw string concatenation |
| XSS | React escaping by default; user content rendered as text nodes (`whitespace-pre-wrap`) |
| Broken access control | Server actions and pages verify `session.user.id === lesson.userId` for mutations; visibility checks on read |
| Weak passwords | Zod rules: min 8 chars, uppercase, number; bcrypt cost factor 12 |
| Session hijacking | JWT sessions via Auth.js; `AUTH_SECRET` required in production |
| CSRF (mutations) | Next.js Server Actions use built-in origin checks |
| AI abuse / cost | `/api/ai/suggest` requires authentication; input length limits; returns 503 without API key |

## Contingency plans

1. **Credential leak (`AUTH_SECRET`, `GROQ_API_KEY`)** — Rotate secrets in Vercel/hosting dashboard immediately; invalidate sessions by changing `AUTH_SECRET`.
2. **Database breach** — Force password resets; audit `lesson_plans` visibility flags; notify users per policy.
3. **AI provider outage** — UI degrades gracefully; core CRUD remains available without Groq.
4. **DDoS / rate limiting** — Add edge rate limiting (Vercel Firewall, Upstash Redis) on `/api/ai/suggest` and auth routes.

## Recommended production hardening (not all enabled in demo)

- HTTP security headers (`Content-Security-Policy`, `Strict-Transport-Security`)
- Email verification and OAuth providers
- Audit logging for lesson publish/delete events
- Automated dependency scanning (`npm audit`, Dependabot)
