"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getToolsByCategory, toolCategories } from "@/lib/tools";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "@/components/ui/sheet";

type MobileToolMenuProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function MobileToolMenu({ open, onOpenChange }: MobileToolMenuProps) {
  const pathname = usePathname();

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      ariaLabel="Tool navigation"
    >
      <SheetContent>
        <div className="border-b border-border px-4 py-4">
          <p className="text-sm font-semibold text-foreground">DevToolset</p>
          <p className="text-xs text-muted">Browse tools</p>
        </div>
        <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
          {toolCategories.map((category) => (
            <div key={category} className="mb-6 min-w-0">
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
                        onClick={() => onOpenChange(false)}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex min-w-0 items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors",
                          active
                            ? "bg-panel-elevated text-foreground"
                            : "text-secondary hover:bg-panel hover:text-foreground",
                        )}
                      >
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
      </SheetContent>
    </Sheet>
  );
}
