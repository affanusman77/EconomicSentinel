# Admin — Keystatic CMS Setup

Economic Sentinel uses [Keystatic](https://keystatic.com) to manage articles.
Editors log in with GitHub; creating or editing an article through the admin UI
commits Markdown directly to the repo, which triggers an auto-deploy.

The admin is **not linked anywhere on the public site** — no nav, no sitemap,
no footer. It exists only at `/keystatic` and only on the admin deployment.

---

## Architecture

```
┌──────────────────────┐   SKIP_KEYSTATIC=true   ┌────────────────────────┐
│  Cloudflare Pages    │ ◄───── static build ────►│  economicsentinel.org  │
│  (public site)       │   9 pages, zero admin    │  Pure static HTML      │
└──────────────────────┘                          └────────────────────────┘

┌──────────────────────┐   No SKIP_KEYSTATIC      ┌────────────────────────┐
│  Cloudflare Workers  │ ◄─── server build ──────►│  admin.economicsentinel│
│  (admin deployment)  │   Static pages +         │  .org/keystatic        │
└──────────────────────┘   Keystatic API routes    └────────────────────────┘
```

**Public site** → Cloudflare Pages, `SKIP_KEYSTATIC=true`. Pure static.
No admin code ships. No `/keystatic` route exists.

**Admin site** → Separate Cloudflare Workers deployment (or local dev).
Keystatic mounts at `/keystatic`. GitHub OAuth gates access.

---

## Local Development (recommended starting point)

1. **Clone the repo** and install dependencies:

   ```bash
   npm install
   ```

2. **Start the dev server**:

   ```bash
   npm run dev
   ```

3. **Open the admin**: visit `http://localhost:4321/keystatic`

   In local mode, Keystatic reads/writes directly to `src/content/articles/`.
   No GitHub App needed — just edit, save, and the Astro dev server hot-reloads.

---

## GitHub Mode (for deployed admin)

This lets collaborators edit articles from a browser. Keystatic uses a GitHub
App for OAuth — only users with **write access to the repo** can log in.

### Step 1 — Create a GitHub App

1. Deploy the admin build to Cloudflare Workers (see "Deploying the admin" below).
2. Visit `https://your-admin-domain/keystatic` and click **"Login with GitHub"**.
3. Keystatic walks you through creating a GitHub App:
   - Provide your deployed admin URL.
   - Choose a name (e.g. `economic-sentinel-cms`).
   - Grant the app access to your repository.
4. Keystatic generates four values. Copy them.

### Step 2 — Set environment variables

In your Cloudflare Workers admin deployment, set these environment variables:

```
KEYSTATIC_GITHUB_CLIENT_ID=<from step 1>
KEYSTATIC_GITHUB_CLIENT_SECRET=<from step 1>
KEYSTATIC_SECRET=<from step 1>
PUBLIC_KEYSTATIC_GITHUB_APP_SLUG=<from step 1>
```

Also set the repo coordinates used by `keystatic.config.tsx`:

```
KEYSTATIC_REPO_OWNER=<your-github-username-or-org>
KEYSTATIC_REPO_NAME=<your-repo-name>
```

**Never** commit these values. Use `.env` locally (already gitignored) and
environment variables in the Cloudflare dashboard for production.

### Step 3 — Test

Visit `https://your-admin-domain/keystatic`, log in with GitHub, and create a
test article. It should appear as a commit in the repo within seconds.

---

## Deploying the admin to Cloudflare Workers

1. Install Wrangler:

   ```bash
   npm install -g wrangler
   wrangler login
   ```

2. Create a `wrangler.toml` in the project root:

   ```toml
   name = "es-admin"
   compatibility_date = "2024-09-23"
   compatibility_flags = ["nodejs_compat"]
   main = "dist/_worker.js"
   assets = { directory = "dist", binding = "ASSETS" }
   ```

3. Build and deploy:

   ```bash
   npm run build           # Without SKIP_KEYSTATIC
   wrangler deploy
   ```

4. Set env vars in Cloudflare dashboard → Workers → es-admin → Settings →
   Variables. Add all six variables from Step 2 above. Encrypt the secrets.

5. (Optional) Add a custom domain: Workers → es-admin → Triggers → Custom
   Domains → `admin.economicsentinel.org`.

---

## Locking down access with Cloudflare Access (optional, recommended)

Even though GitHub OAuth restricts the admin to repo collaborators, you can
add a second gate with [Cloudflare Zero Trust](https://one.dash.cloudflare.com/)
(free for up to 50 users):

1. Go to **Zero Trust** → **Access** → **Applications** → **Add an application**.
2. Choose **Self-hosted**, set the domain to `admin.economicsentinel.org`.
3. Set the path to `/keystatic*` (this covers the admin UI and API routes).
4. Create an **Access Policy**:
   - **Action**: Allow
   - **Include rule**: Emails — add the email addresses of your team.
5. Save. Cloudflare now shows a login screen before anyone can reach the admin.

This means an attacker would need to pass both Cloudflare Access AND GitHub
OAuth to reach the CMS — defense in depth on the free tier.

---

## What is public vs. protected

| Route | Public site | Admin site |
|---|---|---|
| `/`, `/about`, `/research`, etc. | ✅ Static HTML | ✅ Pre-rendered |
| `/keystatic` | ❌ Does not exist | 🔒 GitHub OAuth |
| `/api/keystatic/*` | ❌ Does not exist | 🔒 GitHub OAuth |
| Source code | ❌ Not exposed | ❌ Not exposed |
| `.env` / secrets | ❌ Gitignored | ❌ Encrypted in CF |

---

## Article schema (what editors see)

| Field | Type | Required | Notes |
|---|---|---|---|
| Title | Slug (auto-generates filename) | ✅ | |
| Author | Text | ✅ | |
| Author role | Text | | Default: "Student Researcher" |
| Publish date | Date picker | ✅ | |
| Category | Select (Economics/Finance/Business) | | Internal only |
| Excerpt | Multiline text | ✅ | Shown on cards |
| Cover image | Image upload | | Stored in `public/images/articles/` |
| Content | Markdoc editor | | Rich text with headings, lists, links |

---

## Costs

| Service | Tier | Limit |
|---|---|---|
| Cloudflare Pages (public site) | Free | 500 builds/month |
| Cloudflare Workers (admin) | Free | 100k requests/day |
| Cloudflare Access | Free (Zero Trust) | 50 users |
| GitHub App / OAuth | Free | Unlimited |
| Keystatic | Free (open source) | Unlimited |
