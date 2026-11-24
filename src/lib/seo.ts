/** Per-page head metadata. */
export function pageHead(title: string, description: string, extra: { noindex?: boolean } = {}) {
  const fullTitle = `${title} — Shelfmark`;
  return {
    meta: [
      { title: fullTitle },
      { name: "description", content: description },
      { property: "og:title", content: fullTitle },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      ...(extra.noindex ? [{ name: "robots", content: "noindex" }] : []),
    ],
  };
}
