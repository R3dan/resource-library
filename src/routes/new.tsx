import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { ResourceForm } from "@/components/resources/ResourceForm";
import { TYPE_META } from "@/lib/resources/meta";
import { lookupsQuery } from "@/lib/resources/queries";
import { newSearchSchema } from "@/lib/resources/search";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/new")({
  ssr: false,
  validateSearch: newSearchSchema,
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(lookupsQuery()),
  head: () => pageHead("Add a resource", "Add a book, video or article to your library."),
  component: NewResourcePage,
});

function NewResourcePage() {
  const { type } = Route.useSearch();
  const { data: lookups } = useSuspenseQuery(lookupsQuery());

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pt-10 sm:px-6">
      <header className="pb-8">
        <p className="eyebrow text-muted-foreground">New entry</p>
        <h1 className="mt-2 text-4xl font-medium sm:text-5xl">
          Add a {TYPE_META[type].label.toLowerCase()}
        </h1>
      </header>
      <ResourceForm type={type} lookups={lookups} />
    </div>
  );
}
