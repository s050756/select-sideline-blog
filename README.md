# Select Sideline blog

Public notes for [Select Sideline](https://selectsideline.com). Live host is `https://blog.selectsideline.com`.

This repo is a static Astro site deployed as a Cloudflare Worker + Assets on the Workers Free plan. The Worker script name is `select-sideline-blog`. It is **not** the playmaker Worker, and it is not the playbook app.

## Local

Requires Node 22.12 or newer (Astro 7).

```bash
npm install
npm test
```

`npm test` runs `npm run build` (static files in `dist/`) and then copy and config checks.

```bash
npm run dev
```

## Deploy

Cloudflare Workers Builds on `main`:

1. Build command: `npm run build`
2. Deploy command: `npx wrangler deploy`

`wrangler.jsonc` is already set for that flow:

- `name`: `select-sideline-blog`
- `workers_dev`: false
- `preview_urls`: false
- `assets.directory`: `./dist`
- custom domain route: `blog.selectsideline.com`

No D1, KV, R2, Workers AI, Queues, Logpush, Observability, Zaraz, or other paid add-ons.

Custom domain attach happens on the first successful `wrangler deploy` in the Cloudflare account that owns `selectsideline.com`.

## Content

Not a CMS. Three hardcoded Markdown posts:

- `/mission`
- `/goals`
- `/progress`

Feedback stays on the app (`feedback@selectsideline.com`). This site has no feedback form.

## Images

All visual media must be Grok Imagine (`grok-imagine-image-2.0`). Files live at:

- `public/og.jpg` (1200 x 630)
- `public/hero.jpg` (1920 x 1080 homepage hero)
- `public/favicon.png`
- `public/posts/mission.jpg`
- `public/posts/goals.jpg`
- `public/posts/progress.jpg`

Every page links to the live product at `https://selectsideline.com` (header, footer, homepage hero CTA, and a closing CTA on each post).

## SEO

Indexable public pages (`index,follow`), canonical URLs on `https://blog.selectsideline.com`, `robots.txt`, `sitemap.xml`, Open Graph / Twitter cards, and JSON-LD `Blog` / `BlogPosting` for Select Sideline.
