# Static site assets for store launch

| Path | Purpose |
|------|---------|
| `privacy/` | Public privacy notice (host this folder) |
| `feature-graphic.svg` | Play feature graphic draft (export PNG 1024×500) |

## GitHub Pages (example)

1. Enable Pages for the repository (deploy from `/docs` or copy `docs/site` to a `gh-pages` branch).
2. Confirm the live URL, e.g. `https://<user>.github.io/readtrail/privacy/`.
3. Set that URL as `PRIVACY_POLICY_URL` in `src/config/release.ts`.
4. Paste the same URL into App Store Connect and Play Console.

Do not mark the privacy URL as live in checklists until the hosted page responds publicly.
