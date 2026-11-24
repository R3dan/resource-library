import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { TYPE_META } from "@/lib/resources/meta";
import { statusLabel, type ResourceType } from "@/lib/resources/schema";
import type { ListLinkSearch } from "@/lib/resources/search";
import { cn } from "@/lib/utils";

/** Link to a resource's own page, routed by type. */
export function ResourceLink({
  type,
  id,
  className,
  children,
}: {
  type: ResourceType;
  id: number;
  className?: string;
  children: ReactNode;
}) {
  const params = { id: String(id) };
  switch (type) {
    case "book":
      return (
        <Link to="/books/$id" params={params} className={className}>
          {children}
        </Link>
      );
    case "video":
      return (
        <Link to="/videos/$id" params={params} className={className}>
          {children}
        </Link>
      );
    case "article":
      return (
        <Link to="/articles/$id" params={params} className={className}>
          {children}
        </Link>
      );
  }
}

/** Link to a type's list page with filters preset in the URL. */
export function FilteredListLink({
  type,
  search,
  className,
  children,
}: {
  type: ResourceType;
  search: ListLinkSearch;
  className?: string;
  children: ReactNode;
}) {
  switch (type) {
    case "book":
      return (
        <Link to="/books" search={search} className={className}>
          {children}
        </Link>
      );
    case "video":
      return (
        <Link to="/videos" search={search} className={className}>
          {children}
        </Link>
      );
    case "article":
      return (
        <Link to="/articles" search={search} className={className}>
          {children}
        </Link>
      );
  }
}

export function TypeLabel({ type, suffix }: { type: ResourceType; suffix?: string | null }) {
  const meta = TYPE_META[type];
  return (
    <span className={cn("eyebrow inline-flex items-center gap-1.5", meta.text)}>
      <span className={cn("size-1.5 rounded-full", meta.spine)} aria-hidden />
      {meta.label}
      {suffix ? <span className="text-muted-foreground">· {suffix}</span> : null}
    </span>
  );
}

const STATUS_STYLES: Record<string, string> = {
  to_read: "border-border text-muted-foreground",
  in_progress: "border-highlight/40 bg-highlight/10 text-highlight",
  completed: "border-transparent bg-primary text-primary-foreground",
  abandoned: "border-border text-muted-foreground line-through decoration-1",
};

export function StatusPill({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        "eyebrow inline-flex items-center rounded-full border px-2 py-0.5 whitespace-nowrap",
        STATUS_STYLES[status] ?? "border-border text-foreground",
        className,
      )}
    >
      {statusLabel(status)}
    </span>
  );
}

/** 0–100 score as a thin bar. */
export function ScoreMeter({
  label,
  value,
  compact = false,
}: {
  label: string;
  value: number | null;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-3", compact && "gap-2")}>
      {!compact && <span className="eyebrow w-24 text-muted-foreground">{label}</span>}
      <div
        className={cn("relative h-1.5 flex-1 overflow-hidden rounded-full bg-muted", compact && "w-12 flex-none")}
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value ?? undefined}
      >
        {value != null && (
          <div className="absolute inset-y-0 left-0 rounded-full bg-foreground" style={{ width: `${value}%` }} />
        )}
      </div>
      <span className="w-7 text-right font-mono text-xs tabular-nums">{value ?? "—"}</span>
    </div>
  );
}

export function Chip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border border-border bg-card px-2 py-0.5 text-xs text-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}
