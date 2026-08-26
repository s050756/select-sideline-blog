export const SITE_NAME = "Select Sideline";
export const SITE_TITLE = "Notes from the sideline";
export const CANONICAL_ORIGIN = "https://blog.selectsideline.com";
export const APP_URL = "https://selectsideline.com";
export const FEEDBACK_EMAIL = "feedback@selectsideline.com";
export const THEME_COLOR = "#163d2b";

/** Grok Imagine (grok-imagine-image-2.0) drop-in paths. Do not generate these files in-repo. */
export const MEDIA = {
  og: "/og.jpg",
  hero: "/hero.jpg",
  favicon: "/favicon.png",
  mark: "/mark.png",
  posts: {
    mission: "/posts/mission.jpg",
    goals: "/posts/goals.jpg",
    progress: "/posts/progress.jpg",
    watchThePlaybook: "/posts/watch-the-playbook.jpg",
  },
} as const;

export const OG_IMAGE_PATH = MEDIA.og;

export const SITE_DESCRIPTION =
  "Notes from the sideline. A playbook for select and premier youth coaches of grade-school and middle-school teams, with roster next to the call. Offline and free.";

export function canonicalUrl(pathname = "/"): string {
  if (pathname === "/" || pathname === "") {
    return `${CANONICAL_ORIGIN}/`;
  }
  const trimmed = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${CANONICAL_ORIGIN}${trimmed.replace(/\/$/, "")}`;
}

export function absoluteUrl(pathname: string): string {
  if (pathname.startsWith("http://") || pathname.startsWith("https://")) {
    return pathname;
  }
  const trimmed = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${CANONICAL_ORIGIN}${trimmed}`;
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function organizationJsonLd(): Record<string, unknown> {
  return {
    "@type": "Organization",
    name: SITE_NAME,
    url: APP_URL,
  };
}

export function blogJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: SITE_TITLE,
    url: canonicalUrl("/"),
    description: SITE_DESCRIPTION,
    publisher: organizationJsonLd(),
    inLanguage: "en-US",
  };
}

export function blogPostingJsonLd(input: {
  title: string;
  description: string;
  pathname: string;
  pubDate: Date;
  updatedDate?: Date;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: input.title,
    description: input.description,
    datePublished: isoDate(input.pubDate),
    dateModified: isoDate(input.updatedDate ?? input.pubDate),
    mainEntityOfPage: canonicalUrl(input.pathname),
    url: canonicalUrl(input.pathname),
    image: absoluteUrl(OG_IMAGE_PATH),
    author: organizationJsonLd(),
    publisher: organizationJsonLd(),
    inLanguage: "en-US",
  };
}
