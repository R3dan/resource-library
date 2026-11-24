import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { formatDate, formatDuration, sourceOf, TYPE_META, yearOf } from "@/lib/resources/meta";
import { resourceType, type Resource, type ResourceType } from "@/lib/resources/schema";
import type { ListLinkSearch } from "@/lib/resources/search";
import { cn } from "@/lib/utils";

import { Chip, FilteredListLink, ScoreMeter, StatusPill, TypeLabel } from "./bits";

function BackLink({ type }: { type: ResourceType }) {
  const label = `All ${TYPE_META[type].plural.toLowerCase()}`;
  const className =
    "eyebrow inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground";
  const icon = <ArrowLeft className="size-3.5" />;
  switch (type) {
    case "book":
      return <Link to="/books" className={className}>{icon}{label}</Link>;
    case "video":
      return <Link to="/videos" className={className}>{icon}{label}</Link>;
    case "article":
      return <Link to="/articles" className={className}>{icon}{label}</Link>;
  }
}

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="inline-flex items-center gap-0.5 break-all underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
    >
      {children}
      <ArrowUpRight className="size-3 shrink-0" />
    </a>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[7.5rem_1fr] gap-3 py-2">
      <dt className="eyebrow pt-0.5 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-sm">{children}</dd>
    </div>
  );
}

function AsideSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-border pt-5">
      <h2 className="eyebrow mb-3 font-sans text-foreground">{title}</h2>
      {children}
    </section>
  );
}

export function ResourceDetail({ resource: r }: { resource: Resource }) {
  const type = resourceType(r);
  const meta = TYPE_META[type];

  const fields: [string, ReactNode][] = [];
  const add = (label: string, value: ReactNode | null | undefined) => {
    if (value !== null && value !== undefined && value !== "") fields.push([label, value]);
  };

  if (r.book) {
    add("Publisher", r.book.publisher);
    add("Edition", r.book.edition);
    add("Series", r.book.series);
    add("ISBN", r.book.isbn && <span className="font-mono">{r.book.isbn}</span>);
  }
  if (r.video) {
    add("Platform", r.video.platform);
    add("Channel", r.video.channel);
    add("Transcript", r.video.transcript_url && <ExternalLink href={r.video.transcript_url}>Open transcript</ExternalLink>);
  }
  if (r.article) {
    add(
      "Publication",
      r.article.publication &&
        (r.article.publication_url ? (
          <ExternalLink href={r.article.publication_url}>{r.article.publication}</ExternalLink>
        ) : (
          r.article.publication
        )),
    );
    add("DOI", r.article.doi && <ExternalLink href={`https://doi.org/${r.article.doi}`}>{r.article.doi}</ExternalLink>);
  }
  add("Pages", r.page_count?.toLocaleString("en"));
  add("Duration", r.duration_minutes != null ? formatDuration(r.duration_minutes) : null);
  add("Words", r.word_count?.toLocaleString("en"));

  const dates: [string, string | null][] = [
    ["Published", formatDate(r.published_date)],
    ["Added", formatDate(r.date_added)],
    ["Started", formatDate(r.date_started)],
    ["Completed", formatDate(r.date_completed)],
  ];

  const classification = [
    { title: "Topics", key: "topic" as const, items: r.topics },
    { title: "Subtopics", key: "subtopic" as const, items: r.subtopics },
    { title: "Tags", key: "tag" as const, items: r.tags },
    { title: "Collections", key: "collection" as const, items: r.collections },
  ].filter((g) => g.items.length > 0);

  return (
    <article className="mx-auto w-full max-w-6xl px-4 pt-8 pb-24 sm:px-6">
      <BackLink type={type} />

      <div className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0">
          <div className={cn("mb-6 h-1 w-16 rounded-full", meta.spine)} aria-hidden />
          <TypeLabel type={type} suffix={[sourceOf(r), yearOf(r.published_date)].filter(Boolean).join(" · ")} />
          <h1 className="mt-3 text-4xl leading-[1.08] font-medium text-balance sm:text-6xl">{r.title}</h1>

          {r.authors.length > 0 && (
            <p className="mt-5 text-lg text-muted-foreground">
              by{" "}
              {r.authors.map((a, i) => (
                <span key={a.id}>
                  {i > 0 && (i === r.authors.length - 1 ? " & " : ", ")}
                  <FilteredListLink
                    type={type}
                    search={{ author: a.id }}
                    className="text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
                  >
                    {a.name}
                  </FilteredListLink>
                </span>
              ))}
            </p>
          )}

          {r.description && (
            <p className="mt-8 max-w-2xl font-display text-xl leading-relaxed text-foreground/85">{r.description}</p>
          )}

          {r.link && (
            <Button asChild className="mt-8">
              <a href={r.link} target="_blank" rel="noreferrer noopener">
                Open {meta.label.toLowerCase()} <ArrowUpRight />
              </a>
            </Button>
          )}

          <section className="mt-12">
            <h2 className="eyebrow mb-3 font-sans text-muted-foreground">Notes</h2>
            {r.notes ? (
              <div className="rounded-md border border-border bg-card p-6 shadow-card">
                <p className="text-base leading-7 whitespace-pre-line">{r.notes}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No notes yet.</p>
            )}
            {r.discovered_from && (
              <p className="mt-4 text-sm text-muted-foreground">
                <span className="eyebrow mr-2">Found via</span>
                {r.discovered_from}
              </p>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="eyebrow text-muted-foreground">Status</span>
            <StatusPill status={r.status} />
          </div>

          <AsideSection title="Assessment">
            <div className="space-y-3">
              <ScoreMeter label="Rating" value={r.rating} />
              <ScoreMeter label="Interest" value={r.interest} />
              <ScoreMeter label="Reliability" value={r.reliability} />
            </div>
          </AsideSection>

          <AsideSection title="Timeline">
            <dl className="divide-y divide-border/60">
              {dates.map(([label, value]) => (
                <Field key={label} label={label}>
                  <span className={cn("font-mono text-xs", !value && "text-muted-foreground")}>{value ?? "—"}</span>
                </Field>
              ))}
            </dl>
          </AsideSection>

          {fields.length > 0 && (
            <AsideSection title={`${meta.label} details`}>
              <dl className="divide-y divide-border/60">
                {fields.map(([label, value]) => (
                  <Field key={label} label={label}>
                    {value}
                  </Field>
                ))}
              </dl>
            </AsideSection>
          )}

          {r.authors.some((a) => a.affiliation || a.website || a.profile) && (
            <AsideSection title={r.authors.length > 1 ? "Authors" : "Author"}>
              <ul className="space-y-3">
                {r.authors.map((a) => (
                  <li key={a.id} className="text-sm">
                    <div className="font-medium">
                      {a.website ? <ExternalLink href={a.website}>{a.name}</ExternalLink> : a.name}
                    </div>
                    {a.affiliation && <div className="text-muted-foreground">{a.affiliation}</div>}
                    {a.profile && <div className="mt-1 text-xs text-muted-foreground">{a.profile}</div>}
                  </li>
                ))}
              </ul>
            </AsideSection>
          )}

          {classification.map((group) => (
            <AsideSection key={group.title} title={group.title}>
              <div className="flex flex-wrap gap-1.5">
                {group.items.map((item) => (
                  <FilteredListLink key={item.id} type={type} search={{ [group.key]: item.id } as ListLinkSearch}>
                    <Chip className="transition-colors hover:border-foreground/50">
                      {group.key === "tag" ? `#${item.name}` : item.name}
                    </Chip>
                  </FilteredListLink>
                ))}
              </div>
            </AsideSection>
          ))}
        </aside>
      </div>
    </article>
  );
}

export function DetailSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-8 sm:px-6" aria-busy="true">
      <div className="h-4 w-28 animate-pulse rounded bg-muted" />
      <div className="mt-10 h-16 w-3/4 animate-pulse rounded bg-muted" />
      <div className="mt-6 h-5 w-1/3 animate-pulse rounded bg-muted" />
      <div className="mt-10 h-24 w-2/3 animate-pulse rounded bg-muted" />
    </div>
  );
}

export function ResourceNotFound({ type }: { type: ResourceType }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-16 pb-24 text-center sm:px-6">
      <p className="eyebrow text-muted-foreground">Not on the shelf</p>
      <h1 className="mt-3 text-4xl font-medium">We couldn't find that {TYPE_META[type].label.toLowerCase()}.</h1>
      <div className="mt-8">
        <BackLink type={type} />
      </div>
    </div>
  );
}
