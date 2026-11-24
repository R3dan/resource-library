import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, stripSearchParams, useNavigate } from "@tanstack/react-router";

import { BrowserSkeleton, ResourceBrowser } from "@/components/resources/ResourceBrowser";
import { lookupsQuery, resourceListQuery } from "@/lib/resources/queries";
import { cleanSearch, LIST_DEFAULTS, videoSearchSchema, toFilters } from "@/lib/resources/search";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/videos/")({
  // Data comes from the browser-side mock API (localStorage), so render on the client.
  ssr: false,
  validateSearch: videoSearchSchema,
  // Keep URLs short: params equal to their default are dropped.
  search: { middlewares: [stripSearchParams({ ...LIST_DEFAULTS, platform: "" })] },
  // `view` is presentation only, so it doesn't trigger a reload.
  loaderDeps: ({ search }) => toFilters(search, "video"),
  loader: ({ context: { queryClient }, deps }) =>
    Promise.all([
      queryClient.ensureQueryData(resourceListQuery(deps)),
      queryClient.ensureQueryData(lookupsQuery()),
    ]),
  head: () => pageHead("Videos", "Talks and videos on your shelf, filterable by status, author, topic, tag, collection and platform."),
  pendingComponent: BrowserSkeleton,
  component: VideosPage,
});

function VideosPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { data: results } = useSuspenseQuery(resourceListQuery(toFilters(search, "video")));
  const { data: lookups } = useSuspenseQuery(lookupsQuery());

  return (
    <ResourceBrowser
      scope="video"
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
