import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, stripSearchParams, useNavigate } from "@tanstack/react-router";

import { BrowserSkeleton, ResourceBrowser } from "@/components/resources/ResourceBrowser";
import { lookupsQuery, resourceListQuery } from "@/lib/resources/queries";
import { cleanSearch, LIST_DEFAULTS, bookSearchSchema, toFilters } from "@/lib/resources/search";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/books/")({
  // Data comes from the browser-side mock API (localStorage), so render on the client.
  ssr: false,
  validateSearch: bookSearchSchema,
  // Keep URLs short: params equal to their default are dropped.
  search: { middlewares: [stripSearchParams({ ...LIST_DEFAULTS, publisher: "" })] },
  // `view` is presentation only, so it doesn't trigger a reload.
  loaderDeps: ({ search }) => toFilters(search, "book"),
  loader: ({ context: { queryClient }, deps }) =>
    Promise.all([
      queryClient.ensureQueryData(resourceListQuery(deps)),
      queryClient.ensureQueryData(lookupsQuery()),
    ]),
  head: () => pageHead("Books", "Books on your shelf, filterable by status, author, topic, tag, collection and publisher."),
  pendingComponent: BrowserSkeleton,
  component: BooksPage,
});

function BooksPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { data: results } = useSuspenseQuery(resourceListQuery(toFilters(search, "book")));
  const { data: lookups } = useSuspenseQuery(lookupsQuery());

  return (
    <ResourceBrowser
      scope="book"
      search={search}
      results={results}
      lookups={lookups}
      onChange={(patch, options) =>
        navigate({
          search: (prev) => cleanSearch({ ...prev, ...patch }),
          replace: options?.replace ?? false,
        })
      }
    />
  );
}
