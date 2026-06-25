# Discord Wellness Bot

A Discord bot that tracks voice channel sessions and sends break reminders to gamers. Built with discord.js, Node.js, PostgreSQL, and Prisma.

## Stack

- **Bot** — discord.js
- **Backend** — Node.js / Express
- **Database** — PostgreSQL (hosted on Railway)
- **ORM** — Prisma 5
- **Deployment** — Railway

---

## Local Setup

### Prerequisites

- Node.js v18+
- A Discord bot token ([Discord Developer Portal](https://discord.com/developers/applications))
- A PostgreSQL database (Railway recommended)

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/discord-wellness-bot
cd discord-wellness-bot
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root:

```
DISCORD_TOKEN=your_discord_bot_token
DATABASE_URL=your_public_railway_postgres_url
```

> **Note:** Use `DATABASE_PUBLIC_URL` from Railway for local dev. The internal `DATABASE_URL` only works within Railway's network.

### 4. Run database migrations

```bash
npx prisma migrate dev --name init
```

### 5. Generate Prisma client

```bash
npx prisma generate
```

### 6. Start the bot

```bash
npm start
```

---

## Useful Commands

| Command | What it does |
|---|---|
| `npm start` | Start the bot |
| `npx prisma migrate dev --name <name>` | Create and run a new migration |
| `npx prisma migrate deploy` | Apply migrations in production |
| `npx prisma generate` | Regenerate Prisma client after schema changes |
| `npx prisma studio` | Open visual DB browser at localhost:5555 |

---

## Railway Deployment

1. Push code to GitHub
2. Connect the GitHub repo to a Railway service
3. Add a PostgreSQL service to the same Railway project
4. Set these environment variables on the bot service:
   - `DISCORD_TOKEN` — your bot token
   - `DATABASE_URL` — set to `${{Postgres.DATABASE_URL}}` (internal URL)
5. Set the start command in `package.json`:

```json
"scripts": {
    "start": "npx prisma migrate deploy && node index.js"
}
```

Every push to GitHub triggers an automatic redeploy.

---

## Project Structure

```
discord-wellness-bot/
├── prisma/
│   ├── schema.prisma       # DB schema
│   └── migrations/         # Migration history
├── index.js                # Bot entry point
├── .env                    # Local env vars (not committed)
├── .gitignore
└── package.json
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `DISCORD_TOKEN` | Your Discord bot token |
| `DATABASE_URL` | PostgreSQL connection string |

---

## .gitignore

Make sure these are ignored:

```
node_modules/
.env
generated/
```