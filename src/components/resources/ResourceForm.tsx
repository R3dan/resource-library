import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
  EMPTY_FORM,
  resourceFormSchema,
  toResourceCreate,
  type ResourceFormValues,
} from "@/lib/resources/form";
import { TYPE_META } from "@/lib/resources/meta";
import { useCreateLookup, useCreateResource } from "@/lib/resources/queries";
import { RESOURCE_TYPES, STATUSES, statusLabel, type Lookups, type ResourceType } from "@/lib/resources/schema";
import { cn } from "@/lib/utils";

import { MultiPicker } from "./MultiPicker";

type TextField = {
  [K in keyof ResourceFormValues]: ResourceFormValues[K] extends string ? K : never;
}[keyof ResourceFormValues];
type IdsField = "author_ids" | "topic_ids" | "subtopic_ids" | "tag_ids" | "collection_ids";
type ScoreField = "reliability" | "interest" | "rating";

const TYPE_FIELDS: Record<ResourceType, { name: TextField; label: string; placeholder?: string | undefined }[]> = {
  book: [
    { name: "publisher", label: "Publisher", placeholder: "Basic Books" },
    { name: "isbn", label: "ISBN", placeholder: "978-…" },
    { name: "edition", label: "Edition", placeholder: "2nd edition" },
    { name: "series", label: "Series" },
  ],
  video: [
    { name: "platform", label: "Platform", placeholder: "YouTube" },
    { name: "channel", label: "Channel", placeholder: "Strange Loop" },
    { name: "transcript_url", label: "Transcript URL", placeholder: "https://…" },
  ],
  article: [
    { name: "publication", label: "Publication", placeholder: "The Atlantic" },
    { name: "publication_url", label: "Publication URL", placeholder: "https://…" },
    { name: "doi", label: "DOI", placeholder: "10.1000/xyz123" },
  ],
};

export function ResourceForm({ type, lookups }: { type: ResourceType; lookups: Lookups }) {
  const navigate = useNavigate();
  const createResource = useCreateResource();
  const createAuthor = useCreateLookup("author");
  const createTag = useCreateLookup("tag");
  const createCollection = useCreateLookup("collection");

  const form = useForm<ResourceFormValues>({
    resolver: zodResolver(resourceFormSchema),
    defaultValues: EMPTY_FORM,
  });

  const topicIds = form.watch("topic_ids");
  const subtopicOptions = topicIds.length
    ? lookups.subtopics.filter((s) => s.topic_id !== null && topicIds.includes(s.topic_id))
    : lookups.subtopics;

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const resource = await createResource.mutateAsync(toResourceCreate(type, values));
      toast.success(`“${resource.title}” added to the shelf`);
      const params = { id: String(resource.id) };
      if (type === "book") await navigate({ to: "/books/$id", params });
      else if (type === "video") await navigate({ to: "/videos/$id", params });
      else await navigate({ to: "/articles/$id", params });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't save the resource");
    }
  });

  const textField = (name: TextField, label: string, opts: {
      placeholder?: string | undefined;
      type?: string;
      description?: string;
      className?: string;
    } = {}) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={opts.className}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type={opts.type ?? "text"}
              inputMode={opts.type === "number" ? "numeric" : undefined}
              min={opts.type === "number" ? 0 : undefined}
              placeholder={opts.placeholder}
              className="bg-card"
              {...field}
            />
          </FormControl>
          {opts.description && <FormDescription>{opts.description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );

  const idsField = (
    name: IdsField,
    label: string,
    options: { id: number; name: string }[],
    onCreate?: (n: string) => Promise<{ id: number; name: string }>,
  ) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <MultiPicker
            label={label}
            options={options}
            value={field.value}
            onChange={field.onChange}
            onCreate={onCreate}
            placeholder={onCreate ? `Choose or add ${label.toLowerCase()}` : `Choose ${label.toLowerCase()}`}
          />
          <FormMessage />
        </FormItem>
      )}
    />
  );

  const scoreField = (name: ScoreField, label: string, hint: string) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <div className="flex items-baseline justify-between">
            <FormLabel>{label}</FormLabel>
            <span className="flex items-center gap-2">
              <span className="font-mono text-sm tabular-nums">{field.value ?? "—"}</span>
              {field.value !== null && (
                <button
                  type="button"
                  className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                  onClick={() => field.onChange(null)}
                >
                  clear
                </button>
              )}
            </span>
          </div>
          <FormControl>
            <Slider
              min={0}
              max={100}
              step={5}
              value={[field.value ?? 50]}
              onValueChange={([v]) => field.onChange(v ?? null)}
              className={cn(field.value === null && "opacity-40")}
              aria-label={label}
            />
          </FormControl>
          <FormDescription>{hint}</FormDescription>
        </FormItem>
      )}
    />
  );

  const lengthOrder: Record<ResourceType, [TextField, string][]> = {
    book: [["page_count", "Pages"], ["word_count", "Words"], ["duration_minutes", "Minutes (audiobook)"]],
    video: [["duration_minutes", "Minutes"], ["word_count", "Transcript words"], ["page_count", "Pages"]],
    article: [["word_count", "Words"], ["duration_minutes", "Minutes"], ["page_count", "Pages"]],
  };

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} noValidate className="space-y-0">
        <FormSection title="Type" hint="Switching keeps what you've typed.">
          <div role="radiogroup" aria-label="Resource type" className="grid grid-cols-3 gap-2">
            {RESOURCE_TYPES.map((t) => {
              const meta = TYPE_META[t];
              const selected = t === type;
              return (
                <Link
                  key={t}
                  to="/new"
                  search={{ type: t }}
                  replace
                  role="radio"
                  aria-checked={selected}
                  className={cn(
                    "relative overflow-hidden rounded-md border px-4 py-3 text-left transition-all",
                    selected ? "border-foreground bg-card shadow-card" : "border-border hover:border-foreground/40",
                  )}
                >
                  <span className={cn("absolute inset-y-0 left-0 w-1", meta.spine, !selected && "opacity-30")} aria-hidden />
                  <span className="font-display text-lg">{meta.label}</span>
                </Link>
              );
            })}
          </div>
        </FormSection>

        <FormSection title="The basics">
          {textField("title", "Title", { placeholder: "e.g. The Design of Everyday Things" })}
          {idsField("author_ids", "Authors", lookups.authors, (n) => createAuthor.mutateAsync(n))}
          {textField("link", "Link", { placeholder: "https://…", type: "url" })}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea rows={3} className="bg-card" placeholder="What's it about?" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {textField("published_date", "Published", { type: "date", className: "sm:max-w-56" })}
        </FormSection>

        <FormSection title={`${TYPE_META[type].label} details`}>
          <div className="grid gap-5 sm:grid-cols-2">
            {TYPE_FIELDS[type].map((f) => (
              <div key={f.name}>{textField(f.name, f.label, { placeholder: f.placeholder })}</div>
            ))}
          </div>
        </FormSection>

        <FormSection title="Length" hint="Fill in whichever applies.">
          <div className="grid gap-5 sm:grid-cols-3">
            {lengthOrder[type].map(([name, label]) => (
              <div key={name}>{textField(name, label, { type: "number", placeholder: "—" })}</div>
            ))}
          </div>
        </FormSection>

        <FormSection title="Classification">
          {idsField("topic_ids", "Topics", lookups.topics)}
          {idsField("subtopic_ids", "Subtopics", subtopicOptions)}
          {idsField("tag_ids", "Tags", lookups.tags, (n) => createTag.mutateAsync(n))}
          {idsField("collection_ids", "Collections", lookups.collections, (n) => createCollection.mutateAsync(n))}
        </FormSection>

        <FormSection title="Progress">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem className="sm:max-w-56">
                <FormLabel>Status</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="bg-card">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {statusLabel(s)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            {textField("date_started", "Started", { type: "date" })}
            {textField("date_completed", "Completed", { type: "date" })}
          </div>
        </FormSection>

        <FormSection title="Assessment" hint="0–100. Leave untouched to skip.">
          {scoreField("rating", "Rating", "Overall, how good was it?")}
          {scoreField("interest", "Interest", "How much does it interest you?")}
          {scoreField("reliability", "Reliability", "How trustworthy is the source?")}
        </FormSection>

        <FormSection title="Notes">
          {textField("discovered_from", "Discovered from", { placeholder: "A friend, a newsletter, a citation…" })}
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea rows={6} className="bg-card" placeholder="Thoughts, quotes, takeaways" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </FormSection>

        <div className="sticky bottom-0 -mx-4 flex items-center justify-end gap-3 border-t border-border bg-background/90 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
          <Button type="button" variant="ghost" onClick={() => window.history.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={createResource.isPending}>
            {createResource.isPending && <Loader2 className="animate-spin" />}
            Save {TYPE_META[type].label.toLowerCase()}
          </Button>
        </div>
      </form>
    </Form>
  );
}

function FormSection({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="grid gap-6 border-t border-border py-8 md:grid-cols-[12rem_1fr]">
      <div>
        <h2 className="text-xl font-medium">{title}</h2>
        {hint && <p className="mt-1 text-sm text-muted-foreground">{hint}</p>}
      </div>
      <div className="min-w-0 space-y-5">{children}</div>
    </section>
  );
}
