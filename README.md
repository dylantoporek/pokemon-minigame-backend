# Pokemon Minigame — Backend

The API for the Pokemon minigame app: user signup/login with bcrypt-protected passwords, per-user favorites, and a full pokedex (898 pokemon with types, sprites, and base stats) sourced from [PokeAPI](https://pokeapi.co).

Originally a Rails 7 + Heroku app, the backend is now a **Node/Express API that deploys to Vercel for free**, backed by a free [Neon](https://neon.tech) Postgres database. The built React frontend in `public/` is served from the same deployment, so one Vercel project runs the whole app. The API routes, payloads, and response shapes are identical to the old Rails API, so the frontend works unchanged.

## Architecture

- `api/index.js` — Vercel serverless entry point (all `/api/*` traffic is rewritten here, see `vercel.json`)
- `server/app.js` — the Express app: all `/api/v1` routes, auth via an HMAC-signed session cookie
- `server/db.js` — Postgres connection pool (`DATABASE_URL`)
- `db/schema.sql` — schema (port of the old Rails `schema.rb`)
- `scripts/seed.js` — creates tables and seeds the pokedex from PokeAPI; safe to re-run
- `client/` — the React frontend source (Vite); `cd client && npm install && npm run build` rebuilds `public/`
- `public/` — production build of the React frontend, served statically with SPA fallback

The old Rails app (`app/`, `config/`, `Gemfile`, …) is kept in the repo for reference but is no longer used; it can be deleted whenever you like.

## Deploying (free)

### 1. Create a free Postgres database on Neon

1. Sign up at [neon.tech](https://neon.tech) (free tier: 0.5 GB, no credit card).
2. Create a project, then copy the **pooled** connection string (the one with `-pooler` in the hostname). It looks like `postgres://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require`.

> Any free Postgres works (Supabase, etc.) — Neon is just the smoothest fit for Vercel. You can also add it directly from the Vercel dashboard via **Storage → Neon**.

### 2. Seed the database

From your machine (or anywhere with Node 18+):

```sh
npm install
DATABASE_URL="<your neon connection string>" npm run seed
```

This creates the tables and loads all 898 pokemon from PokeAPI (takes a minute or two). It never touches user data and skips the pokedex if it's already seeded.

### 3. Deploy to Vercel

1. Sign up at [vercel.com](https://vercel.com) (free Hobby plan) and import this GitHub repo. The defaults are fine — no build command needed.
2. In the project's **Settings → Environment Variables**, add:
   - `DATABASE_URL` — the Neon pooled connection string
   - `SESSION_SECRET` — a random secret for signing login cookies; generate one with
     `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
3. Deploy. The app (frontend + API) is live at your `*.vercel.app` URL.

`FRONTEND_ORIGIN` is only needed if you later host the frontend on a different domain (enables CORS with credentials for that origin).

## Local development

Requires Node 18+ and a local Postgres.

```sh
npm install
createdb pokemon_minigame_dev
DATABASE_URL="postgres://localhost:5432/pokemon_minigame_dev" npm run seed
DATABASE_URL="postgres://localhost:5432/pokemon_minigame_dev" npm run dev
# → http://localhost:3000
```

## API

All routes are under `/api/v1`; the pokedex is public, everything else requires the session cookie:

| Method | Path | Description |
| --- | --- | --- |
| POST | `/signup` | Create account (`username`, `password`, `password_confirmation`) |
| POST | `/login` | Log in (`username`, `password`) |
| DELETE | `/logout` | Log out |
| GET | `/me` | Current user |
| GET | `/pokemons`, `/pokemons/:id` | Pokedex (public) |
| GET | `/user_favorites`, `/user_favorites/:id` | Current user's favorites |
| POST | `/user_favorites` | Add a favorite (`{newFav: {pokemon_id}}`) |
| DELETE | `/user_favorites/:id` | Remove a favorite |

## Seed data note

The old Rails seeds fetched the pokedex from PokeAPI at seed time; `scripts/seed.js` does the same thing (898 pokemon, ~900 requests with limited concurrency), so run it from a machine with normal internet access.
