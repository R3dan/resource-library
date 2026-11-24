import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";

import { DetailSkeleton, ResourceDetail, ResourceNotFound } from "@/components/resources/ResourceDetail";
import { resourceDetailQuery } from "@/lib/resources/queries";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/videos/$id")({
  ssr: false,
  loader: async ({ context: { queryClient }, params }) => {
    const id = Number(params.id);
    if (!Number.isInteger(id)) throw notFound();
    const resource = await queryClient.ensureQueryData(resourceDetailQuery("video", id));
    if (!resource) throw notFound();
    return { title: resource.title, description: resource.description };
  },
  head: ({ loaderData }) =>
    loaderData
      ? pageHead(loaderData.title, loaderData.description ?? "Video on the shelf.")
      : pageHead("Video", "A video in the library.", { noindex: true }),
  pendingComponent: DetailSkeleton,
  notFoundComponent: () => <ResourceNotFound type="video" />,
  component: VideoPage,
});

function VideoPage() {
  const { id } = Route.useParams();
  const { data } = useSuspenseQuery(resourceDetailQuery("video", Number(id)));
  if (!data) return <ResourceNotFound type="video" />;
  return <ResourceDetail resource={data} />;
}
