import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";

import { DetailSkeleton, ResourceDetail, ResourceNotFound } from "@/components/resources/ResourceDetail";
import { resourceDetailQuery } from "@/lib/resources/queries";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/books/$id")({
  ssr: false,
  loader: async ({ context: { queryClient }, params }) => {
    const id = Number(params.id);
    if (!Number.isInteger(id)) throw notFound();
    const resource = await queryClient.ensureQueryData(resourceDetailQuery("book", id));
    if (!resource) throw notFound();
    return { title: resource.title, description: resource.description };
  },
  head: ({ loaderData }) =>
    loaderData
      ? pageHead(loaderData.title, loaderData.description ?? "Book on the shelf.")
      : pageHead("Book", "A book in the library.", { noindex: true }),
  pendingComponent: DetailSkeleton,
  notFoundComponent: () => <ResourceNotFound type="book" />,
  component: BookPage,
});

function BookPage() {
  const { id } = Route.useParams();
  const { data } = useSuspenseQuery(resourceDetailQuery("book", Number(id)));
  if (!data) return <ResourceNotFound type="book" />;
  return <ResourceDetail resource={data} />;
}
