# Economic Sentinel

Youth-led organization from Pakistan bridging the gap between financial literacy and young people.  
Built with **Astro + TypeScript**, GSAP scroll animations, Supabase, and Keystatic CMS.

## Quick start

```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # Static output → dist/
npm run preview      # Preview the production build locally
```

## Folder structure

```
src/
├── components/        Reusable Astro components (Navbar, Footer, Logo, Hero, etc.)
├── content/
│   └── articles/      Markdown content collection — add .md files to publish
├── layouts/
│   └── Layout.astro   Base HTML shell (fonts, SEO meta, nav + footer)
├── lib/
│   └── supabase.ts    Supabase client (used by forms + dashboard)
├── pages/
│   ├── index.astro              Home / landing page
│   ├── join.astro               Join the Team application form → Supabase
│   ├── research/
│   │   ├── index.astro          Article/journal index
│   │   └── [...slug].astro      Single-article editorial template
│   ├── internship.astro         Research internship info (apply = coming soon)
│   ├── internship/
│   │   └── apply.astro          Internship application form → Supabase (hidden until live)
│   ├── about.astro              About, story, team, mentors, values
│   ├── contact.astro            Contact form (Formspree)
│   └── sentinel-control.astro   Admin dashboard — passcode-gated submissions viewer
├── scripts/
│   ├── hero-canvas.ts           Ambient particle canvas (home hero)
│   ├── hero-intro.ts            GSAP entrance animation (home hero)
│   └── scroll-reveal.ts         Site-wide scroll reveals + counter animation
├── styles/
│   ├── tokens.css               Brand design tokens
│   └── global.css               Reset, utilities, buttons, grain overlay
└── content.config.ts            Astro content collection schema

public/
├── logo.png                     ES monogram logo
└── favicon.svg                  Favicon
```

## Environment variables

Copy `.env.example` to `.env` and fill in:

```bash
# Supabase (required for forms + dashboard)
PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Dashboard passcode (for /sentinel-control)
PUBLIC_DASHBOARD_PASSCODE=your-secret-passcode

# Keystatic GitHub mode (only for admin CMS deployment)
KEYSTATIC_GITHUB_CLIENT_ID=
KEYSTATIC_GITHUB_CLIENT_SECRET=
KEYSTATIC_SECRET=
PUBLIC_KEYSTATIC_GITHUB_APP_SLUG=
```

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → paste the contents of `supabase-schema.sql` → **Run**
3. Go to **Settings → API** → copy `Project URL` and `anon public` key
4. Set `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` in your `.env`

## Admin access

| Route | What | Access |
|---|---|---|
| `/sentinel-control` | Submissions dashboard (view, filter, export, update status) | Passcode-gated |
| `/keystatic` | Article CMS (create, edit, publish articles) | GitHub OAuth (dev: open) |

Neither route is linked in the public nav, footer, or sitemap.

## Deploy to Cloudflare Pages

1. Push to GitHub
2. Cloudflare dashboard → **Pages** → Create project → connect repo
3. Build settings:
   - **Framework preset**: Astro
   - **Build command**: `npm run build`
   - **Build output**: `dist`
   - **Environment variables**: add `SKIP_KEYSTATIC=true` + your Supabase vars + `PUBLIC_DASHBOARD_PASSCODE`
   - **Node version**: set `NODE_VERSION=20`
4. Custom domain: add `economicsentinel.org` → CNAME to `<project>.pages.dev`

## Internship applications

The internship application form at `/internship/apply` is **currently hidden** — it redirects to `/internship`. To go live:

1. Open `src/pages/internship/apply.astro`
2. Change `const APPLICATIONS_OPEN = false;` to `true`
3. Update the internship page's Apply buttons from the "coming soon" modal to link to `/internship/apply`
4. Deploy

## Design system

All brand tokens in `src/styles/tokens.css`:

| Token | Value | Usage |
|---|---|---|
| `--es-base` | `#0A0F16` | Page background |
| `--es-surface` | `#121A24` | Cards, panels |
| `--es-gold` | `#E3B167` | Primary accent |
| `--es-gold-light` | `#F0CB8C` | Highlights |
| `--es-cream` | `#F4F1EA` | Body text |
| `--es-muted` | `#8A94A6` | Secondary text |

Typography: **Fraunces** (display) + **Inter** (body).
