"use client";

import * as React from "react";
import { useOverlayFocus } from "@/lib/hooks";
import { cn } from "@/lib/utils";

type SheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ariaLabel?: string;
  children: React.ReactNode;
};

export function Sheet({
  open,
  onOpenChange,
  ariaLabel = "Menu",
  children,
}: SheetProps) {
  const sheetRef = React.useRef<HTMLDivElement>(null);
  useOverlayFocus(open, onOpenChange, sheetRef);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        aria-label="Close menu"
        className="absolute inset-0 bg-black/60"
        onClick={() => onOpenChange(false)}
      />
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        tabIndex={-1}
        className="absolute inset-y-0 left-0 w-[min(100vw-3rem,280px)] min-w-0 border-r border-border bg-sidebar shadow-xl outline-none"
      >
        {children}
      </div>
    </div>
  );
}

export function SheetContent({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("flex h-full min-w-0 flex-col", className)}>{children}</div>;
}
