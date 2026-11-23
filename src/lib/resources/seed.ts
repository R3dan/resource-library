import type { Author, Collection, Resource, SubTopic, Tag, Topic } from "./schema";

export interface Database {
  resources: Resource[];
  authors: Author[];
  topics: Topic[];
  subtopics: SubTopic[];
  tags: Tag[];
  collections: Collection[];
}

const authors: Author[] = [
  { id: 1, name: "Don Norman", profile: "Cognitive scientist and usability engineer.", website: "https://jnd.org", affiliation: "UC San Diego" },
  { id: 2, name: "Christopher Alexander", profile: null, website: null, affiliation: "UC Berkeley" },
  { id: 3, name: "Sara Ishikawa", profile: null, website: null, affiliation: "Center for Environmental Structure" },
  { id: 4, name: "Murray Silverstein", profile: null, website: null, affiliation: "Center for Environmental Structure" },
  { id: 5, name: "Daniel Kahneman", profile: "Psychologist; Nobel laureate in economics.", website: null, affiliation: "Princeton University" },
  { id: 6, name: "Rich Hickey", profile: "Creator of Clojure.", website: null, affiliation: "Cognitect" },
  { id: 7, name: "Bret Victor", profile: null, website: "https://worrydream.com", affiliation: "Dynamicland" },
  { id: 8, name: "Douglas Engelbart", profile: null, website: null, affiliation: "Stanford Research Institute" },
  { id: 9, name: "Vannevar Bush", profile: null, website: null, affiliation: "Office of Scientific Research and Development" },
  { id: 10, name: "Dan McKinley", profile: null, website: "https://mcfunley.com", affiliation: null },
  { id: 11, name: "Joel Spolsky", profile: null, website: "https://www.joelonsoftware.com", affiliation: "Fog Creek Software" },
  { id: 12, name: "Frederick P. Brooks Jr.", profile: null, website: null, affiliation: "UNC Chapel Hill" },
];

const topics: Topic[] = [
  { id: 1, name: "Design", description: "How things are shaped for people." },
  { id: 2, name: "Software engineering", description: "Building and maintaining software systems." },
  { id: 3, name: "Psychology", description: null },
  { id: 4, name: "History of computing", description: null },
];

const subtopics: SubTopic[] = [
  { id: 1, name: "Interaction design", description: null, topic_id: 1 },
  { id: 2, name: "Architecture & urbanism", description: null, topic_id: 1 },
  { id: 3, name: "Simplicity", description: null, topic_id: 2 },
  { id: 4, name: "Project management", description: null, topic_id: 2 },
  { id: 5, name: "Cognitive biases", description: null, topic_id: 3 },
  { id: 6, name: "Hypertext", description: null, topic_id: 4 },
];

const tags: Tag[] = [
  { id: 1, name: "classic" },
  { id: 2, name: "ux" },
  { id: 3, name: "talk" },
  { id: 4, name: "essay" },
  { id: 5, name: "systems" },
  { id: 6, name: "tools" },
  { id: 7, name: "decision-making" },
];

const collections: Collection[] = [
  { id: 1, name: "Foundations" },
  { id: 2, name: "Reading group 2026" },
  { id: 3, name: "Watch later" },
];

const pick = <T extends { id: number }>(rows: T[], ids: number[]) =>
  ids.map((id) => rows.find((r) => r.id === id)).filter((r): r is T => r !== undefined);

type Rel = { authors: number[]; topics: number[]; subtopics: number[]; tags: number[]; collections: number[] };
type Row = Omit<Resource, "authors" | "topics" | "subtopics" | "tags" | "collections"> & Rel;

const blank = {
  link: null,
  description: null,
  published_date: null,
  date_started: null,
  date_completed: null,
  duration_minutes: null,
  page_count: null,
  word_count: null,
  reliability: null,
  interest: null,
  rating: null,
  discovered_from: null,
  notes: null,
  book: null,
  video: null,
  article: null,
} as const;

const rows: Row[] = [
  {
    ...blank,
    id: 1,
    title: "The Design of Everyday Things",
    description:
      "Why some products satisfy while others frustrate. Introduces affordances, signifiers, mappings and feedback — the vocabulary of human-centred design.",
    date_added: "2026-01-04",
    published_date: "1988-01-01",
    date_started: "2026-01-06",
    date_completed: "2026-01-29",
    page_count: 368,
    reliability: 90,
    interest: 85,
    rating: 88,
    status: "completed",
    discovered_from: "Recommended in a UX bootcamp",
    notes: "Chapter 4 on constraints is the one to re-read. 'Norman doors' became a running joke at work.",
    book: { isbn: "978-0465050659", publisher: "Basic Books", edition: "Revised and expanded", series: null },
    authors: [1], topics: [1], subtopics: [1], tags: [1, 2], collections: [1],
  },
  {
    ...blank,
    id: 2,
    title: "A Pattern Language",
    description:
      "253 patterns for towns, buildings and construction — the book that later shaped how software engineers talk about design patterns.",
    date_added: "2026-01-12",
    published_date: "1977-01-01",
    date_started: "2026-02-01",
    page_count: 1171,
    reliability: 80,
    interest: 92,
    rating: null,
    status: "in_progress",
    discovered_from: "Cited in 'Design Patterns' (GoF)",
    book: { isbn: "978-0195019193", publisher: "Oxford University Press", edition: null, series: "Center for Environmental Structure, vol. 2" },
    authors: [2, 3, 4], topics: [1], subtopics: [2], tags: [1, 5], collections: [1, 2],
  },
  {
    ...blank,
    id: 3,
    title: "Thinking, Fast and Slow",
    description:
      "The two systems that drive the way we think: fast, intuitive and emotional; slow, deliberate and logical — and the biases between them.",
    date_added: "2026-02-02",
    published_date: "2011-10-25",
    page_count: 499,
    reliability: 70,
    interest: 75,
    status: "to_read",
    discovered_from: "Book club shortlist",
    notes: "Some priming studies have since failed to replicate — read chapter 4 critically.",
    book: { isbn: "978-0374275631", publisher: "Farrar, Straus and Giroux", edition: null, series: null },
    authors: [5], topics: [3], subtopics: [5], tags: [7], collections: [2],
  },
  {
    ...blank,
    id: 4,
    title: "The Mythical Man-Month",
    description:
      "Essays on software engineering from the manager of IBM's OS/360. Adding people to a late project makes it later.",
    date_added: "2026-03-03",
    published_date: "1975-01-01",
    page_count: 322,
    reliability: 85,
    interest: 70,
    status: "to_read",
    book: { isbn: "978-0201835953", publisher: "Addison-Wesley", edition: "Anniversary edition", series: null },
    authors: [12], topics: [2], subtopics: [4], tags: [1, 4], collections: [1],
  },
  {
    ...blank,
    id: 5,
    title: "Simple Made Easy",
    link: "https://www.infoq.com/presentations/Simple-Made-Easy/",
    description:
      "Simplicity is a prerequisite for reliability. Separates 'simple' from 'easy' and argues for untangling the constructs we build software from.",
    date_added: "2026-01-20",
    published_date: "2011-10-20",
    date_started: "2026-01-21",
    date_completed: "2026-01-21",
    duration_minutes: 61,
    reliability: 85,
    interest: 95,
    rating: 94,
    status: "completed",
    discovered_from: "Hacker News",
    notes: "'Complect' — to braid together. Watch again before the architecture review.",
    video: { platform: "InfoQ", channel: "Strange Loop", transcript_url: null },
    authors: [6], topics: [2], subtopics: [3], tags: [3, 5], collections: [1],
  },
  {
    ...blank,
    id: 6,
    title: "Inventing on Principle",
    link: "https://vimeo.com/906418692",
    description:
      "Creators need an immediate connection to what they create. Live demos of instant-feedback tools, and a case for living by a guiding principle.",
    date_added: "2026-03-01",
    published_date: "2012-01-20",
    duration_minutes: 54,
    reliability: 75,
    interest: 90,
    status: "to_read",
    video: { platform: "Vimeo", channel: "CUSEC", transcript_url: null },
    authors: [7], topics: [1, 2], subtopics: [1], tags: [3, 6], collections: [3],
  },
  {
    ...blank,
    id: 7,
    title: "The Mother of All Demos",
    link: "https://www.youtube.com/watch?v=yJDv-zdhzMY",
    description:
      "The 1968 demonstration that introduced the mouse, hypertext, windows, video conferencing and real-time collaborative editing in one sitting.",
    date_added: "2026-03-14",
    published_date: "1968-12-09",
    duration_minutes: 100,
    reliability: 95,
    interest: 80,
    status: "to_read",
    video: { platform: "YouTube", channel: "Doug Engelbart Institute", transcript_url: null },
    authors: [8], topics: [4], subtopics: [6], tags: [1, 3, 6], collections: [3],
  },
  {
    ...blank,
    id: 8,
    title: "As We May Think",
    link: "https://www.theatlantic.com/magazine/archive/1945/07/as-we-may-think/303881/",
    description:
      "Imagines the memex, a desk-sized device for storing and linking books, records and communications — a blueprint for hypertext.",
    date_added: "2026-01-08",
    published_date: "1945-07-01",
    date_started: "2026-01-09",
    date_completed: "2026-01-10",
    word_count: 7600,
    reliability: 90,
    interest: 88,
    rating: 90,
    status: "completed",
    article: { publication: "The Atlantic", publication_url: "https://www.theatlantic.com", doi: null },
    authors: [9], topics: [4], subtopics: [6], tags: [1, 4], collections: [1],
  },
  {
    ...blank,
    id: 9,
    title: "Choose Boring Technology",
    link: "https://mcfunley.com/choose-boring-technology",
    description:
      "Every team gets a few innovation tokens. Spend them wisely — well-understood tools have failure modes you already know.",
    date_added: "2026-02-11",
    published_date: "2015-03-30",
    date_completed: "2026-02-11",
    word_count: 2900,
    reliability: 80,
    interest: 70,
    rating: 82,
    status: "completed",
    discovered_from: "Shared in team Slack",
    article: { publication: "mcfunley.com", publication_url: "https://mcfunley.com", doi: null },
    authors: [10], topics: [2], subtopics: [3], tags: [4, 7], collections: [2],
  },
  {
    ...blank,
    id: 10,
    title: "Things You Should Never Do, Part I",
    link: "https://www.joelonsoftware.com/2000/04/06/things-you-should-never-do-part-i/",
    description:
      "The worst strategic mistake a software company can make: rewriting the code from scratch. Old code isn't rusty — it's been tested.",
    date_added: "2026-03-22",
    published_date: "2000-04-06",
    word_count: 2100,
    reliability: 65,
    interest: 60,
    status: "abandoned",
    notes: "Stopped halfway — the Netscape framing feels dated, though the core point holds.",
    article: { publication: "Joel on Software", publication_url: "https://www.joelonsoftware.com", doi: null },
    authors: [11], topics: [2], subtopics: [4], tags: [4], collections: [],
  },
];

export function buildSeed(): Database {
  return {
    authors,
    topics,
    subtopics,
    tags,
    collections,
    resources: rows.map((r) => ({
      ...r,
      authors: pick(authors, r.authors),
      topics: pick(topics, r.topics),
      subtopics: pick(subtopics, r.subtopics),
      tags: pick(tags, r.tags),
      collections: pick(collections, r.collections),
    })),
  };
}
