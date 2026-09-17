"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import {
  CommandSearch,
  CommandSearchTrigger,
  useCommandSearchShortcut,
} from "@/components/command-search";
import { MobileToolMenu } from "@/components/mobile-tool-menu";
import { Button } from "@/components/ui/button";

function DevToolsetLogo() {
  return (
    <Link href="/tools/json/formatter" className="flex min-w-0 items-center gap-2">
      <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-panel">
        <span className="h-2.5 w-2.5 rotate-45 border border-accent bg-accent/20" />
      </span>
      <span className="truncate text-sm font-semibold tracking-wide text-foreground">
        DEVTOOLSET
      </span>
    </Link>
  );
}

export function AppHeader() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const openSearch = useCallback(() => setSearchOpen(true), []);
  useCommandSearchShortcut(openSearch);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex h-14 min-w-0 items-center gap-3 px-4 sm:px-6 lg:px-8">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 lg:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label="Open tool menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="shrink-0">
            <DevToolsetLogo />
          </div>

          <div className="hidden min-w-0 flex-1 justify-center px-4 md:flex">
            <CommandSearchTrigger onClick={() => setSearchOpen(true)} />
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSearchOpen(true)}
              aria-label="Search tools"
            >
              <SearchIcon />
            </Button>
          </div>
        </div>
      </header>

      <CommandSearch open={searchOpen} onOpenChange={setSearchOpen} />
      <MobileToolMenu open={menuOpen} onOpenChange={setMenuOpen} />
    </>
  );
}

function SearchIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
