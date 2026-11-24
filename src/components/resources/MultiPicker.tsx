import { Check, ChevronsUpDown, Plus, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Option {
  id: number;
  name: string;
}

/** Multi-select over lookup rows, optionally creating new rows inline. */
export function MultiPicker({
  id,
  options,
  value,
  onChange,
  onCreate,
  placeholder,
  label,
}: {
  id?: string;
  label: string;
  options: Option[];
  value: number[];
  onChange: (ids: number[]) => void;
  onCreate?: ((name: string) => Promise<Option>) | undefined;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);

  const selected = value
    .map((v) => options.find((o) => o.id === v))
    .filter((o): o is Option => o !== undefined);
  const toggle = (optionId: number) =>
    onChange(value.includes(optionId) ? value.filter((v) => v !== optionId) : [...value, optionId]);

  const trimmed = query.trim();
  const canCreate =
    onCreate && trimmed.length > 0 && !options.some((o) => o.name.toLowerCase() === trimmed.toLowerCase());

  const create = async () => {
    if (!onCreate || !trimmed) return;
    setCreating(true);
    try {
      const row = await onCreate(trimmed);
      onChange([...value, row.id]);
      setQuery("");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-label={label}
            aria-expanded={open}
            className="w-full justify-between bg-card font-normal text-muted-foreground"
          >
            {selected.length ? `${selected.length} selected` : placeholder}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search…" value={query} onValueChange={setQuery} />
            <CommandList>
              <CommandEmpty>{onCreate ? "No match — create it below." : "No match."}</CommandEmpty>
              <CommandGroup>
                {options.map((o) => (
                  <CommandItem key={o.id} value={`${o.name}__${o.id}`} onSelect={() => toggle(o.id)}>
                    <Check className={cn("size-4", value.includes(o.id) ? "opacity-100" : "opacity-0")} />
                    {o.name}
                  </CommandItem>
                ))}
              </CommandGroup>
              {canCreate && (
                <CommandGroup forceMount>
                  <CommandItem forceMount value={`__create__${trimmed}`} onSelect={create} disabled={creating}>
                    <Plus className="size-4" />
                    Create “{trimmed}”
                  </CommandItem>
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((o) => (
            <span
              key={o.id}
              className="inline-flex items-center gap-1 rounded-sm border border-border bg-card py-0.5 pr-1 pl-2 text-xs"
            >
              {o.name}
              <button
                type="button"
                onClick={() => toggle(o.id)}
                className="rounded-sm p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label={`Remove ${o.name}`}
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
