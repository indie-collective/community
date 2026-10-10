# v2/v3 differential harness

Throwaway tooling for the Chakra v3 migration walks (#144, used by #145, #146, #147). It is not a test suite and does not need to survive the merge.

It runs `main` (v2: Chakra v2, Remix v1) and `migration/chakra-v3` (v3: Chakra v3, React Router 7) side by side against the same seeded database, then visits every route on both in light and dark mode. **Broken on both means environment or a pre-existing bug; broken on v3 only means regression.**

## Layout on this machine

| What | Where | Port |
|---|---|---|
| v2 app | `.claude/worktrees/v2-harness` (detached at `origin/main`, own `node_modules`) | 3002 |
| v3 app | `/Users/it/Code/IndieCo/community` (on `migration/chakra-v3`) | 3003 |
| Harness | this directory, on branch `chore/differential-harness` | — |

The two apps need separate installs (React 18 vs 19, Remix v1 vs RR7). Port 5000, v3's `npm run dev` default, is taken by macOS AirPlay.

## Run

1. **Database.** Local Postgres, seeded. The two test accounts come from `prisma/seed.js` on the migration branch; the seed is not idempotent for the rest of its data, so on an already-seeded database add just the accounts (see the seed's `testAccounts` block).
2. **v2:**
   ```bash
   cd .claude/worktrees/v2-harness && PORT=3002 npx remix dev
   ```
3. **v3:** built, not `react-router dev` (see Known gaps), but with `NODE_ENV=development` both at build and at runtime, so the client carries React's dev warnings like v2 does and the dev-only sign-in form exists.
   ```bash
   cd /Users/it/Code/IndieCo/community && NODE_ENV=development npx react-router build && PORT=3003 NODE_ENV=development node --env-file=.env node_modules/@react-router/serve/bin.js build/server/index.js
   ```
   `launch.json` here has both as preview-server configurations with logs teed into `out/`; copy it to `.claude/launch.json`.
4. **Inventory**, then **capture**:
   ```bash
   npm install
   node --env-file=/Users/it/Code/IndieCo/community/.env routes.mjs
   node capture.mjs            # everything, ~2 min
   node capture.mjs /games     # or only paths with these prefixes
   MOBILE=1 node capture.mjs   # phone width (375px, touch) into out/<run>-mobile
   node compare.mjs out/<run>  # v2 | v3 side-by-side images
   ```

Output lands in `out/<timestamp>/`: `summary.md` (differential table), `results.json` (status, final URL, console errors and warnings, failed requests per route/version/mode), and screenshots at `<version>/<mode>/<route>.png`. Server-side errors are in `out/v2-server.log` / `out/v3-server.log`.

## Test accounts

Seeded on the migration branch (`prisma/seed.js`), local only:

| Account | Email | Admin |
|---|---|---|
| `harness-admin` | `harness-admin@indieco.test` | yes |
| `harness-member` | `harness-member@indieco.test` | no |

In development, `signin` uses a form strategy that checks the email only, and `canWrite` returns true, so there is no password. `capture.mjs` signs in by posting the form.

## Colour modes

v2 reads Chakra's `chakra-ui-color-mode` from localStorage (default light); v3 reads next-themes' `theme` (default system). The capture sets both keys and emulates `prefers-color-scheme`, so each mode is forced on either version.

## Unverifiable locally

Mark these unverifiable, never broken. They need the maintainer with real credentials before merge.

| Missing | Effect | Routes |
|---|---|---|
| `CDN_HOST` | Every uploaded image 404s, on both versions | `/`, `/games`, `/game/:id`, `/events`, `/event/:id`, `/orgs`, `/studios`, `/associations`, `/org/:id`, `/search?q=`, `/rewind`, the edit forms' existing images |
| `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` | Uploads cannot be stored | image upload on `orgs.create`, `org.$id.edit`, `events.create`, `event.$id.edit`, `game.$id/images.add`, `profile.edit` |
| `IGDB_CLIENT_ID`, `IGDB_CLIENT_SECRET` | IGDB data isn't fetched or refreshed; what's stored still shows (#254) | the refresh after a `game.$id` view, the hourly Cron Trigger (`utils/igdbRefresh.server.js`) |
| `SENDGRID_API_KEY` | No email sent | `forgot` → `reset.$token` |
| `BASE_URL` | Links in notifications and emails point at localhost | `forgot`, the three `*.create` routes, OAuth callbacks |
| `DISCORD_NOTIFICATION_WEBHOOK` | No notification posted | the three `*.create` routes |
| Discord OAuth | Not exercised; the harness signs in with the form strategy | `auth/$provider`, `auth/$provider/callback` |
| `pgcrypto` extension | Absent from the local database, so password hashing fails | `signup` submission |

## Known gaps

- **v3's dev server is broken**: `react-router dev` answers every page with 500 `require is not defined` from `@mui/system/colorManipulator.js`. The `ssr.noExternal` fix from #143 makes the build work but makes Vite's dev SSR evaluate MUI's CommonJS as ESM. That is a developer-workflow regression for the inventory, and the reason v3 is served from a build here.
- **No change-history records** in the seeded database (the seed disables the change trigger), so the `…/changes/:revisionId` pages are not in the inventory. Editing a record through either app creates one; re-run `routes.mjs` afterwards to pick it up.
- `/reset/:token` is visited with a fake token and redirects home on both versions; a real token needs email.
- Action-only routes (`logout`, `*/delete`, `*/add`, `join`/`leave`, OAuth) have no page. They are listed in `routes.json` under `actionOnly` and are exercised through the forms in #146.
- The `summary.md` verdict is a triage hint, not a finding. "Broken on both" can be environment *or* a bug `main` already has; "v3 noisier" means more console errors or failed requests than v2 and needs reading.
