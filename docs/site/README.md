# Static site assets for store launch

| Path | Purpose |
|------|---------|
| `privacy/` | Public privacy notice (host this folder) |
| `feature-graphic.svg` | Play feature graphic draft (export PNG 1024×500) |

## GitHub Pages

A workflow (`.github/workflows/pages.yml`) deploys `docs/site` on pushes to `main` that touch this folder, and via **workflow_dispatch**.

### One-time owner setup

1. Merge the launch-enablement / release-prep changes to `main`.
2. Repo **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Run the **Deploy privacy site** workflow (or push a docs/site change).
4. Confirm the live URL, typically:

   `https://iclectic.github.io/readtrail/privacy/`

5. Set that URL as `PRIVACY_POLICY_URL` in `src/config/release.ts`.
6. Paste the same URL into App Store Connect and Play Console.

Do not mark the privacy URL as live in checklists until the hosted page responds publicly.
