# ✈️ Aviation Club Website

## 🙌 Thanks To:

- [@Ezzat-Abdelrazek-255](https://github.com/Ezzat-Abdelrazek-255) for creating our new website in **2024**  
- [@MazenEssam02](https://github.com/MazenEssam02) for deploying it on **Azure in 2025**
## Add new Forms:

- Open /public folder.
- Create new folder with the name of the form ex: /ac2025.
- Put the files in this folder with html file named index.html.

## Robolympics Track I dashboard

- Public live scoreboard: `/robolympics`
- Organizer sign-in and scoring console: `/robolympics/admin`
- Run `public/Robolympics/setup.sql` once in the Supabase SQL editor.
- Set the server environment values listed in `public/Robolympics/server-env.example` in local development and the production host. Use a long, unique `ROBO_ADMIN_PASSWORD` and a random `ROBO_SESSION_SECRET` of at least 32 characters. Keep `SUPABASE_SECRET_KEY` server-side only; `SUPABASE_SERVICE_ROLE_KEY` is supported only as a legacy fallback.
- Add the team names from the organizer console before the first run. During a run, stage and penalty results are buttons; stage totals, attempt points, bonuses, and rankings update automatically.

The console follows the Track I scoring breakdown supplied for this event. It awards the +15 clean-run score on run completion if no topple was recorded and calculates the speed bonus as +2 for each full 30 seconds left on the clock. The public page polls for live updates every few seconds. Static dashboard files and setup materials are in `public/Robolympics`; secure Next.js pages and APIs stay in `app/` and `lib/`.
