import { resourceType, type Resource, type ResourceType } from "./schema";

/** Display metadata per resource type. Class strings are full literals so Tailwind picks them up. */
export const TYPE_META: Record<
  ResourceType,
  { label: string; plural: string; facetLabel: string; spine: string; text: string; soft: string }
> = {
  book: {
    label: "Book",
    plural: "Books",
    facetLabel: "Publisher",
    spine: "bg-book",
    text: "text-book",
    soft: "bg-book-soft",
  },
  video: {
    label: "Video",
    plural: "Videos",
    facetLabel: "Platform",
    spine: "bg-video",
    text: "text-video",
    soft: "bg-video-soft",
  },
  article: {
    label: "Article",
    plural: "Articles",
    facetLabel: "Publication",
    spine: "bg-article",
    text: "text-article",
    soft: "bg-article-soft",
  },
};

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

/** Best length measure for the resource, preferring the one natural to its type. */
export function lengthOf(r: Resource): string | null {
  const pages = r.page_count != null ? `${r.page_count} pages` : null;
  const duration = r.duration_minutes != null ? formatDuration(r.duration_minutes) : null;
  const words = r.word_count != null ? `${r.word_count.toLocaleString("en")} words` : null;
  switch (resourceType(r)) {
    case "book":
      return pages ?? words ?? duration;
    case "video":
      return duration ?? words ?? pages;
    case "article":
      return words ?? duration ?? pages;
  }
}

/** Publisher / platform / publication, whichever applies. */
export function sourceOf(r: Resource): string | null {
  return r.book?.publisher ?? r.video?.platform ?? r.article?.publication ?? null;
}

export const yearOf = (date: string | null) => (date ? date.slice(0, 4) : null);

export function formatDate(date: string | null): string | null {
  if (!date) return null;
  const d = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export const authorNames = (r: Resource) => r.authors.map((a) => a.name).join(", ");
