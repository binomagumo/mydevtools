"use client";

import * as React from "react";
import { useOverlayFocus } from "@/lib/hooks";
import { cn } from "@/lib/utils";

type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ariaLabel?: string;
  children: React.ReactNode;
};

export function Dialog({
  open,
  onOpenChange,
  ariaLabel = "Dialog",
  children,
}: DialogProps) {
  const dialogRef = React.useRef<HTMLDivElement>(null);
  useOverlayFocus(open, onOpenChange, dialogRef);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-3 pt-[12vh] sm:px-6">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/60 backdrop-blur-[1px]"
        onClick={() => onOpenChange(false)}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        tabIndex={-1}
        className="relative z-10 w-full max-w-[640px] min-w-0 outline-none"
      >
        {children}
      </div>
    </div>
  );
}

export function DialogContent({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-panel-elevated shadow-xl min-w-0",
        className,
      )}
    >
      {children}
    </div>
  );
}
