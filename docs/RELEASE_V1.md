# FroggySmill Hunt V1

## Implemented

- Mobile lobby with an actual animated Three.js frog and pond, lazy-loaded with static fallback.
- Original generated 1086 × 1448 demo search image containing five visually verified frogs.
- Actual image hit testing shared with admin preview, zoom, bounded hints, pause and automatic background pause.
- Serialized checkpoints, completion results, personal best times, and XP once per level; replay retains history.
- Scrollable level map backed by available levels and real personal results.
- Original synthesized sound effects and music, gesture unlock, live settings, reduced motion.
- Admin upload, normalized markers, adjustable radii, Berlin scheduling, complete test before publishing.
- Existing Firebase retained; optional Supabase takes precedence if configured. No cloud data was migrated.

## Before a public account launch

The repository without backend environment variables runs in the explicitly labelled local demo mode. It does not provide cross-device account storage in that mode.

For a dedicated Supabase project:

1. Review and apply `supabase/migrations/202609070001_froggy_v1.sql` to a new Froggy database. It creates tables, RLS policies, the idempotent result RPC and the `level-images` bucket. Do not apply it to another app's database.
2. Enable Google Auth. Set the deployed URL (including `/FrogyHunter/` for GitHub Pages) in the redirect allowlist and configure the Google provider.
3. Set the public `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for the frontend build. Never use the service role key in Vite.
4. After the first Google login, add the intended auth user ID to `game_admins` using the database console. Clients cannot grant themselves admin rights.
5. Upload, mark, finish the preview test, then publish the first cloud level. The bundled demo is only seeded locally.
6. Verify Google login, RLS denial of other users' data/admin writes, storage and completion on the connected project before public release.

For an existing Firebase deployment, retain its configuration and deploy the reviewed Firestore/Storage rules and indexes. `VITE_ADMIN_UIDS` only influences the interface; the server-side `admins/{uid}` document must grant actual authorization.

Set genuine support, privacy and imprint URLs via the optional environment variables. No legal details have been invented.

## Validation and limits

`npm run build` checks TypeScript and creates the Vite production bundle. On Node 22.6+ use `node --experimental-strip-types --test scripts/game-rules.test.mjs` for coordinate, replay, score and timezone regression checks.

This change does not claim a real-device browser or connected backend acceptance test. Run a phone acceptance pass before opening accounts publicly: login → image upload/mark/test → scheduled availability → five finds → pause/resume → completion → refresh → history → replay.

This is a casual game, not an anti-cheat ranking service: locations must be sent to the client for hit testing and elapsed time originates in the client. Supabase validates ownership, counters, frog IDs and idempotency; it cannot prove human visual discovery. Images are public media under randomized paths, while draft metadata remains access controlled. Existing Firestore result writes require equivalent product-specific rules if used competitively.

Active runs checkpoint every five seconds and on found/missed taps, hints and pause. A browser hard kill can still lose the most recent unsent seconds. Replays award no additional XP. No shop, currency, friends or quests are included.

## Asset provenance

`public/assets/demo-pond-v1.webp` was created with built-in image generation and encoded as WebP without resizing for mobile loading. Prompt: portrait storybook 3D forest pond, exactly five green frogs, crisp foliage, turquoise water, warm sunlight, no text or UI. Actual frog centers were inspected and mapped in `src/data/mockLevel.ts`.

`src/lib/froggyScene.ts` and `src/audio/froggyAudio.ts` are original Astra-authored procedural model and synthesized audio assets. Existing supplied game artwork is retained. The lobby scene is a lightweight 3D foreground over the existing illustrated backdrop, not a fully navigable 3D forest.
