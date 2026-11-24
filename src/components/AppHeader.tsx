import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/", label: "Library", exact: true },
  { to: "/books", label: "Books", exact: false },
  { to: "/videos", label: "Videos", exact: false },
  { to: "/articles", label: "Articles", exact: false },
] as const;

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Link to="/" className="flex items-baseline gap-1 font-display text-xl font-semibold tracking-tight">
          Shelfmark<span className="text-highlight">.</span>
        </Link>
        <nav aria-label="Main" className="flex items-center gap-1 overflow-x-auto">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.exact, includeSearch: false }}
              className="rounded-sm px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground data-[status=active]:text-foreground data-[status=active]:underline data-[status=active]:decoration-highlight data-[status=active]:decoration-2 data-[status=active]:underline-offset-8"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Button asChild size="sm" className="ml-auto">
          <Link to="/new" search={{ type: "book" }}>
            <Plus /> <span className="hidden sm:inline">Add resource</span>
          </Link>
        </Button>
      </div>
    </header>
  );
}
