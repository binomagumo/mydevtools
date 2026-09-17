"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getToolsByCategory, toolCategories } from "@/lib/tools";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-full w-[230px] shrink-0 border-r border-border bg-sidebar lg:block">
      <nav className="flex h-full min-w-0 flex-col gap-6 overflow-y-auto px-3 py-4">
        {toolCategories.map((category) => (
          <div key={category} className="min-w-0">
            <p className="mb-2 px-2 text-[11px] font-medium uppercase tracking-[0.12em] text-muted">
              {category}
            </p>
            <ul className="space-y-1">
              {getToolsByCategory(category).map((tool) => {
                const active = pathname === tool.href;
                const Icon = tool.icon;

                return (
                  <li key={tool.id}>
                    <Link
                      href={tool.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative flex min-w-0 items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors",
                        active
                          ? "bg-panel-elevated text-foreground"
                          : "text-secondary hover:bg-panel hover:text-foreground",
                      )}
                    >
                      {active ? (
                        <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-accent" />
                      ) : null}
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          active ? "text-accent" : "text-muted",
                        )}
                      />
                      <span className="truncate">{tool.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
