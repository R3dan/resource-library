import { z } from "zod";

import { RESOURCE_TYPES, SORT_KEYS, type ResourceFilters } from "./schema";
import { EMPTY_FILTERS } from "./filter";

/**
 * URL search-param schemas for the list pages. Every key falls back to a
 * default, so hand-edited URLs still render. Numbers typed into text params
 * (e.g. ?q=1984) are coerced back to strings.
 */
const text = z.preprocess((v) => (typeof v === "number" ? String(v) : v), z.string()).catch("");
const id = z.number().int().positive().optional().catch(undefined);

export const VIEW_MODES = ["cards", "list"] as const;
export type ViewMode = (typeof VIEW_MODES)[number];

const base = {
  q: text,
  status: text,
  author: id,
  topic: id,
  subtopic: id,
  tag: id,
  collection: id,
  sort: z.enum(SORT_KEYS).catch("added"),
  view: z.enum(VIEW_MODES).catch("cards"),
};

export const allSearchSchema = z.object({
  ...base,
  type: z.enum(["all", ...RESOURCE_TYPES]).catch("all"),
});
export const bookSearchSchema = z.object({ ...base, publisher: text });
export const videoSearchSchema = z.object({ ...base, platform: text });
export const articleSearchSchema = z.object({ ...base, publication: text });

export const newSearchSchema = z.object({ type: z.enum(RESOURCE_TYPES).catch("book") });

/** Search state the shared browser UI reads/writes (superset of every list page). */
export type BrowserSearch = z.infer<typeof allSearchSchema> & {
  publisher?: string;
  platform?: string;
  publication?: string;
};

/** Values equal to these are dropped from the URL to keep it short. */
export const SEARCH_DEFAULTS = {
  q: "",
  status: "",
  sort: "added",
  view: "cards",
  type: "all",
  publisher: "",
  platform: "",
  publication: "",
} as const;

export function toFilters(
  search: Partial<BrowserSearch>,
  type: ResourceFilters["type"],
): ResourceFilters {
  return {
    ...EMPTY_FILTERS,
    type,
    q: search.q ?? "",
    status: search.status ?? "",
    author: search.author,
    topic: search.topic,
    subtopic: search.subtopic,
    tag: search.tag,
    collection: search.collection,
    publisher: search.publisher ?? "",
    platform: search.platform ?? "",
    publication: search.publication ?? "",
    sort: search.sort ?? "added",
  };
}

/** Drops empty and default-valued keys so URLs stay short and shareable. */
export function cleanSearch(search: Record<string, unknown>): Record<string, unknown> {
  const defaults: Record<string, unknown> = SEARCH_DEFAULTS;
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(search)) {
    if (value === undefined || value === "" || defaults[key] === value) continue;
    out[key] = value;
  }
  return out;
}
