# Chakra v3 migration: what counts as a regression

The Chakra UI v2 → v3 migration (#138) isn't aiming for pixel parity with v2. Layout, spacing and colour *intent* that differ from v2 are bugs and get fixed. Component chrome that v3 simply draws differently is accepted unless it looks broken. Matching it would mean writing and maintaining custom slot recipes for a small community site, and the goal is to finish the migration, not recreate v2. Decided in #148 from the differential walks in #145, #146 and #147.

## Accepted differences

Recorded so they aren't reopened.

- **Green primary buttons, including Sign in** (v2 had purple). `main` itself moved its default palette to green in `4a7ff1e`, so v3 is consistent with it.
- **Grey page background in light mode** (v2 was blue-white). Neutral chrome; nothing reads as broken.
- **Org-type badges** are yellow `studio` / green `assoc`, lowercase. v2 had small dark uppercase badges. They carry the same information.
- **Map marker pins** are drawn differently. Map, clustering and list behave the same.
- **Logout lands on `/signin`** rather than `/`. Both clear the session.
- **Polish, not blocking:**
  - The country filter's dropdown arrow sits detached from the box.
  - The username-availability icon renders grey instead of green/red.

## Also decided

- **MUI stays, for now, for the one mobile drawer** (`SwipeableEdgeDrawer` on `/places`). Keeping a second styling system for one component is odd. But the drawer works at phone width on v3 (checked in #148), so replacing it isn't part of the migration. Dropping MUI is out of scope for #138.
- **Intermittent class-name hydration warnings from Chakra are accepted until Chakra ships the fix.** Chakra 3.35–3.37's style memo keys on *sorted* style props but caches the first call's prop order, process-wide on the server. So two elements with the same style props in a different order can get different class names on server and client, depending on what the server rendered earlier. The declarations are identical, so nothing looks different; only the console warns. The fix is upstream (chakra-ui/chakra-ui#10952, fixed in #10953) but postdates 3.37.0. Bump `@chakra-ui/react` to the first release that includes it rather than patch the dependency locally.
- **Bugs that `main` already has aren't migration work, even when they're found during it.** They're filed separately (#175–#180) and don't block the merge. The one exception is the phone-width overflow: the migration made it worse, so it's fixed fully in #173.
