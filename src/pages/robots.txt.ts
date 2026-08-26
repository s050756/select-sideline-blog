import type { APIRoute } from "astro";
import { CANONICAL_ORIGIN } from "../lib/site";

export const GET: APIRoute = () => {
  const body = `User-agent: *
Allow: /
Sitemap: ${CANONICAL_ORIGIN}/sitemap.xml
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};

export const prerender = true;
