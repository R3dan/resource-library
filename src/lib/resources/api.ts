import { z } from "zod";

import { applyFilters, uniqSorted } from "./filter";
import {
  authorSchema,
  collectionSchema,
  resourceSchema,
  resourceType,
  subtopicSchema,
  tagSchema,
  topicSchema,
  type Author,
  type Collection,
  type Lookups,
  type Resource,
  type ResourceCreate,
  type ResourceFilters,
  type ResourceType,
  type Tag,
} from "./schema";
import { buildSeed, type Database } from "./seed";

/**
 * Mock API client backed by localStorage. Each function maps to one REST
 * endpoint; replace the bodies with fetch() calls to the real backend and
 * the UI keeps working unchanged.
 */
const STORAGE_KEY = "shelfmark.db.v2";
const LATENCY_MS = 120;

const databaseSchema = z.object({
  resources: z.array(resourceSchema),
  authors: z.array(authorSchema),
  topics: z.array(topicSchema),
  subtopics: z.array(subtopicSchema),
  tags: z.array(tagSchema),
  collections: z.array(collectionSchema),
});

const wait = () => new Promise((resolve) => setTimeout(resolve, LATENCY_MS));

function load(): Database {
  if (typeof window === "undefined") return buildSeed();
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const parsed = databaseSchema.safeParse(JSON.parse(raw));
      if (parsed.success) return parsed.data;
    } catch {
      // fall through to reseed
    }
  }
  const seed = buildSeed();
  save(seed);
  return seed;
}

function save(db: Database) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

const nextId = (rows: { id: number }[]) => rows.reduce((max, r) => Math.max(max, r.id), 0) + 1;

/** GET /resources?type=&q=&status=&author=&topic=… */
export async function listResources(filters: ResourceFilters): Promise<Resource[]> {
  await wait();
  return applyFilters(load().resources, filters);
}

/** GET /resources/{id} — null when missing or of another type. */
export async function getResource(type: ResourceType, id: number): Promise<Resource | null> {
  await wait();
  const r = load().resources.find((row) => row.id === id);
  return r && resourceType(r) === type ? r : null;
}

/** GET /lookups — options for filters and the create form. */
export async function getLookups(): Promise<Lookups> {
  await wait();
  const db = load();
  return {
    authors: [...db.authors].sort((a, b) => a.name.localeCompare(b.name)),
    topics: [...db.topics].sort((a, b) => a.name.localeCompare(b.name)),
    subtopics: [...db.subtopics].sort((a, b) => a.name.localeCompare(b.name)),
    tags: [...db.tags].sort((a, b) => a.name.localeCompare(b.name)),
    collections: [...db.collections].sort((a, b) => a.name.localeCompare(b.name)),
    publisher: uniqSorted(db.resources.map((r) => r.book?.publisher)),
    platform: uniqSorted(db.resources.map((r) => r.video?.platform)),
    publication: uniqSorted(db.resources.map((r) => r.article?.publication)),
  };
}

/** POST /authors */
export async function createAuthor(name: string): Promise<Author> {
  const db = load();
  const author: Author = { id: nextId(db.authors), name, profile: null, website: null, affiliation: null };
  save({ ...db, authors: [...db.authors, author] });
  return author;
}

/** POST /tags */
export async function createTag(name: string): Promise<Tag> {
  const db = load();
  const tag: Tag = { id: nextId(db.tags), name };
  save({ ...db, tags: [...db.tags, tag] });
  return tag;
}

/** POST /collections */
export async function createCollection(name: string): Promise<Collection> {
  const db = load();
  const collection: Collection = { id: nextId(db.collections), name };
  save({ ...db, collections: [...db.collections, collection] });
  return collection;
}

/** POST /resources */
export async function createResource(input: ResourceCreate): Promise<Resource> {
  await wait();
  const db = load();
  const { author_ids, topic_ids, subtopic_ids, tag_ids, collection_ids, ...columns } = input;
  const pick = <T extends { id: number }>(rows: T[], ids: number[]) =>
    rows.filter((r) => ids.includes(r.id));
  const resource = resourceSchema.parse({
    ...columns,
    id: nextId(db.resources),
    date_added: new Date().toISOString().slice(0, 10),
    authors: pick(db.authors, author_ids),
    topics: pick(db.topics, topic_ids),
    subtopics: pick(db.subtopics, subtopic_ids),
    tags: pick(db.tags, tag_ids),
    collections: pick(db.collections, collection_ids),
  });
  save({ ...db, resources: [resource, ...db.resources] });
  return resource;
}
