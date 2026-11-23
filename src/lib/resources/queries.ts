import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createAuthor,
  createCollection,
  createResource,
  createTag,
  getLookups,
  getResource,
  listResources,
} from "./api";
import { resourceType, type ResourceCreate, type ResourceFilters, type ResourceType } from "./schema";

export const resourceKeys = {
  all: ["resources"] as const,
  list: (filters: ResourceFilters) => ["resources", "list", filters] as const,
  detail: (type: ResourceType, id: number) => ["resources", "detail", type, id] as const,
  lookups: ["lookups"] as const,
};

export const resourceListQuery = (filters: ResourceFilters) =>
  queryOptions({ queryKey: resourceKeys.list(filters), queryFn: () => listResources(filters) });

export const resourceDetailQuery = (type: ResourceType, id: number) =>
  queryOptions({ queryKey: resourceKeys.detail(type, id), queryFn: () => getResource(type, id) });

export const lookupsQuery = () =>
  queryOptions({ queryKey: resourceKeys.lookups, queryFn: getLookups });

export function useCreateResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ResourceCreate) => createResource(input),
    onSuccess: async (resource) => {
      queryClient.setQueryData(resourceKeys.detail(resourceType(resource), resource.id), resource);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: resourceKeys.all }),
        queryClient.invalidateQueries({ queryKey: resourceKeys.lookups }),
      ]);
    },
  });
}

const creators = { author: createAuthor, tag: createTag, collection: createCollection };

/** Inline creation of authors/tags/collections from the resource form. */
export function useCreateLookup(kind: keyof typeof creators) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => creators[kind](name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: resourceKeys.lookups }),
  });
}
