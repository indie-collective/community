# Cloudflare: one cutover to Workers, D1 and R2

We've lost access to the VPS that serves community.indieco.xyz, so we can't deploy there any more. The live site keeps running v2 against Supabase until we switch. The plan was to put the app on Workers against Supabase first (#152), then move the database to D1 (#151). Instead we move everything in **one cutover**: the app to Workers, the database to D1, images to R2. Nothing needs the VPS: the DNS for `indieco.xyz` is already on Cloudflare, and we still have access to Supabase and the Scaleway bucket. Decided on 2026-10-04.

## Consequences

- **No migrations run on Supabase.** v2 still reads columns and tables that #150's stage 1 drops, so migrating the live database would break the live site. Supabase stays as it is, and after the cutover it's the rollback for a while. (Its `_prisma_migrations` is also out of sync with its schema, see #150; that stops mattering because the copy reads tables, not migration history.)
- **D1 starts from a fresh SQLite baseline.** A one-off script copies every table from a fresh Supabase export, keeps the IDs, and checks row counts per table.
- **Cutover:** test on `*.workers.dev`, freeze edits on the old site (an announcement, since we can't touch the VPS), export Supabase, copy into D1 and R2, then point the DNS record at the Worker.
- **Backups:** a scheduled GitHub Action runs `wrangler d1 export` to the Scaleway bucket, replacing the `pg_dump` workflow. D1 Time Travel covers point-in-time restores.

## Workers Paid, measured

We planned to start on the free plans. The spike measured that the app can't fit (#152, 2026-10-09): server rendering takes **55–58 ms of CPU** for the lightest pages (about, a game, an org) and **160–222 ms** for the home page and the lists, against the free plan's 10 ms. Cloudflare cut off 3 of 79 requests. The bundle (1.28 MB gzipped) and startup (4 ms) were fine. **So we run on Workers Paid ($5/month, 30 s of CPU per request by default).** D1 and R2 stay on their included allowances. Decided by engleek on 2026-10-09.

What still shapes the code:

| Limit | Consequence |
|---|---|
| CPU time is billed beyond the included amount | Pages for signed-out visitors get a short edge cache, which matters most for the lists. Lighter rendering (static CSS instead of runtime Emotion) is a later option, not a blocker. MUI goes (see below). |
| D1: rows read and written per month | Our data is small, but list pages read whole tables (`/places` reads ~2,000 rows). The edge cache and indexes on filtered columns keep reads down. |
| Images: unique transformations are capped | Thumbnails are **pre-generated**, not transformed on request (see below). |

**The ORM:** the spike measured Drizzle at 34 KB against 1.2 MB for Prisma with its D1 adapter. Drizzle was also about half the time per query, and Prisma's WebAssembly query compiler costs ~80 ms on a cold isolate. **We use Drizzle** (decided by engleek on 2026-10-09; the schema is ADR 0003).

## Sign-in: Bluesky replaces Discord

Discord sign-in goes at the cutover. Bluesky (AT Protocol OAuth, already proven on Workers in the `chore/atproto-oauth-spike` branch) replaces it, with OAuth state and sessions in D1. The OAuth client ID is a URL, so it's configured per hostname (`workers.dev` while testing, then the real domain).

**Roles are stored in the database** (#153, option 1). Discord membership no longer decides who can edit; admins grant rights from `/admin/users`. **YoruNoHikage and engleek stay admins.** At the cutover their accounts (and the four other existing people) are linked to their Bluesky identities through a new `did` column. The session secret (`SESSION_SECRET`) becomes a Worker secret. Sessions change with the sign-in method, so everyone signs in again once. New-member notifications keep going to Discord, since they're only a webhook call.

## Images: R2 with pre-generated thumbnails

The 2,635 images move from Scaleway to R2, served on the current `CDN_HOST` domain so existing URLs keep working. Thumbnails are generated once: by the copy script for existing images, and in the browser at upload for new ones. Both versions are stored in R2. `jimp` and `aws-sdk` go.

## MUI goes, its features stay

MUI was kept only for the `/places` mobile drawer (ADR 0001). Its features are ported, without MUI:

- the drawer sits at the bottom with its header (the "bleeding" edge) always visible;
- you open it by swiping up from the header or tapping it, and close it by swiping down, tapping outside or with the close action;
- it opens to half the screen height and scrolls inside;
- its content stays mounted while it's closed;
- it follows light and dark mode.

## IGDB data is stored, and refreshed after the response

Today every game page calls IGDB live, and the Twitch token is cached in process memory, which doesn't last on Workers. As #112 planned, a game's IGDB data is stored with it (`igdb_data`, `igdb_data_fetched_at`). Pages serve what's stored, and when it's older than a day the Worker refreshes it after sending the response (`ctx.waitUntil`). A Cron Trigger catches games nobody visits. The Twitch token is stored with its expiry instead of in memory. #112's `pgmq` queue and `node-cron` don't exist on Cloudflare; with ~200 linked games we don't need a queue.

## Country maps are static assets

The regional country maps from #73 load their GeoJSON from GitHub on every request, which costs Worker time and outside requests. The map files are simplified and shipped as static assets, and the maps are drawn in the browser.
