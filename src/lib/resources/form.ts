import { z } from "zod";

import type { ResourceCreate, ResourceType } from "./schema";

const isUrl = (v: string) => {
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};

const text = (max: number) => z.string().trim().max(max, `Keep it under ${max} characters`);
const url = text(2000).refine((v) => v === "" || isUrl(v), "Enter a full URL starting with https://");
const wholeNumber = z.string().trim().regex(/^\d{0,7}$/, "Whole number only");
const score = z.number().int().min(0).max(100).nullable();
const date = z.string().regex(/^(\d{4}-\d{2}-\d{2})?$/, "Use a valid date");

/** Form state: everything as strings/arrays so inputs stay controlled. */
export const resourceFormSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(300),
    link: url,
    description: text(5000),
    published_date: date,
    date_started: date,
    date_completed: date,
    duration_minutes: wholeNumber,
    page_count: wholeNumber,
    word_count: wholeNumber,
    reliability: score,
    interest: score,
    rating: score,
    status: z.string().min(1),
    discovered_from: text(300),
    notes: text(10000),
    author_ids: z.array(z.number()),
    topic_ids: z.array(z.number()),
    subtopic_ids: z.array(z.number()),
    tag_ids: z.array(z.number()),
    collection_ids: z.array(z.number()),
    isbn: text(20),
    publisher: text(200),
    edition: text(100),
    series: text(200),
    platform: text(100),
    channel: text(200),
    transcript_url: url,
    publication: text(200),
    publication_url: url,
    doi: text(200),
  })
  .refine((v) => !v.date_started || !v.date_completed || v.date_completed >= v.date_started, {
    path: ["date_completed"],
    message: "Completed date can't be before the start date",
  });

export type ResourceFormValues = z.infer<typeof resourceFormSchema>;

export const EMPTY_FORM: ResourceFormValues = {
  title: "",
  link: "",
  description: "",
  published_date: "",
  date_started: "",
  date_completed: "",
  duration_minutes: "",
  page_count: "",
  word_count: "",
  reliability: null,
  interest: null,
  rating: null,
  status: "to_read",
  discovered_from: "",
  notes: "",
  author_ids: [],
  topic_ids: [],
  subtopic_ids: [],
  tag_ids: [],
  collection_ids: [],
  isbn: "",
  publisher: "",
  edition: "",
  series: "",
  platform: "",
  channel: "",
  transcript_url: "",
  publication: "",
  publication_url: "",
  doi: "",
};

const orNull = (v: string) => (v.trim() === "" ? null : v.trim());
const intOrNull = (v: string) => (v.trim() === "" ? null : Number.parseInt(v, 10));

/** Converts form state into the POST /resources body for the chosen type. */
export function toResourceCreate(type: ResourceType, v: ResourceFormValues): ResourceCreate {
  return {
    title: v.title.trim(),
    link: orNull(v.link),
    description: orNull(v.description),
    published_date: orNull(v.published_date),
    date_started: orNull(v.date_started),
    date_completed: orNull(v.date_completed),
    duration_minutes: intOrNull(v.duration_minutes),
    page_count: intOrNull(v.page_count),
    word_count: intOrNull(v.word_count),
    reliability: v.reliability,
    interest: v.interest,
    rating: v.rating,
    status: v.status,
    discovered_from: orNull(v.discovered_from),
    notes: orNull(v.notes),
    author_ids: v.author_ids,
    topic_ids: v.topic_ids,
    subtopic_ids: v.subtopic_ids,
    tag_ids: v.tag_ids,
    collection_ids: v.collection_ids,
    book:
      type === "book"
        ? {
            isbn: orNull(v.isbn),
            publisher: orNull(v.publisher),
            edition: orNull(v.edition),
            series: orNull(v.series),
          }
        : null,
    video:
      type === "video"
        ? { platform: orNull(v.platform), channel: orNull(v.channel), transcript_url: orNull(v.transcript_url) }
        : null,
    article:
      type === "article"
        ? { publication: orNull(v.publication), publication_url: orNull(v.publication_url), doi: orNull(v.doi) }
        : null,
  };
}
