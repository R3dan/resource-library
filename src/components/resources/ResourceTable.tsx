import { authorNames, formatDate, lengthOf, yearOf } from "@/lib/resources/meta";
import { resourceType, type Resource } from "@/lib/resources/schema";

import { ResourceLink, ScoreMeter, StatusPill, TypeLabel } from "./bits";

export function ResourceTable({ resources }: { resources: Resource[] }) {
  return (
    <div className="overflow-x-auto rounded-md border border-border bg-card shadow-card">
      <table className="w-full min-w-[760px] text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            {["Title", "Type", "Status", "Length", "Published", "Rating", "Added"].map((h) => (
              <th key={h} scope="col" className="eyebrow px-4 py-3 font-normal text-muted-foreground">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {resources.map((r) => {
            const type = resourceType(r);
            return (
              <tr
                key={r.id}
                className="group relative border-b border-border/70 last:border-0 transition-colors hover:bg-muted/60"
              >
                <td className="max-w-[22rem] px-4 py-3">
                  <ResourceLink
                    type={type}
                    id={r.id}
                    className="font-display text-base font-medium after:absolute after:inset-0 group-hover:underline decoration-1 underline-offset-4"
                  >
                    {r.title}
                  </ResourceLink>
                  {r.authors.length > 0 && (
                    <div className="truncate text-xs text-muted-foreground">{authorNames(r)}</div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <TypeLabel type={type} />
                </td>
                <td className="px-4 py-3">
                  <StatusPill status={r.status} />
                </td>
                <td className="px-4 py-3 font-mono text-xs whitespace-nowrap text-muted-foreground">
                  {lengthOf(r) ?? "—"}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                  {yearOf(r.published_date) ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <ScoreMeter label="Rating" value={r.rating} compact />
                </td>
                <td className="px-4 py-3 font-mono text-xs whitespace-nowrap text-muted-foreground">
                  {formatDate(r.date_added)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
