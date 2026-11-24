import { Link } from "@tanstack/react-router";
import { LayoutGrid, List, Plus, Search, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TYPE_META } from "@/lib/resources/meta";
import {
  RESOURCE_TYPES,
  SORT_KEYS,
  SORT_LABELS,
  STATUSES,
  statusLabel,
  TYPE_FACET,
  type Lookups,
  type Resource,
  type ResourceType,
  type SortKey,
} from "@/lib/resources/schema";
import type { BrowserSearch, ViewMode } from "@/lib/resources/search";
import { cn } from "@/lib/utils";

import { ResourceCard } from "./ResourceCard";
import { ResourceTable } from "./ResourceTable";

export type BrowserPatch = Partial<BrowserSearch>;

interface ResourceBrowserProps {
  /** Which page this is: the whole library or one type's shelf. */
  scope: ResourceType | "all";
  search: BrowserPatch & { view: ViewMode; sort: SortKey };
  results: Resource[];
  lookups: Lookups;
  onChange: (patch: BrowserPatch, options?: { replace?: boolean }) => void;
}

const ANY = "__any";
const ID_KEYS = ["author", "topic", "subtopic", "tag", "collection"] as const;

export function ResourceBrowser({ scope: type, search, results, lookups, onChange }: ResourceBrowserProps) {
  const facetKey = type === "all" ? null : TYPE_FACET[type];
  const subtopics = search.topic
    ? lookups.subtopics.filter((s) => s.topic_id === search.topic)
    : lookups.subtopics;

  const byId = {
    author: lookups.authors,
    topic: lookups.topics,
    subtopic: lookups.subtopics,
    tag: lookups.tags,
    collection: lookups.collections,
  };

  const active: { key: keyof BrowserPatch; label: string; value: string }[] = [];
  if (search.q) active.push({ key: "q", label: "Search", value: `“${search.q}”` });
  if (search.status) active.push({ key: "status", label: "Status", value: statusLabel(search.status) });
  for (const key of ID_KEYS) {
    const id = search[key];
    if (id === undefined) continue;
    const name = byId[key].find((o) => o.id === id)?.name ?? `#${id}`;
    active.push({ key, label: key, value: name });
  }
  if (facetKey && search[facetKey]) {
    active.push({ key: facetKey, label: facetKey, value: search[facetKey] ?? "" });
  }

  const clearAll = () =>
    onChange({
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
    });

  const title = type === "all" ? "Everything on the shelf" : TYPE_META[type].plural;
  const newType = type === "all" ? "book" : type;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-10 pb-24 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-6 border-b border-border pb-6">
        <div>
          <p className="eyebrow text-muted-foreground">
            {type === "all" ? "The library" : "Shelf"} · {results.length}{" "}
            {results.length === 1 ? "item" : "items"}
          </p>
          <h1 className="mt-2 text-4xl font-medium sm:text-5xl">{title}</h1>
        </div>
        <Button asChild>
          <Link to="/new" search={{ type: newType }}>
            <Plus /> Add {type === "all" ? "resource" : TYPE_META[type].label.toLowerCase()}
          </Link>
        </Button>
      </header>

      {type === "all" && (
        <nav aria-label="Resource type" className="mt-6 flex flex-wrap gap-1">
          {(["all", ...RESOURCE_TYPES] as const).map((t) => {
            const selected = (search.type ?? "all") === t;
            return (
              <button
                key={t}
                type="button"
                aria-pressed={selected}
                onClick={() => onChange({ type: t })}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm transition-colors",
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:border-foreground/40",
                )}
              >
                {t === "all" ? "All" : TYPE_META[t].plural}
              </button>
            );
          })}
        </nav>
      )}

      <section aria-label="Filters" className="mt-6 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <SearchBox value={search.q ?? ""} onCommit={(q) => onChange({ q }, { replace: true })} />
          <div className="ml-auto flex items-center gap-2">
            <Select value={search.sort} onValueChange={(v) => onChange({ sort: v as SortKey })}>
              <SelectTrigger className="h-9 w-auto gap-2 bg-card" aria-label="Sort by">
                <span className="eyebrow text-muted-foreground">Sort</span>
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                {SORT_KEYS.map((k) => (
                  <SelectItem key={k} value={k}>
                    {SORT_LABELS[k]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ViewToggle value={search.view} onChange={(view) => onChange({ view })} />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <FilterSelect
            label="Status"
            value={search.status ?? ""}
            options={STATUSES.map((s) => ({ value: s, label: statusLabel(s) }))}
            onChange={(status) => onChange({ status })}
          />
          <IdFilter label="Author" value={search.author} options={lookups.authors} onChange={(author) => onChange({ author })} />
          <IdFilter
            label="Topic"
            value={search.topic}
            options={lookups.topics}
            onChange={(topic) => onChange({ topic, subtopic: undefined })}
          />
          <IdFilter label="Subtopic" value={search.subtopic} options={subtopics} onChange={(subtopic) => onChange({ subtopic })} />
          <IdFilter label="Tag" value={search.tag} options={lookups.tags} onChange={(tag) => onChange({ tag })} />
          <IdFilter
            label="Collection"
            value={search.collection}
            options={lookups.collections}
            onChange={(collection) => onChange({ collection })}
          />
          {facetKey && type !== "all" && (
            <FilterSelect
              label={TYPE_META[type].facetLabel}
              value={search[facetKey] ?? ""}
              options={lookups[facetKey].map((v) => ({ value: v, label: v }))}
              onChange={(v) => onChange({ [facetKey]: v })}
            />
          )}
        </div>

        {active.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {active.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => onChange({ [f.key]: ID_KEYS.includes(f.key as never) ? undefined : "" })}
                className="group inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs text-accent-foreground transition-colors hover:bg-accent/70"
                aria-label={`Remove ${f.label} filter`}
              >
                <span className="eyebrow text-muted-foreground">{f.label}</span>
                {f.value}
                <X className="size-3 opacity-60 group-hover:opacity-100" />
              </button>
            ))}
            <Button variant="link" size="sm" className="h-auto px-1 text-xs" onClick={clearAll}>
              Clear all
            </Button>
          </div>
        )}
      </section>

      <div className="mt-8">
        {results.length === 0 ? (
          <div className="rounded-md border border-dashed border-border px-6 py-16 text-center">
            <p className="font-display text-2xl">Nothing on this shelf.</p>
            <p className="mt-2 text-sm text-muted-foreground">No resources match these filters.</p>
            {active.length > 0 && (
              <Button variant="outline" className="mt-6" onClick={clearAll}>
                Clear filters
              </Button>
            )}
          </div>
        ) : search.view === "list" ? (
          <ResourceTable resources={results} />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((r) => (
              <ResourceCard key={r.id} resource={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SearchBox({ value, onCommit }: { value: string; onCommit: (q: string) => void }) {
  const [draft, setDraft] = useState(value);

  useEffect(() => setDraft(value), [value]);

  useEffect(() => {
    if (draft === value) return;
    const timer = setTimeout(() => onCommit(draft), 250);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  return (
    <div className="relative w-full sm:w-80">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Search titles, authors, notes…"
        aria-label="Search resources"
        className="h-9 bg-card pl-9"
      />
    </div>
  );
}

function ViewToggle({ value, onChange }: { value: ViewMode; onChange: (v: ViewMode) => void }) {
  const options = [
    { value: "cards", label: "Cards", icon: LayoutGrid },
    { value: "list", label: "List", icon: List },
  ] as const;
  return (
    <div role="group" aria-label="View" className="flex rounded-md border border-border bg-card p-0.5">
      {options.map(({ value: v, label, icon: Icon }) => (
        <button
          key={v}
          type="button"
          aria-pressed={value === v}
          aria-label={`${label} view`}
          title={`${label} view`}
          onClick={() => onChange(v)}
          className={cn(
            "inline-flex h-7 w-8 items-center justify-center rounded-sm transition-colors",
            value === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Icon className="size-4" />
        </button>
      ))}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <Select value={value || ANY} onValueChange={(v) => onChange(v === ANY ? "" : v)}>
      <SelectTrigger
        aria-label={label}
        className={cn("h-9 w-auto min-w-[8rem] gap-2 bg-card", value && "border-foreground/50")}
      >
        <span className="eyebrow text-muted-foreground">{label}</span>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ANY}>Any</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function IdFilter({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: number | undefined;
  options: { id: number; name: string }[];
  onChange: (value: number | undefined) => void;
}) {
  return (
    <FilterSelect
      label={label}
      value={value === undefined ? "" : String(value)}
      options={options.map((o) => ({ value: String(o.id), label: o.name }))}
      onChange={(v) => onChange(v ? Number(v) : undefined)}
    />
  );
}

export function BrowserSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-10 sm:px-6" aria-busy="true">
      <div className="h-4 w-32 animate-pulse rounded bg-muted" />
      <div className="mt-3 h-12 w-80 max-w-full animate-pulse rounded bg-muted" />
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-60 animate-pulse rounded-md bg-muted" />
        ))}
      </div>
    </div>
  );
}
