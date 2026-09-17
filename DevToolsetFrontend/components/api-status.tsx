"use client";

import { useEffect, useState } from "react";
import { checkApiConnectivity } from "@/lib/api";
import { cn } from "@/lib/utils";

export function ApiStatus() {
  const [online, setOnline] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;

    async function checkStatus() {
      const connected = await checkApiConnectivity();
      if (mounted) {
        setOnline(connected);
      }
    }

    void checkStatus();
    const interval = window.setInterval(() => {
      void checkStatus();
    }, 30000);

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, []);

  if (online === null) {
    return (
      <span className="inline-flex min-w-0 items-center gap-2 text-xs text-muted">
        <span className="h-2 w-2 rounded-full bg-muted" />
        Checking API...
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex min-w-0 items-center gap-2 text-xs",
        online ? "text-secondary" : "text-error",
      )}
    >
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          online ? "bg-success" : "bg-error",
        )}
      />
      {online ? "API Connected" : "API Offline"}
    </span>
  );
}
