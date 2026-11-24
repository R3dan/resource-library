import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";

import { DetailSkeleton, ResourceDetail, ResourceNotFound } from "@/components/resources/ResourceDetail";
import { resourceDetailQuery } from "@/lib/resources/queries";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/articles/$id")({
  ssr: false,
  loader: async ({ context: { queryClient }, params }) => {
    const id = Number(params.id);
    if (!Number.isInteger(id)) throw notFound();
    const resource = await queryClient.ensureQueryData(resourceDetailQuery("article", id));
    if (!resource) throw notFound();
    return { title: resource.title, description: resource.description };
  },
  head: ({ loaderData }) =>
    loaderData
      ? pageHead(loaderData.title, loaderData.description ?? "Article on the shelf.")
      : pageHead("Article", "A article in the library.", { noindex: true }),
  pendingComponent: DetailSkeleton,
  notFoundComponent: () => <ResourceNotFound type="article" />,
  component: ArticlePage,
});

function ArticlePage() {
  const { id } = Route.useParams();
  const { data } = useSuspenseQuery(resourceDetailQuery("article", Number(id)));
  if (!data) return <ResourceNotFound type="article" />;
  return <ResourceDetail resource={data} />;
}
