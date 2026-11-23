import { z } from "zod";

/**
 * Frontend mirror of the SQLModel schema, in the JSON shape the backend
 * would return (snake_case, nullable columns as `null`, relationships
 * expanded). A resource's kind is whichever of book/video/article is set.
 */
export const RESOURCE_TYPES = ["book", "video", "article"] as const;
export type ResourceType = (typeof RESOURCE_TYPES)[number];

const nullableText = z.string().nullable();
const nullableInt = z.number().int().nullable();
const score = z.number().int().min(0).max(100).nullable();
const isoDate = z.string(); // YYYY-MM-DD

export const authorSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  profile: nullableText,
  website: nullableText,
  affiliation: nullableText,
});
export const topicSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  description: nullableText,
});
export const subtopicSchema = topicSchema.extend({ topic_id: nullableInt });
export const tagSchema = z.object({ id: z.number().int(), name: z.string() });
export const collectionSchema = tagSchema;

export const bookSchema = z.object({
  isbn: nullableText,
  publisher: nullableText,
  edition: nullableText,
  series: nullableText,
});
export const videoSchema = z.object({
  platform: nullableText,
  channel: nullableText,
  transcript_url: nullableText,
});
export const articleSchema = z.object({
  publication: nullableText,
  publication_url: nullableText,
  doi: nullableText,
});

export const resourceSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  link: nullableText,
  description: nullableText,

  date_added: isoDate,
  published_date: isoDate.nullable(),
  date_started: isoDate.nullable(),
  date_completed: isoDate.nullable(),

  duration_minutes: nullableInt,
  page_count: nullableInt,
  word_count: nullableInt,

  reliability: score,
  interest: score,
  rating: score,

  status: z.string(),
  discovered_from: nullableText,
  notes: nullableText,

  authors: z.array(authorSchema),
  topics: z.array(topicSchema),
  subtopics: z.array(subtopicSchema),
  tags: z.array(tagSchema),
  collections: z.array(collectionSchema),

  book: bookSchema.nullable(),
  video: videoSchema.nullable(),
  article: articleSchema.nullable(),
});

export type Author = z.infer<typeof authorSchema>;
export type Topic = z.infer<typeof topicSchema>;
export type SubTopic = z.infer<typeof subtopicSchema>;
export type Tag = z.infer<typeof tagSchema>;
export type Collection = z.infer<typeof collectionSchema>;
export type BookDetails = z.infer<typeof bookSchema>;
export type VideoDetails = z.infer<typeof videoSchema>;
export type ArticleDetails = z.infer<typeof articleSchema>;
export type Resource = z.infer<typeof resourceSchema>;

export function resourceType(r: Pick<Resource, "book" | "video" | "article">): ResourceType {
  if (r.book) return "book";
  if (r.video) return "video";
  return "article";
}

/** POST body: scalar columns + relationship ids + exactly one subtype object. */
export type ResourceCreate = Omit<
  Resource,
  "id" | "date_added" | "authors" | "topics" | "subtopics" | "tags" | "collections"
> & {
  author_ids: number[];
  topic_ids: number[];
  subtopic_ids: number[];
  tag_ids: number[];
  collection_ids: number[];
};

export const STATUSES = ["to_read", "in_progress", "completed", "abandoned"] as const;
export const STATUS_LABELS: Record<string, string> = {
  to_read: "To read",
  in_progress: "In progress",
  completed: "Completed",
  abandoned: "Abandoned",
};
export const statusLabel = (s: string) => STATUS_LABELS[s] ?? s.replace(/_/g, " ");

export const SORT_KEYS = ["added", "published", "title", "rating"] as const;
export type SortKey = (typeof SORT_KEYS)[number];
export const SORT_LABELS: Record<SortKey, string> = {
  added: "Recently added",
  published: "Newest published",
  title: "Title A–Z",
  rating: "Highest rated",
};

/** Type-specific text column each type page can filter on. */
export const TYPE_FACET = {
  book: "publisher",
  video: "platform",
  article: "publication",
} as const satisfies Record<ResourceType, string>;
export type TypeFacet = (typeof TYPE_FACET)[ResourceType];

export interface ResourceFilters {
  type: ResourceType | "all";
  q: string;
  status: string;
  author: number | undefined;
  topic: number | undefined;
  subtopic: number | undefined;
  tag: number | undefined;
  collection: number | undefined;
  publisher: string;
  platform: string;
  publication: string;
  sort: SortKey;
}

export interface Lookups {
  authors: Author[];
  topics: Topic[];
  subtopics: SubTopic[];
  tags: Tag[];
  collections: Collection[];
  publisher: string[];
  platform: string[];
  publication: string[];
}
