# Completion Checklist

This project now includes the core learning loop, parent dashboard, card packs, reward draw, and collection features.

Next manual setup:

1. Create a Supabase free project.
2. Run `supabase/schema.sql`.
3. Run `supabase/seed.sql`.
4. Create a public Storage bucket named `card-assets`.
5. Copy `.env.example` to `.env.local` and fill in Supabase URL and anon key.
6. Run `npm install` and `npm run dev`.
