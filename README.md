# SkillBridge AI

Career preparation and scam-awareness tools for students and early-career professionals.

## Requirements

- Node.js 22.13 or newer (the server uses Node's built-in SQLite module).
- An SMTP account for email verification and password-reset delivery.
- A Gemini API key for AI resume summary, bullet rewriting, ATS analysis, and live career guidance.

## Local setup

```powershell
npm install
Copy-Item .env.example .env
npm run server
```

In a second terminal:

```powershell
npm run dev
```

Open `http://localhost:5173`. For a no-credential UI tour, keep `VITE_DEMO_MODE=true` and choose **Continue as guest / Explore demo**. Guests can use existing sample tools and build a browser-only draft; personal profiles and saved resumes require a verified account.

### Local account testing without SMTP

Only in a local development environment, set `AUTH_DEV_LINKS=true`, keep `NODE_ENV=development`, and restart the API. Registration then returns a one-time development verification URL in the response. Do not enable this in staging or production. Password-reset emails still require SMTP.

## Server configuration

Copy `.env.example` and configure these backend-only values:

- `DB_PATH`: durable SQLite file path; default is `./data/skillbridge.sqlite`. Back up this file and keep its directory private.
- `APP_ORIGIN` and `APP_ORIGINS`: public frontend URL and allowed browser origins.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, and `SMTP_FROM`: required to deliver verification and password-reset messages.
- `GEMINI_API_KEY` and optional `GEMINI_MODEL`: required for the existing AI proxy and real AI resume-assistance endpoints. Never use a `VITE_` prefix for secrets.
- `VITE_DEMO_MODE=true|false`: existing tools use labeled local examples in demo mode; set it to `false` for Career Coach and other existing Gemini-backed routes. Resume Builder AI-only actions always call Gemini and never fabricate a fallback; they report missing server configuration.

Account passwords are stored as salted scrypt hashes. Session cookies are HttpOnly, SameSite=Lax, and Secure in production; verification and reset tokens are one-use and stored hashed. Saved-resume endpoints scope every read, update, duplicate, and delete by the authenticated user ID. SQLite is intended for a single application instance; use a managed database and shared session infrastructure before horizontal scaling.

## Account and resume flows

1. Configure SMTP (or the local-only dev-link mode above).
2. Create an account, verify its email, then sign in.
3. Use **Resume Builder** to add personal details, education, skills, projects, experience, and optional sections.
4. Review AI suggestions before applying them. AI summary/bullet generation and ATS analysis require `GEMINI_API_KEY`; Career Coach uses Gemini when `VITE_DEMO_MODE=false`.
5. Save to **My Resumes** for account-owned storage. The preview's **Print / Save PDF** opens the browser print dialog; select Save as PDF.
6. Career Coach compares the actual draft text to the job description. Demo mode is labeled; no score increase is automatically applied.

Forgot-password and email verification delivery return an explicit configuration error if SMTP is unavailable. Google OAuth is not included because no OAuth client/provider configuration exists; the interface does not show a fake Google button.

## Existing services

- `server/index.js`: Express API, Gemini proxy, authentication, and resume endpoints.
- `server/database.js`: SQLite schemas for users, sessions, auth tokens, and resumes.
- `server/auth.js`: validation, scrypt hashing, session middleware, email tokens, and user-owned resume CRUD.
- `src/pages/`: dashboard, resume builder/analyzer, career coach, ScamLens, roadmap, interview, reports, tracker, and account screens.
- `src/services/api.js`: existing AI features plus real-only resume assistance endpoints.

Company verification remains a manual checklist, not a live lookup. AI and scam results are guidance, not guarantees or proof of legitimacy.

## Verification

```powershell
npm run build
node --check server/index.js
```
