import Link from "next/link";
import { ApiStatus } from "@/components/api-status";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex w-full max-w-[1400px] min-w-0 flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-10">
        <p className="min-w-0 text-sm text-muted">
          © 2026 DevToolset · Built by{" "}
          <a
            href="https://achango.online"
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary underline decoration-from-font underline-offset-2 transition-colors hover:text-foreground"
          >
            Achango
          </a>
        </p>
        <div className="flex min-w-0 flex-wrap items-center gap-4">
          <ApiStatus />
          <Link
            href="/privacy"
            className="text-sm text-secondary transition-colors hover:text-foreground"
          >
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
