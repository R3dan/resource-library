import { authorNames, lengthOf, sourceOf, TYPE_META, yearOf } from "@/lib/resources/meta";
import { resourceType, type Resource } from "@/lib/resources/schema";
import { cn } from "@/lib/utils";

import { ResourceLink, ScoreMeter, StatusPill, TypeLabel } from "./bits";

export function ResourceCard({ resource }: { resource: Resource }) {
  const type = resourceType(resource);
  const meta = TYPE_META[type];
  const length = lengthOf(resource);
  const source = sourceOf(resource);

  return (
    <article className="group relative flex overflow-hidden rounded-md border border-border bg-card shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift">
      <div className={cn("w-1.5 shrink-0", meta.spine)} aria-hidden />
      <div className="flex min-w-0 flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <TypeLabel type={type} suffix={yearOf(resource.published_date)} />
          <StatusPill status={resource.status} />
        </div>
        <div>
          <h3 className="text-xl leading-snug font-medium text-balance">
            <ResourceLink
              type={type}
              id={resource.id}
              className="after:absolute after:inset-0 focus-visible:outline-none group-hover:underline decoration-1 underline-offset-4"
            >
              {resource.title}
            </ResourceLink>
          </h3>
          {resource.authors.length > 0 && (
            <p className="mt-1 text-sm text-muted-foreground">{authorNames(resource)}</p>
          )}
        </div>
        {resource.description && (
          <p className="line-clamp-3 text-sm leading-relaxed text-foreground/80">{resource.description}</p>
        )}
        {resource.tags.length > 0 && (
          <p className="font-mono text-xs text-muted-foreground">
            {resource.tags.map((t) => `#${t.name}`).join("  ")}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-dashed border-border pt-3">
          <span className="truncate font-mono text-xs text-muted-foreground">
            {[length, source].filter(Boolean).join(" · ") || "—"}
          </span>
          <ScoreMeter label="Rating" value={resource.rating} compact />
        </div>
      </div>
    </article>
  );
}
