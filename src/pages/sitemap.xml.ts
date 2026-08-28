import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { LEGAL_PAGES, canonicalUrl, isoDate } from "../lib/site";

export const GET: APIRoute = async () => {
  const posts = await getCollection("posts");
  const lastPost = posts.reduce<Date | null>((latest, post) => {
    const date = post.data.updatedDate ?? post.data.pubDate;
    if (!latest || date > latest) {
      return date;
    }
    return latest;
  }, null);

  const urls = [
    {
      loc: canonicalUrl("/"),
      lastmod: lastPost ? isoDate(lastPost) : "2026-08-20",
    },
    ...LEGAL_PAGES.map((page) => ({
      loc: canonicalUrl(page.pathname),
      lastmod: page.lastmod,
    })),
    ...posts.map((post) => ({
      loc: canonicalUrl(`/${post.id}`),
      lastmod: isoDate(post.data.updatedDate ?? post.data.pubDate),
    })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
};

export const prerender = true;
