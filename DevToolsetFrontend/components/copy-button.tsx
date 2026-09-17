"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CopyButtonProps = {
  value: string;
  disabled?: boolean;
  className?: string;
};

export function CopyButton({ value, disabled = false, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function handleCopy() {
    if (!value) {
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setError(null);
    } catch {
      setError("Unable to copy to clipboard.");
    }
  }

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <Button
        type="button"
        variant="secondary"
        disabled={disabled || !value}
        onClick={handleCopy}
        className={cn(className)}
      >
        {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
        {copied ? "Copied" : "Copy"}
      </Button>
      {error ? <span className="text-xs text-error">{error}</span> : null}
    </div>
  );
}
