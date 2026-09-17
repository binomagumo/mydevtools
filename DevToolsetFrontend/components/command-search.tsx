"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command, Search, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { getToolSearchLabel, tools } from "@/lib/tools";
import { cn } from "@/lib/utils";

type CommandSearchProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CommandSearch({ open, onOpenChange }: CommandSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredTools = tools.filter((tool) => {
    const label = getToolSearchLabel(tool).toLowerCase();
    return (
      label.includes(normalizedQuery) ||
      tool.category.toLowerCase().includes(normalizedQuery) ||
      tool.description.toLowerCase().includes(normalizedQuery)
    );
  });

  function navigateTo(href: string) {
    onOpenChange(false);
    router.push(href);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      ariaLabel="Search tools"
    >
      <DialogContent>
        <div className="border-b border-border p-3">
          <div className="flex min-w-0 items-center gap-2 rounded-md border border-border bg-panel px-3">
            <Search className="h-4 w-4 shrink-0 text-muted" />
            <input
              data-autofocus
              aria-label="Search tools"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search tools..."
              className="min-w-0 flex-1 bg-transparent py-0.5 text-sm text-foreground outline-none placeholder:text-muted"
            />
            {query ? (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setQuery("")}
                className="rounded p-1 text-muted transition-colors hover:bg-panel-elevated hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : null}
          </div>
        </div>
        <div className="max-h-[min(60vh,420px)] overflow-y-auto p-2">
          {filteredTools.length === 0 ? (
            <p className="px-3 py-6 text-sm text-muted">No tools found.</p>
          ) : (
            <ul className="space-y-1">
              {filteredTools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <li key={tool.id}>
                    <button
                      type="button"
                      onClick={() => navigateTo(tool.href)}
                      className="flex w-full min-w-0 items-start gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-panel"
                    >
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-foreground">
                          {getToolSearchLabel(tool)}
                        </span>
                        <span className="block truncate text-xs text-muted">
                          {tool.description}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function CommandSearchTrigger({
  onClick,
  className,
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-w-0 flex-1 items-center gap-2 rounded-md border border-border bg-panel px-3 py-2 text-left text-sm text-muted transition-colors hover:border-border/80 hover:text-secondary max-w-[420px]",
        className,
      )}
    >
      <Search className="h-4 w-4 shrink-0" />
      <span className="min-w-0 flex-1 truncate">Search tools...</span>
      <kbd className="hidden shrink-0 items-center gap-1 rounded border border-border bg-panel-elevated px-1.5 py-0.5 text-[10px] text-muted sm:inline-flex">
        <Command className="h-3 w-3" />K
      </kbd>
    </button>
  );
}

export function useCommandSearchShortcut(onOpen: () => void) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onOpen();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onOpen]);
}
