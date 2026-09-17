"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ToolLayout } from "@/components/tool-layout";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    document.title = "Something went wrong — DevToolset";
  }, []);

  return (
    <ToolLayout className="max-w-3xl">
      <div className="rounded-lg border border-error/30 bg-error/10 px-6 py-10 text-center">
        <h1 className="text-2xl font-semibold text-foreground">
          Something went wrong
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-secondary">
          The page could not finish loading. Try again, or return to the
          formatter if the problem continues.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button onClick={reset}>Try again</Button>
          <a
            href="/tools/json/formatter"
            className="inline-flex h-9 items-center rounded-md border border-border bg-panel-elevated px-4 text-sm font-medium text-foreground transition-colors hover:bg-panel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Open formatter
          </a>
        </div>
      </div>
    </ToolLayout>
  );
}
