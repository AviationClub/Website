# Robolympics 2026 · Track I

This folder holds the competition-specific static assets and setup materials for the Track I scoreboard.

- `scoreboard.css` — dashboard theme and layout
- `scoreboard.tsx` — interactive public scoreboard and organizer interface
- `score-model.ts` — shared Track I score categories and calculations
- `aviation-club-logo.png` — Aviation Club logo used by the dashboard
- `setup.sql` — create the Supabase state table and its initial row

The tiny Next.js route entries remain in `app/robolympics/`. Organizer authentication and the database API remain server-side in `app/api/robolympics/` and `lib/`; files in this public folder are delivered to browsers and must not contain secrets.

The public scoreboard is `/robolympics` and the organizer console is `/robolympics/admin`.
