# Evolve Psychiatry Website

A multi-page React website built with Vite, designed for deployment on Cloudflare Pages.

## Pages

- **Home** — Hero, performance stats, practice overview, core values
- **Diagnoses** — 9 diagnostic categories with condition tags
- **Specialties** — 10 population specialties with age ranges
- **Services** — 12 services with filterable tags
- **Therapy** — 12 modalities (expandable), intake workflow, FAQ
- **Insurance** — Plans by type, exclusions, alternative payment options
- **Contact** — Links organized by audience type

## Local Development

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`

## Build

```bash
npm run build
```

Output goes to `dist/` folder.

## Deploy to Cloudflare Pages

### Option A: GitHub Integration (Recommended)

1. Push this project to a GitHub repo
2. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → Pages → Create a project
3. Connect your GitHub repo
4. Set build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Node.js version:** `18` (set in Environment Variables as `NODE_VERSION=18`)
5. Click Deploy

Every push to `main` will auto-deploy.

### Option B: Direct Upload

1. Run `npm run build` locally
2. Go to Cloudflare Dashboard → Pages → Create a project → Direct Upload
3. Upload the entire `dist/` folder
4. Click Deploy

### Option C: Wrangler CLI

```bash
npm install -g wrangler
wrangler login
npm run build
wrangler pages deploy dist --project-name=evolve-psychiatry
```

## Custom Domain

After deploying:
1. Go to your Cloudflare Pages project → Custom Domains
2. Add your domain (e.g., `www.evolve-psychiatry.com`)
3. Follow DNS instructions to point your domain to Cloudflare Pages

## Tech Stack

- React 18
- Vite 6
- Pure CSS (no Tailwind/framework)
- Google Fonts (Playfair Display + DM Sans)
