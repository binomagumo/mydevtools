import Link from "next/link";
import { ToolLayout } from "@/components/tool-layout";

export const metadata = {
  title: "Page not found — DevToolset",
};

export default function NotFound() {
  return (
    <ToolLayout className="max-w-3xl">
      <div className="rounded-lg border border-border bg-panel px-6 py-10 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted">
          404
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-foreground">
          Page not found
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-secondary">
          That route does not exist. Return to the formatter to continue.
        </p>
        <Link
          href="/tools/json/formatter"
          className="mt-6 inline-flex h-9 items-center rounded-md bg-accent px-4 text-sm font-medium text-white transition-colors hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Open formatter
        </Link>
      </div>
    </ToolLayout>
  );
}
