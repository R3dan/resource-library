import { resourceType, type Resource, type ResourceFilters } from "./schema";

export const EMPTY_FILTERS: ResourceFilters = {
  type: "all",
  q: "",
  status: "",
  author: undefined,
  topic: undefined,
  subtopic: undefined,
  tag: undefined,
  collection: undefined,
  publisher: "",
  platform: "",
  publication: "",
  sort: "added",
};

const hasId = (items: { id: number }[], id: number | undefined) =>
  id === undefined || items.some((i) => i.id === id);

/**
 * Pure filtering + sorting. The mock API uses it directly; a real backend
 * would receive the same ResourceFilters as query params.
 */
export function applyFilters(resources: Resource[], f: ResourceFilters): Resource[] {
  const q = f.q.trim().toLowerCase();

  const filtered = resources.filter((r) => {
    if (f.type !== "all" && resourceType(r) !== f.type) return false;
    if (f.status && r.status !== f.status) return false;
    if (!hasId(r.authors, f.author)) return false;
    if (!hasId(r.topics, f.topic)) return false;
    if (!hasId(r.subtopics, f.subtopic)) return false;
    if (!hasId(r.tags, f.tag)) return false;
    if (!hasId(r.collections, f.collection)) return false;
    if (f.publisher && r.book?.publisher !== f.publisher) return false;
    if (f.platform && r.video?.platform !== f.platform) return false;
    if (f.publication && r.article?.publication !== f.publication) return false;
    if (q) {
      const haystack = [
        r.title,
        r.description ?? "",
        r.notes ?? "",
        ...r.authors.map((a) => a.name),
        ...r.tags.map((t) => t.name),
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  return filtered.sort((a, b) => {
    switch (f.sort) {
      case "added":
        return b.date_added.localeCompare(a.date_added) || b.id - a.id;
      case "published":
        return (b.published_date ?? "").localeCompare(a.published_date ?? "");
      case "title":
        return a.title.localeCompare(b.title);
      case "rating":
        return (b.rating ?? -1) - (a.rating ?? -1);
    }
  });
}

export const uniqSorted = (values: (string | null | undefined)[]) =>
  [...new Set(values.filter((v): v is string => Boolean(v)))].sort((a, b) => a.localeCompare(b));
