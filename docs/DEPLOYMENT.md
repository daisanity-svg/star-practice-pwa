# Deployment Guide

## Local test

Run:

```bash
git pull
npm install
npm run dev
```

Open `http://localhost:3000`.

## Supabase setup

1. Create a Supabase Free project.
2. Run `supabase/schema.sql` in SQL Editor.
3. Run `supabase/seed.sql`.
4. Create a public Storage bucket named `card-assets`.
5. Copy Supabase Project URL and anon key into `.env.local`.

## Vercel deployment

1. Import this GitHub repository into Vercel.
2. Choose Next.js.
3. Add the Supabase environment variables.
4. Deploy.

## Mobile install

On iPhone, open the Vercel URL in Safari, tap Share, then Add to Home Screen.

On Android, open the URL in Chrome, tap the menu, then Add to Home Screen.

## Smoke test

Visit these routes:

- `/`
- `/practice`
- `/reward`
- `/collection`
- `/parent/dashboard`
- `/parent/learning`
- `/parent/templates`
- `/parent/progress`
- `/parent/cards`
- `/parent/events`
- `/parent/settings`
