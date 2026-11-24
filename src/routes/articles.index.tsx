import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, stripSearchParams, useNavigate } from "@tanstack/react-router";

import { BrowserSkeleton, ResourceBrowser } from "@/components/resources/ResourceBrowser";
import { lookupsQuery, resourceListQuery } from "@/lib/resources/queries";
import { cleanSearch, LIST_DEFAULTS, articleSearchSchema, toFilters } from "@/lib/resources/search";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/articles/")({
  // Data comes from the browser-side mock API (localStorage), so render on the client.
  ssr: false,
  validateSearch: articleSearchSchema,
  // Keep URLs short: params equal to their default are dropped.
  search: { middlewares: [stripSearchParams({ ...LIST_DEFAULTS, publication: "" })] },
  // `view` is presentation only, so it doesn't trigger a reload.
  loaderDeps: ({ search }) => toFilters(search, "article"),
  loader: ({ context: { queryClient }, deps }) =>
    Promise.all([
      queryClient.ensureQueryData(resourceListQuery(deps)),
      queryClient.ensureQueryData(lookupsQuery()),
    ]),
  head: () => pageHead("Articles", "Articles and essays on your shelf, filterable by status, author, topic, tag, collection and publication."),
  pendingComponent: BrowserSkeleton,
  component: ArticlesPage,
});

function ArticlesPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { data: results } = useSuspenseQuery(resourceListQuery(toFilters(search, "article")));
  const { data: lookups } = useSuspenseQuery(lookupsQuery());

  return (
    <ResourceBrowser
      scope="article"
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
